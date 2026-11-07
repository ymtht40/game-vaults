import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { compileFunction } from 'node:vm';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { transform } = require('next/dist/build/swc');
const { NextResponse } = require('next/server');
const root = new URL('../', import.meta.url);
const compiled = new Map();
const quiet = { error() {}, warn() {}, log() {} };
const env = { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-public-key' };
const jsx = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };

async function load(file, imports, globals = {}) {
  if (!compiled.has(file)) {
    const filename = fileURLToPath(new URL(file, root));
    const source = await readFile(filename, 'utf8');
    const { code } = await transform(source, {
      filename, jsc: { parser: { syntax: 'ecmascript', jsx: file.endsWith('.jsx') }, target: 'es2022', transform: { react: { runtime: 'automatic' } } },
      module: { type: 'commonjs' },
    });
    compiled.set(file, compileFunction(code, [
      'exports', 'require', 'module', 'process', 'console', 'window', 'document',
      'setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance',
    ], { filename }));
  }
  const module = { exports: {} };
  compiled.get(file)(
    module.exports, (name) => { assert.ok(Object.hasOwn(imports, name), 'Unexpected import: ' + name); return imports[name]; },
    module, { env: globals.env ?? env }, quiet, globals.window, globals.document,
    globals.setTimeout ?? setTimeout, globals.clearTimeout ?? clearTimeout,
    globals.requestAnimationFrame ?? (() => 1), globals.cancelAnimationFrame ?? (() => {}), globals.performance ?? performance,
  );
  return module.exports;
}

function cache(fn) {
  const values = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!values.has(key)) values.set(key, fn(...args));
    return values.get(key);
  };
}

async function dataModule({ data = [], error = null, reject = false, configuration = env } = {}) {
  const calls = [];
  const query = {
    select(fields) { calls.push(['select', fields]); return query; },
    not(...args) { calls.push(['not', ...args]); return query; },
    order(...args) { calls.push(['order', ...args]); return query; },
    eq(...args) { calls.push(['eq', ...args]); return query; },
    maybeSingle() { return Promise.resolve({ data: data[0] ?? null, error }); },
    then(resolve, fail) {
      return (reject ? Promise.reject(Error('Transport unavailable')) : Promise.resolve({ data, error })).then(resolve, fail);
    },
  };
  const module = await load('src/libs/supabase/latestAnimation.js', {
    react: { cache },
    '@supabase/supabase-js': { createClient: () => ({ from: (table) => { calls.push(['from', table]); return query; } }) },
  }, { env: configuration });
  return { module, calls };
}

test('summary query selects descriptions, both counters and valid date fields without code fields', async () => {
  const { module, calls } = await dataModule();
  await module.getPublishedAnimations({ throwOnError: true });
  const fields = calls.find(([operation]) => operation === 'select')[1].split(',').map((s) => s.trim());
  for (const name of ['description', 'view_count', 'save_count', 'published_at', 'created_at']) assert.ok(fields.includes(name));
  assert.equal(new Set(fields).size, fields.length);
  assert.ok(!fields.some((name) => name.includes('code')));
  assert.ok(calls.some((call) => JSON.stringify(call) === JSON.stringify(['not', 'published_at', 'is', null])));
});

test('null and malformed counters/descriptions normalize safely', async () => {
  const { module } = await dataModule({ data: [
    { id: 'a', description: null, view_count: null, save_count: undefined },
    { id: 'b', description: 'A real description', view_count: '12', save_count: -2 },
    { id: 'c', description: {}, view_count: 'invalid', save_count: Infinity },
  ] });
  const rows = await module.getPublishedAnimations();
  assert.deepEqual(rows.map(({ description, view_count, save_count }) => [description, view_count, save_count]), [
    ['', 0, 0], ['A real description', 12, 0], ['', 0, 0],
  ]);
});

test('layout and strict library consumers share one underlying catalog query', async () => {
  const { module, calls } = await dataModule({ data: [{ id: 'a', category: 'button', published_at: new Date().toISOString() }] });
  await Promise.all([module.getPublishedAnimations(), module.getPublishedAnimations({ throwOnError: true }), module.getLatestAnimation(), module.getCategories(), module.getShippedRecently()]);
  assert.equal(calls.filter(([operation]) => operation === 'from').length, 1);
});

for (const [name, options] of [
  ['database errors', { error: { message: 'Private database diagnostic' } }],
  ['network rejection', { reject: true }],
  ['missing configuration', { configuration: {} }],
]) {
  test('catalog ' + name + ' reaches the library error state without exposing diagnostics', async () => {
    const { module } = await dataModule(options);
    assert.deepEqual(await module.getPublishedAnimations(), []);
    await assert.rejects(module.getPublishedAnimations({ throwOnError: true }), /^Error: Unable to load animations\. Please try again\.$/);
  });
}

test('a successful empty catalog is not a query error', async () => {
  const { module } = await dataModule({ data: null });
  assert.deepEqual(await module.getPublishedAnimations({ throwOnError: true }), []);
  assert.equal(await module.getLatestAnimation(), null);
});

test('detail projection contains each summary field once and preserves detail content', async () => {
  const { module, calls } = await dataModule({ data: [{ id: 'a', description: null, html_code: '<div>Example</div>' }] });
  const row = await module.getAnimationBySlug('example');
  const fields = calls.find(([op]) => op === 'select')[1].split(',').map((field) => field.trim());
  assert.equal(fields.filter((field) => field === 'description').length, 1);
  assert.ok(fields.includes('html_code'));
  assert.equal(row.html_code, '<div>Example</div>');
  assert.equal(row.description, '');
});

const filtering = await load('src/features/animation-page/utils/filterAnimations.js', {});
const categories = [{ value: 'button', label: 'Buttons' }, { value: 'ui-component', label: 'UI Components' }];
const records = [
  { id: 'a', title: 'Magnetic button', description: 'Spring cursor motion', category: 'button', view_count: 5, save_count: 9, published_at: '2025-01-01', is_free_preview: true, metadata: { interaction: ['hover', 'click'] } },
  { id: 'b', title: 'Accordion', description: 'Expandable panels', category: 'ui-component', view_count: 20, save_count: 2, published_at: '2025-03-01', metadata: { interaction: 'click' } },
  { id: 'c', title: null, description: null, category: null, view_count: null, save_count: null, published_at: 'invalid', created_at: '2025-02-01', metadata: null },
];
const ids = (rows) => rows.map(({ id }) => id);
for (const [search, expected] of [
  [' MAGNETIC ', ['a']], ['spring cursor', ['a']], ['BUTTONS', ['a']],
  ['ui components', ['b']], ['ui-component', ['b']], ['expandable', ['b']],
  ['missing', []], ['   ', ['b', 'c', 'a']],
]) {
  test('search matches available text and category labels: ' + JSON.stringify(search), () => {
    assert.deepEqual(ids(filtering.filterAnimations(records, { search, sort: 'new' }, categories)), expected);
  });
}

test('category, interaction, free-only, and search filters compose using AND', () => {
  assert.deepEqual(ids(filtering.filterAnimations(records, { categories: ['button'], interaction: 'hover', freeOnly: true, search: 'cursor' }, categories)), ['a']);
  assert.deepEqual(ids(filtering.filterAnimations(records, { categories: ['button'], interaction: 'drag' }, categories)), []);
  assert.deepEqual(filtering.getInteractions({ metadata: { interaction: { invalid: true } } }), []);
  assert.deepEqual(filtering.getInteractions({ metadata: { interaction: 'click' } }), ['click']);
});

for (const [sort, expected] of [['new', ['b', 'c', 'a']], ['hot', ['b', 'a', 'c']], ['saved', ['a', 'b', 'c']]]) {
  test(sort + ' sorting is correct and does not mutate the input', () => {
    const before = records.map((row) => ({ ...row }));
    assert.deepEqual(ids(filtering.filterAnimations(records, { sort }, categories)), expected);
    assert.deepEqual(records, before);
  });
}

test('recent sorting preserves recently updated items and then publication order', () => {
  const data = records.map((row) => ({ ...row, content_updated_at: row.id === 'a' ? '2025-04-01' : null }));
  assert.deepEqual(ids(filtering.filterAnimations(data, { sort: 'recent' }, categories, Date.parse('2025-04-02'))), ['a', 'b', 'c']);
  assert.deepEqual(ids(filtering.filterAnimations(data, { sort: 'unknown' }, categories, Date.parse('2025-04-02'))), ['a', 'b', 'c']);
});

test('sorting ties, malformed counts, and missing dates have deterministic fallbacks', () => {
  const data = [
    { id: 'z', published_at: 'bad', view_count: 'NaN' },
    { id: 'b', published_at: '2025-01-01', view_count: '4' },
    { id: 'a', published_at: '2025-01-01', view_count: 4 },
  ];
  assert.deepEqual(ids(filtering.filterAnimations(data, { sort: 'hot' })), ['a', 'b', 'z']);
});

function renderer(globals = {}) {
  const slots = [];
  let index = 0;
  let dirty = false;
  let pendingEffects = [];
  let component;
  let props;
  let output;
  const same = (a, b) => a && b && a.length === b.length && a.every((item, i) => Object.is(item, b[i]));
  const react = {
    useState(initial) {
      const position = index++;
      if (!slots[position]) slots[position] = { value: typeof initial === 'function' ? initial() : initial };
      const slot = slots[position];
      return [slot.value, (next) => {
        const value = typeof next === 'function' ? next(slot.value) : next;
        if (!Object.is(value, slot.value)) { slot.value = value; dirty = true; }
      }];
    },
    useRef(initial) {
      const position = index++;
      if (!slots[position]) slots[position] = { current: initial };
      return slots[position];
    },
    useMemo(fn, deps) {
      const position = index++;
      if (!slots[position] || !same(slots[position].deps, deps)) slots[position] = { value: fn(), deps };
      return slots[position].value;
    },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
    useEffect(effect, deps) {
      const position = index++;
      if (!slots[position] || !same(slots[position].deps, deps)) {
        const previous = slots[position];
        slots[position] = { deps, cleanup: previous?.cleanup };
        pendingEffects.push(() => {
          previous?.cleanup?.();
          slots[position].cleanup = effect();
        });
      }
    },
    useContext() { return globals.context?.() ?? null; },
    startTransition(fn) { fn(); },
  };
  const render = (nextProps = props) => {
    props = nextProps;
    for (let attempt = 0; attempt < 30; attempt++) {
      index = 0; dirty = false; pendingEffects = [];
      output = component(props);
      const effects = pendingEffects; pendingEffects = [];
      effects.forEach((fn) => fn());
      if (!dirty) return output;
    }
    assert.fail('State did not stabilize');
  };
  return {
    react, render,
    mount(fn, initialProps) { component = fn; return render(initialProps); },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); },
    get output() { return output; },
  };
}

function find(node, predicate) {
  if (Array.isArray(node)) {
    for (const child of node) { const result = find(child, predicate); if (result) return result; }
  } else if (node?.props) {
    if (predicate(node)) return node;
    return find(node.props.children, predicate);
  }
}
const collection = (tree) => find(tree, (node) => node.type === 'AnimationCollection')?.props;
const navigation = (tree) => find(tree, (node) => node.type === 'AnimationsLibraryNav').props;
const empty = (tree) => find(tree, (node) => node.type === 'EmptyAnimationsState')?.props;

async function libraryHarness({ animations = records, savedIds = [], savedOnly = false, query = '' } = {}) {
  const harness = renderer();
  const timers = new Map();
  let timerId = 0;
  const effects = { filtered: [], searched: [] };
  const frames = [];
  const listeners = new Map();
  let clock = 1000;
  let params = new URLSearchParams(query);
  const window = {
    location: { pathname: savedOnly ? '/animations/saved' : '/animations', search: '' },
    history: { replaceState(state, unused, href) { params = new URL(href, 'https://app.example').searchParams; } },
    scrollTo() {}, innerHeight: 800,
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
  };
  const document = { querySelector: () => null, body: {}, documentElement: {} };
  const globals = {
    window, document,
    performance: { now: () => clock },
    requestAnimationFrame: (fn) => { frames.push(fn); return frames.length; },
    setTimeout: (fn) => { const id = ++timerId; timers.set(id, fn); return id; },
    clearTimeout: (id) => timers.delete(id),
  };
  const infinite = await load('src/hooks/useInfiniteScroll.js', { react: harness.react }, globals);
  const { sortOptions } = await load('src/features/animation-page/utils/sortOptions.js', {});
  const imports = {
    react: harness.react, 'react/jsx-runtime': jsx,
    'next/navigation': { useSearchParams: () => params },
    '@/features/animation-page/sections/AnimationsHero': 'AnimationsHero',
    '@/features/newsletter/NewsletterForm': 'NewsletterForm',
    '@/features/newsletter/StarterPackPopup': 'StarterPackPopup',
    '@/features/animation-page/components/AnimationsLibraryNav': { __esModule: true, default: 'AnimationsLibraryNav', VIEW_MODES: { GRID: 'grid' } },
    '@/features/common/AnimationCollection': { AnimationCollection: 'AnimationCollection' },
    '@/features/common/EmptyAnimationsState': { EmptyAnimationsState: 'EmptyAnimationsState' },
    '@/features/common/EndCta': 'EndCta',
    '@/features/animation-detil/sections/AnimationFAQ': 'FAQ',
    '@/hooks/useInfiniteScroll': infinite,
    '@/libs/analytics/posthogAnalytics': { analytics: { search: {
      filtered: (...args) => effects.filtered.push(args),
      performed: (...args) => effects.searched.push(args),
    } } },
    '@/contexts/AnimationSaveContext': { AnimationSaveContext: { Provider: 'SaveProvider' } },
    '@/features/animation-page/utils/filterAnimations': filtering,
    '@/features/animation-page/utils/sortOptions': { sortOptions },
    '@/contexts/CategoryProvider': { useCategorySlugs: () => categories.map(({ value }) => value), useCategoryOptions: () => categories },
  };
  const module = await load('src/features/animation-page/AnimationsLibrary.jsx', imports, globals);
  let props = { initialAnimations: animations, savedAnimationIds: savedIds, savedOnly, isAuthenticated: true };
  harness.mount(module.default, props);
  return {
    harness, effects,
    get tree() { return harness.render(); },
    get context() { return harness.render().props.value; },
    get query() { return params; },
    loadMore() {
      const props = collection(harness.render());
      props.sentinelRef.current = { parentElement: document.body, getBoundingClientRect: () => ({ top: 1000 }) };
      clock += 200;
      if (frames.length) frames.splice(0).forEach((fn) => fn());
      else listeners.get('scroll')?.();
      return harness.render();
    },
    setQuery(value) { params = new URLSearchParams(value); return harness.render(); },
    refresh(values) { props = { ...props, ...values }; return harness.render(props); },
    flushTimers() { const pending = [...timers.values()]; timers.clear(); pending.forEach((fn) => fn()); return harness.render(); },
  };
}

test('library search, category, interaction and free controls show matching results', async () => {
  const library = await libraryHarness();
  navigation(library.tree).onSearchChange('cursor');
  assert.deepEqual(ids(collection(library.tree).animations), ['a']);
  navigation(library.tree).onFiltersChange(['button']);
  navigation(library.tree).onInteractionChange('hover');
  navigation(library.tree).onFreeChange(true);
  assert.deepEqual(ids(collection(library.tree).animations), ['a']);
  assert.equal(navigation(library.tree).count, 1);
  assert.equal(library.effects.filtered.at(-1)[1], 1);
});

test('library responds to every sorting control and rejects unknown options', async () => {
  const library = await libraryHarness();
  for (const [sort, expected] of [['hot', ['b', 'a', 'c']], ['saved', ['a', 'b', 'c']], ['new', ['b', 'c', 'a']]]) {
    navigation(library.tree).onSortChange(sort);
    assert.deepEqual(ids(collection(library.tree).animations), expected);
    assert.equal(library.query.get('sort'), sort);
  }
  navigation(library.tree).onSortChange('invalid');
  assert.equal(navigation(library.tree).sortBy, 'new');
});

test('filter reset cancels pending debounced search and restores the full library', async () => {
  const library = await libraryHarness();
  navigation(library.tree).onSearchChange('no matches');
  assert.ok(empty(library.tree));
  empty(library.tree).onReset();
  library.flushTimers();
  assert.equal(navigation(library.tree).searchValue, '');
  assert.equal(navigation(library.tree).count, 3);
  assert.equal(library.query.toString(), '');
});

test('URL navigation synchronizes controls while ordinary typing remains immediate', async () => {
  const library = await libraryHarness();
  navigation(library.tree).onSearchChange('cursor');
  assert.equal(navigation(library.tree).searchValue, 'cursor');
  library.setQuery('category=ui-component&search=panels&sort=hot&interaction=click');
  assert.deepEqual(ids(collection(library.tree).animations), ['b']);
  assert.deepEqual(navigation(library.tree).activeFilters, ['ui-component']);
  assert.equal(navigation(library.tree).sortBy, 'hot');
  library.setQuery('category=invalid&interaction=invalid&sort=invalid');
  assert.deepEqual(navigation(library.tree).activeFilters, []);
  assert.equal(navigation(library.tree).sortBy, 'recent');
});

test('refreshed server animation props replace stale initial data', async () => {
  const library = await libraryHarness({ animations: [records[0]] });
  library.refresh({ initialAnimations: [records[1]] });
  assert.deepEqual(ids(collection(library.tree).animations), ['b']);
});

test('optimistic save updates membership, most-saved sorting and survives view changes', async () => {
  const data = records.map((row) => ({ ...row, save_count: row.id === 'b' ? 10 : 9 }));
  const library = await libraryHarness({ animations: data });
  const context = library.context;
  assert.equal(context.beginSave('a'), true);
  context.onSaveChange('a', true, true);
  navigation(library.tree).onSortChange('saved');
  assert.ok(collection(library.tree).savedAnimationIds.includes('a'));
  assert.equal(collection(library.tree).animations.find(({ id }) => id === 'a').save_count, 10);
  navigation(library.tree).onViewModeChange('list');
  assert.equal(collection(library.tree).viewMode, 'list');
  assert.equal(library.context.pendingIds.has('a'), true);
  assert.equal(library.context.beginSave('a'), false);
});

test('saved-only optimistic unsave removes the card and counts; rollback restores both', async () => {
  const library = await libraryHarness({ animations: [records[0]], savedIds: ['a'], savedOnly: true });
  const context = library.context;
  context.beginSave('a');
  context.onSaveChange('a', false, true);
  assert.equal(navigation(library.tree).count, 0);
  assert.equal(navigation(library.tree).freeCount, 0);
  assert.equal(empty(library.tree).heading, 'No saved animations yet.');
  context.onSaveChange('a', true, false);
  context.finishSave('a');
  assert.deepEqual(ids(collection(library.tree).animations), ['a']);
  assert.equal(collection(library.tree).animations[0].save_count, 9);
});

test('fresh server saved IDs do not double-count a completed optimistic save', async () => {
  const library = await libraryHarness({ animations: [records[0]] });
  const context = library.context;
  context.beginSave('a');
  context.onSaveChange('a', true, true);
  context.onSaveChange('a', true, false);
  context.finishSave('a');
  library.refresh({ initialAnimations: [{ ...records[0], save_count: 10 }], savedAnimationIds: ['a'] });
  assert.equal(collection(library.tree).animations[0].save_count, 10);
  assert.deepEqual(collection(library.tree).savedAnimationIds, ['a']);
});

test('a newer server snapshot replaces completed local membership changes', async () => {
  const library = await libraryHarness({ animations: [records[0]] });
  library.context.onSaveChange('a', true, false);
  assert.deepEqual(collection(library.tree).savedAnimationIds, ['a']);
  library.refresh({ initialAnimations: [{ ...records[0] }], savedAnimationIds: [] });
  assert.deepEqual(collection(library.tree).savedAnimationIds, []);
  assert.equal(collection(library.tree).animations[0].save_count, 9);
});

test('counter rollback never produces a negative count', async () => {
  const library = await libraryHarness({ animations: [{ ...records[0], save_count: 0 }], savedIds: ['a'] });
  library.context.onSaveChange('a', false, true);
  assert.equal(collection(library.tree).animations[0].save_count, 0);
});

test('empty catalog, empty saved list and no-match search have appropriate distinct actions', async () => {
  const catalog = await libraryHarness({ animations: [] });
  assert.equal(empty(catalog.tree).heading, 'No animations published yet.');
  assert.equal(empty(catalog.tree).onReset, undefined);
  const saved = await libraryHarness({ animations: [], savedOnly: true });
  assert.equal(empty(saved.tree).actionHref, '/animations');
  const filtered = await libraryHarness({ query: 'search=missing' });
  assert.equal(empty(filtered.tree).query, 'missing');
  assert.equal(typeof empty(filtered.tree).onReset, 'function');
});

test('scrolling appends one batch at a time and stops at the total count', async () => {
  const data = Array.from({ length: 30 }, (_, i) => ({ ...records[0], id: 'item-' + i }));
  const library = await libraryHarness({ animations: data });
  assert.equal(collection(library.tree).animations.length, 12);
  library.loadMore();
  assert.equal(collection(library.tree).animations.length, 24);
  library.loadMore();
  assert.equal(collection(library.tree).animations.length, 30);
  assert.equal(collection(library.tree).hasMore, false);
});

test('pagination retains batches of 12 and resets after filter changes without fetching', async () => {
  const data = Array.from({ length: 30 }, (_, i) => ({
    ...records[i % 3], id: 'item-' + String(i).padStart(2, '0'),
  }));
  const library = await libraryHarness({ animations: data });
  assert.equal(collection(library.tree).animations.length, 12);
  assert.equal(collection(library.tree).hasMore, true);
  navigation(library.tree).onFiltersChange(['button']);
  assert.equal(collection(library.tree).animations.length, 10);
  assert.equal(collection(library.tree).hasMore, false);
  navigation(library.tree).onFiltersChange([]);
  assert.equal(collection(library.tree).animations.length, 12);
  assert.equal(collection(library.tree).hasMore, true);
});

async function saveHarness({ saved = false, id = 'a', response, library, analyticsThrows = false } = {}) {
  const harness = renderer({ context: () => library ?? null });
  const requests = [];
  const notifications = [];
  const routes = [];
  const tracked = [];
  const fetch = async (url, options) => {
    requests.push([url, options]);
    return typeof response === 'function' ? response() : response ?? { ok: true, status: 200, json: async () => ({ success: true }) };
  };
  const globals = { window: { location: { pathname: '/animations', search: '?category=button' } } };
  // fetch is an injected module global so tests never make live API calls.
  const filename = fileURLToPath(new URL('src/hooks/useSaveAnimation.js', root));
  const { code } = await transform(await readFile(filename, 'utf8'), { filename, jsc: { parser: { syntax: 'ecmascript' }, target: 'es2022' }, module: { type: 'commonjs' } });
  const module = { exports: {} };
  const imports = {
    react: harness.react,
    sonner: { toast: { error: (msg) => notifications.push(['error', msg]), success: (msg) => notifications.push(['success', msg]) } },
    '@/libs/analytics/posthogAnalytics': { analytics: { animation: {
      saved: (...args) => { if (analyticsThrows) throw Error('Analytics unavailable'); tracked.push(['saved', ...args]); },
      unsaved: (...args) => tracked.push(['unsaved', ...args]),
    } } },
    '@/libs/utils/events': { serverEvents: { animationSaved: (...args) => tracked.push(['event', ...args]) } },
    '@/contexts/TransitionRouterProvider': { useTransitionRouter: () => ({
      push: (href) => routes.push(['push', href]), refresh: () => routes.push(['refresh']),
    }) },
    '@/contexts/UserProvider': { useUser: () => ({ user: null }) },
    '@/contexts/AnimationSaveContext': { AnimationSaveContext: {} },
  };
  compileFunction(code, ['exports', 'require', 'module', 'console', 'window', 'fetch'], { filename })(
    module.exports, (name) => { assert.ok(Object.hasOwn(imports, name), 'Unexpected dependency: ' + name); return imports[name]; },
    module, quiet, globals.window, fetch,
  );
  let props = { id, saved };
  harness.mount(({ id, saved }) => module.exports.useSaveAnimation(id, saved, records[0]), props);
  return {
    harness, requests, notifications, routes, tracked,
    get current() { return harness.render(); },
    refresh(next) { props = { ...props, ...next }; return harness.render(props); },
  };
}

test('save hook updates immediately, blocks duplicate clicks, and sends only animationId', async () => {
  let resolve;
  const hook = await saveHarness({ response: () => new Promise((done) => { resolve = done; }) });
  const pending = hook.current.toggleSave();
  assert.equal(hook.current.isSaved, true);
  assert.equal(hook.current.isLoading, true);
  assert.equal(await hook.current.toggleSave(), false);
  assert.equal(hook.requests.length, 1);
  assert.deepEqual(JSON.parse(hook.requests[0][1].body), { animationId: 'a' });
  assert.equal(hook.requests[0][1].method, 'POST');
  resolve({ ok: true, status: 200, json: async () => ({ success: true }) });
  assert.equal(await pending, true);
  assert.equal(hook.current.isLoading, false);
  assert.deepEqual(hook.routes, [['refresh']]);
});

test('unsave uses DELETE and preserves the completed result', async () => {
  const hook = await saveHarness({ saved: true });
  assert.equal(await hook.current.toggleSave(), true);
  assert.equal(hook.requests[0][1].method, 'DELETE');
  assert.equal(hook.current.isSaved, false);
});

for (const [name, response] of [
  ['database failure', { ok: false, status: 500 }],
  ['network failure', async () => { throw Error('Offline'); }],
  ['invalid success payload', { ok: true, status: 200, json: async () => ({ success: false }) }],
  ['malformed response', { ok: true, status: 200, json: async () => { throw Error('Bad JSON'); } }],
]) {
  test(name + ' rolls back optimistic state and releases the save control', async () => {
    const hook = await saveHarness({ response });
    assert.equal(await hook.current.toggleSave(), false);
    assert.equal(hook.current.isSaved, false);
    assert.equal(hook.current.isLoading, false);
    assert.equal(hook.notifications[0][0], 'error');
    assert.deepEqual(hook.tracked, []);
    assert.deepEqual(hook.routes, []);
  });
}

test('expired sessions redirect safely and restore optimistic state', async () => {
  const hook = await saveHarness({ response: { ok: false, status: 401 } });
  assert.equal(await hook.current.toggleSave(), false);
  assert.equal(hook.current.isSaved, false);
  assert.equal(hook.current.isLoading, false);
  assert.deepEqual(hook.routes, [['push', '/login?redirectTo=%2Fanimations%3Fcategory%3Dbutton']]);
});

test('guest controls do not issue save or authentication requests', async () => {
  const hook = await saveHarness({ id: null });
  assert.equal(await hook.current.toggleSave(), false);
  assert.equal(hook.requests.length, 0);
  assert.equal(hook.routes[0][0], 'push');
});

test('save does not wait for a client user fetch when the server rendered a valid control', async () => {
  const hook = await saveHarness();
  assert.equal(hook.current.user, null);
  assert.equal(await hook.current.toggleSave(), true);
  assert.equal(hook.requests.length, 1);
});

test('refreshed saved props resynchronize a mounted save control', async () => {
  const hook = await saveHarness();
  hook.refresh({ saved: true });
  assert.equal(hook.current.isSaved, true);
  hook.refresh({ saved: false });
  assert.equal(hook.current.isSaved, false);
});

test('analytics errors cannot roll back a successful database save', async () => {
  const hook = await saveHarness({ analyticsThrows: true });
  assert.equal(await hook.current.toggleSave(), true);
  assert.equal(hook.current.isSaved, true);
  assert.deepEqual(hook.routes, [['refresh']]);
});

test('library pending state blocks another view from making a duplicate save request', async () => {
  const hook = await saveHarness({ library: { pendingIds: new Set(['a']), beginSave: () => assert.fail('Already pending') } });
  assert.equal(hook.current.isLoading, true);
  assert.equal(await hook.current.toggleSave(), false);
  assert.equal(hook.requests.length, 0);
});

test('a failed library save reports a reversible change and always releases the shared lock', async () => {
  const calls = [];
  const hook = await saveHarness({
    response: { ok: false, status: 500 },
    library: {
      pendingIds: new Set(), beginSave: () => true,
      onSaveChange: (...args) => calls.push(['change', ...args]),
      finishSave: (...args) => calls.push(['finish', ...args]),
    },
  });
  await hook.current.toggleSave();
  assert.deepEqual(calls, [['change', 'a', true, true], ['change', 'a', false, false], ['finish', 'a']]);
});

const currentUser = { id: 'verified-user-id' };
async function apiModule({ user = currentUser, authError = null, dbError = null } = {}) {
  const calls = [];
  const builder = {
    insert(value) { calls.push(['insert', value]); return Promise.resolve({ error: dbError }); },
    delete() { calls.push(['delete']); return builder; },
    match(value) { calls.push(['match', value]); return Promise.resolve({ error: dbError }); },
  };
  const sdk = {
    auth: { getUser: async () => ({ data: { user }, error: authError }) },
    from: (table) => { calls.push(['from', table]); return builder; },
  };
  return {
    calls,
    module: await load('src/app/api/animations/save/route.js', {
      'next/server': { NextResponse }, '@supabase/ssr': { createServerClient: () => sdk },
      'next/headers': { cookies: async () => ({ getAll: () => [], set() {} }) },
    }),
  };
}

for (const method of ['POST', 'DELETE']) {
  test(method + ' derives saved-animation ownership from the verified session', async () => {
    const { module, calls } = await apiModule();
    const response = await module[method]({ json: async () => ({ animationId: 'animation-id', user_id: 'attacker-supplied-user' }) });
    assert.equal(response.status, 200);
    const mutation = calls.find(([op]) => op === (method === 'POST' ? 'insert' : 'match'))[1];
    assert.deepEqual(method === 'POST' ? mutation[0] : mutation, { user_id: currentUser.id, animation_id: 'animation-id' });
  });
  test(method + ' rejects unauthenticated users without database requests', async () => {
    const { module, calls } = await apiModule({ user: null });
    const response = await module[method]({ json: async () => ({ animationId: 'animation-id' }) });
    assert.equal(response.status, 401);
    assert.equal(calls.length, 0);
  });
  test(method + ' handles database failures with a generic error', async () => {
    const { module } = await apiModule({ dbError: { code: '42501', message: 'Private diagnostic' } });
    const response = await module[method]({ json: async () => ({ animationId: 'animation-id' }) });
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: 'Database Error' });
  });
}

test('save API rejects an Auth error even when it includes a user object', async () => {
  const { module, calls } = await apiModule({ authError: Error('Invalid session') });
  const response = await module.POST({ json: async () => ({ animationId: 'animation-id' }) });
  assert.equal(response.status, 401);
  assert.equal(calls.length, 0);
});

test('duplicate saves are idempotent through the existing unique constraint handling', async () => {
  const { module } = await apiModule({ dbError: { code: '23505' } });
  assert.equal((await module.POST({ json: async () => ({ animationId: 'animation-id' }) })).status, 200);
});

test('saved route shows only the verified viewer IDs and requests real error handling', async () => {
  const calls = [];
  const { default: page } = await load('src/app/animations/saved/page.jsx', {
    react: { Suspense: 'Suspense' }, 'react/jsx-runtime': jsx,
    'next/navigation': { redirect: () => assert.fail('Should remain authenticated') },
    '@/features/animation-page/AnimationsLibrary': 'AnimationsLibrary',
    '@/libs/supabase/latestAnimation': { getPublishedAnimations: async (options) => { calls.push(options); return records; } },
    '@/libs/supabase/server': { getViewerContext: async (options) => { calls.push(options); return { user: currentUser, savedIds: ['b'] }; } },
  });
  const tree = await page();
  assert.deepEqual(ids(tree.props.children.props.initialAnimations), ['b']);
  assert.equal(tree.props.children.props.savedOnly, true);
  assert.deepEqual(calls, [{ throwOnSavedError: true }, { throwOnError: true }]);
});

test('saved-data query errors can reach the library error boundary without changing default viewer behavior', async () => {
  const builder = {
    select() { return builder; }, eq() { return builder; },
    maybeSingle: async () => ({ data: null, error: null }),
    then(resolve, reject) { return Promise.resolve({ data: null, error: Error('Unavailable') }).then(resolve, reject); },
  };
  const module = await load('src/libs/supabase/server.js', {
    'next/headers': { cookies: async () => ({ getAll: () => [], set() {} }) },
    '@supabase/ssr': { createServerClient: () => ({
      auth: { getUser: async () => ({ data: { user: currentUser }, error: null }) }, from: () => builder,
    }) },
  });
  assert.deepEqual((await module.getViewerContext()).savedIds, []);
  await assert.rejects(module.getViewerContext({ throwOnSavedError: true }), /Unable to load saved animations/);
});

test('library error retry refreshes server data and resets the error boundary', async () => {
  const calls = [];
  const { default: ErrorState } = await load('src/app/animations/error.jsx', {
    react: { startTransition: (fn) => fn() }, 'react/jsx-runtime': jsx,
    'next/navigation': { useRouter: () => ({ refresh: () => calls.push('refresh') }) },
    '@/features/common/EmptyAnimationsState': { EmptyAnimationsState: 'EmptyAnimationsState' },
  });
  const state = ErrorState({ reset: () => calls.push('reset') }).props.children.props;
  assert.equal(state.role, 'alert');
  assert.equal(state.actionLabel, 'Try again');
  state.onReset();
  assert.deepEqual(calls, ['refresh', 'reset']);
});

test('route loading state reuses the existing loader with accessible status', async () => {
  const { default: Loading } = await load('src/app/animations/loading.jsx', {
    'react/jsx-runtime': jsx, '@/components/ui/Loader': 'Loader',
  });
  const tree = Loading();
  assert.equal(tree.props['aria-busy'], 'true');
  assert.ok(find(tree, (node) => node.type === 'Loader'));
});
