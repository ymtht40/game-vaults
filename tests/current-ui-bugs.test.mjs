import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { compileFunction } from 'node:vm';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { transform } = require('next/dist/build/swc');
const React = require('react');
const phosphorIcons = await import('@phosphor-icons/react');
const { renderToStaticMarkup } = require('react-dom/server');
const realJsx = require('react/jsx-runtime');
const root = fileURLToPath(new URL('../', import.meta.url));
const compiled = new Map();
const quiet = { warn() {}, error() {}, log() {} };
const jsx = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
async function load(file, imports = {}, globals = {}) {
  if (!compiled.has(file)) {
    const filename = path.join(root, file);
    const { code } = await transform(await readFile(filename, 'utf8'), {
      filename, jsc: { parser: { syntax: 'ecmascript', jsx: true }, target: 'es2022', transform: { react: { runtime: 'automatic' } } },
      module: { type: 'commonjs' },
    });
    compiled.set(file, compileFunction(code, [
      'exports', 'require', 'module', 'process', 'console', 'window', 'document', 'navigator', 'fetch',
      'FileReader', 'ResizeObserver', 'MutationObserver', 'requestAnimationFrame', 'cancelAnimationFrame',
      'setTimeout', 'clearTimeout', 'CustomEvent',
    ], { filename }));
  }
  const module = { exports: {} };
  compiled.get(file)(
    module.exports, (name) => {
      if (Object.hasOwn(imports, name)) return imports[name];
      if (name === '@phosphor-icons/react') return phosphorIcons;
      assert.ok(!name.startsWith('@/'), 'Unmocked application dependency: ' + name);
      return require(name);
    }, module, { env: {} }, quiet, globals.window, globals.document, globals.navigator,
    globals.fetch ?? (() => assert.fail('Unexpected network request')),
    globals.FileReader, globals.ResizeObserver ?? class { observe() {} disconnect() {} },
    globals.MutationObserver ?? class { observe() {} disconnect() {} },
    globals.requestAnimationFrame ?? (() => 1), globals.cancelAnimationFrame ?? (() => {}),
    globals.setTimeout ?? (() => 1), globals.clearTimeout ?? (() => {}),
    class CustomEvent { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
  );
  return module.exports;
}
function find(node, predicate) {
  if (Array.isArray(node)) {
    for (const child of node) { const found = find(child, predicate); if (found) return found; }
  } else if (node?.props) {
    if (predicate(node)) return node;
    return find(node.props.children, predicate);
  }
}
function renderer({ attach = () => {} } = {}) {
  const slots = [];
  let index = 0, changed = false, effects = [], component, props, output;
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const react = {
    useState(initial) {
      const id = index++;
      if (!slots[id]) slots[id] = { value: typeof initial === 'function' ? initial() : initial };
      const slot = slots[id];
      return [slot.value, (next) => {
        const value = typeof next === 'function' ? next(slot.value) : next;
        if (!Object.is(value, slot.value)) { slot.value = value; changed = true; }
      }];
    },
    useRef(value) { const id = index++; return slots[id] ?? (slots[id] = { current: value }); },
    useMemo(fn, deps) {
      const id = index++;
      if (!slots[id] || !same(slots[id].deps, deps)) slots[id] = { value: fn(), deps };
      return slots[id].value;
    },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
    useEffect(fn, deps) {
      const id = index++;
      if (!slots[id] || !same(slots[id].deps, deps)) {
        const old = slots[id];
        slots[id] = { deps, cleanup: old?.cleanup };
        effects.push(() => { old?.cleanup?.(); slots[id].cleanup = fn(); });
      }
    },
    useLayoutEffect(fn, deps) { return react.useEffect(fn, deps); },
    useContext() { return null; },
  };
  function render(next = props) {
    props = next;
    for (let i = 0; i < 30; i++) {
      index = 0; changed = false; effects = [];
      output = component(props); attach(output);
      effects.forEach((run) => run());
      if (!changed) return output;
    }
    assert.fail('Effects did not stabilize');
  }
  return { react, render, mount(fn, initial) { component = fn; return render(initial); }, unmount() { slots.forEach(slot => slot?.cleanup?.()); } };
}
function browser() {
  const listeners = new Map(), timers = new Map(), storage = new Map(), writes = [], classes = new Set();
  const media = new Map(); let next = 0;
  const window = {
    innerHeight: 900, innerWidth: 800, scrollY: 0,
    location: { pathname: '/animations', search: '' },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem(key, value) { writes.push([key, value]); storage.set(key, value); } },
    addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
    removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
    dispatchEvent(event) { listeners.get(event.type)?.forEach(fn => fn(event)); },
    setTimeout(fn, delay) { const id = ++next; timers.set(id, { fn, delay }); return id; },
    clearTimeout: id => timers.delete(id),
    matchMedia(query) {
      if (!media.has(query)) media.set(query, {
        matches: false, callbacks: new Set(),
        addEventListener(name, fn) { this.callbacks.add(fn); },
        removeEventListener(name, fn) { this.callbacks.delete(fn); },
      });
      return media.get(query);
    },
  };
  const document = {
    documentElement: { classList: { toggle(name, value) { value ? classes.add(name) : classes.delete(name); }, remove: name => classes.delete(name) } },
    body: {}, querySelector: () => null, querySelectorAll: () => [], fonts: undefined,
    addEventListener: window.addEventListener.bind(window), removeEventListener: window.removeEventListener.bind(window),
  };
  return {
    window, document, listeners, timers, storage, writes, classes, media,
    emit: (name, event) => listeners.get(name)?.forEach(fn => fn(event)),
    fireTimer() { const [id, task] = timers.entries().next().value; timers.delete(id); task.fn(); return task.delay; },
  };
}
const tick = () => new Promise(setImmediate);

const dismissalKey = 'anm_starter_prompt_dismissed_v1';
async function popupHarness(props = {}) {
  const dom = browser(), harness = renderer();
  const { default: Popup } = await load('src/features/newsletter/StarterPackPopup.jsx', {
    react: harness.react, 'react/jsx-runtime': jsx,
    '@/features/newsletter/NewsletterForm': { __esModule: true, default: 'NewsletterForm', STARTER_PROMPT_DISMISSED_KEY: dismissalKey,
      markStarterPromptDismissed: () => assert.fail('A read must not dismiss the popup') },
    '@/features/common/Dialog': Object.fromEntries(['Dialog', 'DialogContent', 'DialogClose', 'DialogTitle', 'DialogDescription'].map(name => [name, name])),
    '@phosphor-icons/react': { X: 'X' },
  }, dom);
  let current = props; harness.mount(Popup, current);
  return { ...dom, harness, get tree() { return harness.render(); }, refresh(next) { current = { ...current, ...next }; return harness.render(current); } };
}
test('checking popup eligibility never writes a dismissal timestamp', async () => {
  const popup = await popupHarness();
  assert.equal(popup.writes.length, 0);
  assert.equal(popup.timers.size, 1);
  assert.equal(popup.fireTimer(), 30000);
  assert.equal(popup.tree.props.open, true);
  assert.equal(popup.writes.length, 0);
});
for (const [name, age] of [['recent', 1000], ['expired', 2592000001]]) {
  test(name + ' popup dismissal respects the existing 30-day limit', async () => {
    const popup = await popupHarness({ isAuthenticated: true });
    popup.storage.set(dismissalKey, String(Date.now() - age));
    popup.refresh({ isAuthenticated: false });
    assert.equal(popup.timers.size, name === 'recent' ? 0 : 1);
  });
}
test('custom dismissal keys and close actions preserve both stored timestamps', async () => {
  const popup = await popupHarness({ storageKey: 'custom-dismissal' });
  popup.fireTimer(); popup.tree.props.onOpenChange(false);
  assert.equal(popup.tree.props.open, false);
  assert.ok(popup.storage.has(dismissalKey));
  assert.ok(popup.storage.has('custom-dismissal'));
});
test('future or malformed popup timestamps do not suppress the prompt indefinitely', async () => {
  for (const value of ['invalid', '123xyz', String(Date.now() + 60000)]) {
    const popup = await popupHarness({ isAuthenticated: true });
    popup.storage.set(dismissalKey, value); popup.refresh({ isAuthenticated: false });
    assert.equal(popup.timers.size, 1); popup.harness.unmount();
  }
});
test('a visible starter-pack band delays the popup and unmount clears timers', async () => {
  const popup = await popupHarness();
  popup.document.querySelector = () => ({ getBoundingClientRect: () => ({ top: 20, bottom: 300 }) });
  popup.fireTimer(); assert.equal(popup.tree.props.open, false);
  assert.equal(popup.timers.values().next().value.delay, 15000);
  popup.harness.unmount(); assert.equal(popup.timers.size, 0);
});
test('authenticated users never see a popup and signing in closes an open one', async () => {
  const popup = await popupHarness(); popup.fireTimer();
  popup.refresh({ isAuthenticated: true }); assert.equal(popup.tree, null);
  popup.refresh({ isAuthenticated: false }); assert.equal(popup.tree.props.open, false);
});

const templateBuilder = await load('src/features/animation-detil/utils/templateBuilder.js', {
  '@/features/animation-detil/utils/timelineCaptureScript': { timelineCaptureScript: '<!-- fixture timeline -->' },
  '@/features/animation-detil/utils/shortcutBridgeScript': { shortcutBridgeScript: '<!-- fixture shortcut -->' },
});
async function previewHarness({ response, inline, props = {} } = {}) {
  const harness = renderer(), requests = [];
  const { usePreviewDocument } = await load('src/hooks/usePreviewDocument.js', {
    react: harness.react,
    '@/features/animation-detil/utils/templateBuilder': templateBuilder,
    '@/features/animation-detil/utils/inlinePreviewAssets': { inlinePreviewAssets: inline ?? (async html => html) },
  }, { fetch: async url => { requests.push(url); return typeof response === 'function' ? response() : response ?? { ok: false }; } });
  let current = { htmlCode: '<button>Fixture</button>', cssCode: 'button { color: red; }', jsCode: '', ...props };
  harness.mount(usePreviewDocument, current);
  return { harness, requests, get value() { return harness.render(); }, refresh(next) { current = { ...current, ...next }; return harness.render(current); } };
}
test('a missing preview template uses the existing fallback instead of a 404 document', async () => {
  const preview = await previewHarness(); await tick();
  assert.equal(preview.value.isLoading, false);
  assert.ok(preview.value.srcdoc.includes('<button>Fixture</button>'));
  assert.ok(preview.value.srcdoc.includes('button { color: red; }'));
});
test('a successful response without the template placeholder also uses the fallback', async () => {
  const preview = await previewHarness({ response: { ok: true, text: async () => '<html>Not found</html>' } }); await tick();
  assert.ok(!preview.value.srcdoc.includes('Not found'));
  assert.ok(preview.value.srcdoc.includes('Fixture'));
});
test('valid templates are reused without synthesizing replacement files', async () => {
  const preview = await previewHarness({ response: { ok: true, text: async () => '<html><style>{{ANIMATION_CSS}}</style><body>{{ANIMATION_HTML}}{{ANIMATION_SCRIPTS}}</body></html>' } }); await tick();
  assert.equal(preview.value.isLoading, false);
  assert.ok(preview.value.srcdoc.includes('<body><button>Fixture</button>'));
  assert.deepEqual(preview.requests, ['/animations/templates/instant.html']);
});
test('an asset-processing failure releases the preview loading state', async () => {
  const preview = await previewHarness({ inline: async () => { throw Error('Image conversion failed'); } }); await tick();
  assert.equal(preview.value.isLoading, false);
  assert.ok(preview.value.srcdoc.includes('<button>Fixture</button>'));
});
test('external and server-rendered previews skip unnecessary template requests', async () => {
  const preview = await previewHarness({ props: { enabled: false } }); await tick();
  assert.equal(preview.requests.length, 0);
  assert.equal(preview.value.isLoading, false);
  preview.refresh({ enabled: true }); await tick();
  assert.equal(preview.requests.length, 1);
});
test('template selection changes return to loading and stale responses are ignored', async () => {
  const pending = [];
  const preview = await previewHarness({ response: () => new Promise(resolve => pending.push(resolve)) });
  preview.refresh({ category: 'shader' });
  assert.deepEqual(preview.requests, ['/animations/templates/instant.html', '/animations/templates/shader.html']);
  pending[1]({ ok: true, text: async () => '<main id="current">{{ANIMATION_HTML}}</main>' }); await tick();
  pending[0]({ ok: true, text: async () => '<main id="stale">{{ANIMATION_HTML}}</main>' }); await tick();
  assert.ok(preview.value.srcdoc.includes('id="current"'));
  assert.ok(!preview.value.srcdoc.includes('id="stale"'));
});
for (const event of ['onerror', 'onabort']) {
  test('FileReader ' + event + ' preserves the original asset without hanging', async () => {
    const { inlinePreviewAssets } = await load('src/features/animation-detil/utils/inlinePreviewAssets.js', {}, {
      fetch: async () => ({ ok: true, blob: async () => ({}) }),
      FileReader: class { readAsDataURL() { this[event](); } },
    });
    const html = '<img src="/preview-assets/fixture.png">';
    assert.equal(await inlinePreviewAssets(html), html);
  });
}

const classNames = await load('src/libs/utils/className.js');
const coreTooltip = await load('src/components/ui/Tooltip.jsx', {
  react: React, 'react/jsx-runtime': realJsx,
  '@/libs/utils/className': classNames,
});
test('the tooltip component exports the actual Radix provider', () => {
  assert.equal(coreTooltip.TooltipProvider, require('@radix-ui/react-tooltip').Provider);
});
test('framework guides use the existing animated tooltip components', async () => {
  const { default: Guides } = await load('src/features/animation-page/components/FrameworkGuides.jsx', {
    'react/jsx-runtime': jsx,
    '@/components/ui/Tooltip': { TooltipManager: 'TooltipManager' },
    '@/features/animation-page/components/FrameworkGuideLink': 'FrameworkGuideLink',
  });
  const tree = Guides({ animation: { slug: 'fixture', react_code: 'component' } });
  assert.equal(find(tree, node => node.type === 'TooltipManager').props.delayDuration, 250);
  const { default: Link } = await load('src/features/animation-page/components/FrameworkGuideLink.jsx', {
    'react/jsx-runtime': jsx, 'next/link': 'Link',
    '@/libs/utils/className': classNames,
    '@/assets/icons/HtmlIcon': 'Html', '@/assets/icons/ReactIcon': 'React', '@/assets/icons/VueIcon': 'Vue',
    '@/components/ui/Tooltip': { HoverArea: 'HoverArea' },
    '@/hooks/useTransitionLinkClick': { useTransitionLinkClick: () => () => {} },
  });
  assert.equal(Link({ slug: 'fixture', framework: 'react' }).type, 'HoverArea');
});
test('PPP tooltip consumers use supported exports and render with a real Radix provider', async () => {
  for (const [file, exported] of [
    ['src/features/marketing/Pppbanner.jsx', 'PppTooltipBadge'],
    ['src/features/pricing/components/PppLabel.jsx', 'PppLabel'],
  ]) {
    const module = await load(file, {
      react: React, 'react/jsx-runtime': realJsx, 'next/navigation': { usePathname: () => '/' },
      '@/components/ui/Tooltip': coreTooltip,
      '@/libs/utils/i18n': { t: key => key, translate: key => key },
      '@/hooks/usePppGeo': { usePppGeo: () => ({ country: 'US', tier: 'T2' }) },
      '@/features/marketing/Ppppricing': { getPppDiscountPercent: () => 30 },
      '@/libs/utils/ppp': { getPppDiscountPercent: () => 30 },
    });
    assert.ok(renderToStaticMarkup(React.createElement(module[exported])).includes('pricing.tiers.pppName'));
  }
});

const fixtureAnimation = { id: 'fixture-id', slug: 'fixture', title: 'Fixture', category: 'button', html_code: '<button>Fixture</button>', css_code: '', metadata: {} };
const editorState = require('@codemirror/state');
const realEditorView = require('@codemirror/view');
async function viewerHarness({ animation = fixtureAnimation, codeState = { html: fixtureAnimation.html_code }, defaultPlatform, clipboardFails = false, execResult = true } = {}) {
  const dom = browser(), views = [], notifications = [], copied = [], tracked = [], events = [], editCalls = [];
  const parent = {};
  const harness = renderer({ attach(tree) {
    const editor = find(tree, node => node.type === 'div' && node.props.className === 'h-full overflow-auto');
    if (editor) editor.props.ref.current = parent;
  } });
  class EditorView {
    static updateListener = realEditorView.EditorView.updateListener;
    constructor(options) { this.state = options.state; this.destroyed = false; views.push(this); }
    destroy() { this.destroyed = true; }
    dispatch(transaction) {
      this.state = transaction.state;
      for (const listener of this.state.facet(EditorView.updateListener)) listener({ docChanged: transaction.docChanged, state: this.state, transactions: [transaction] });
    }
  }
  dom.document.execCommand = () => {
    if (execResult) dom.listeners.get('copy')?.forEach(fn => fn({ clipboardData: { setData: (...args) => copied.push(args) }, preventDefault() {} }));
    return execResult;
  };
  const imports = {
    react: harness.react, 'react/jsx-runtime': jsx,
    '@/features/common/PlatformSwitcher': { PlatformSwitcher: 'PlatformSwitcher', PLATFORM_LIST: ['react', 'vue', 'html', 'webflow'] },
    sonner: { toast: { success: msg => notifications.push(['success', msg]), error: msg => notifications.push(['error', msg]) } },
    '@codemirror/state': editorState,
    '@codemirror/view': { EditorView, lineNumbers: realEditorView.lineNumbers },
    '@/libs/analytics/posthogAnalytics': { analytics: { track: (...args) => tracked.push(args), animation: { copied: (...args) => tracked.push(['copied', ...args]) }, feature: { codeViewerOpened() {} } } },
    '@/libs/utils/events': { sendServerEvent: (...args) => events.push(args) },
    '@/libs/utils/className': classNames,
    '@/libs/config/onboarding': { EVENTS: { tuned: 'tuned', copied: 'copied' } },
    '@/contexts/OnboardingProvider': { useOnboarding: () => ({ active: false, steps: { copy: true } }) },
    '@/libs/utils/formatCode': { getLanguage: () => 'html', formatCode: code => code },
    '@/libs/code/anmEditorTheme': { anmEditorTheme: [] }, '@/libs/code': { anmThemeExtensions: [] },
    '@/components/ui/Tooltip': Object.fromEntries(['HoverArea','TooltipManager','TooltipProvider','TooltipRoot','TooltipTrigger','TooltipContent'].map(name => [name, name])),
  };
  const globals = {
    ...dom,
    navigator: { clipboard: { writeText: async text => { if (clipboardFails) throw Error('Denied'); copied.push(['text', text]); } } },
    setTimeout: dom.window.setTimeout.bind(dom.window), clearTimeout: dom.window.clearTimeout,
  };
  const module = await load('src/features/common/CodeViewer.jsx', imports, globals);
  let props = { animation, codeState, defaultPlatform, onCodeChange: (...args) => editCalls.push(args) };
  harness.mount(module.CodeViewer, props);
  return { module, views, notifications, copied, tracked, events, editCalls, harness, dom,
    get tree() { return harness.render(); },
    refresh(next) { props = { ...props, ...next }; return harness.render(props); } };
}
test('the existing GSAP notice renders independently without a TooltipProvider error', async () => {
  const fake = await viewerHarness();
  const { McpNotice } = await load('src/features/common/CodeViewer.jsx', {
    react: React, 'react/jsx-runtime': realJsx,
    '@/features/common/PlatformSwitcher': { PlatformSwitcher: () => null, PLATFORM_LIST: [] },
    sonner: { toast: {} }, '@/libs/analytics/posthogAnalytics': { analytics: {} },
    '@/libs/utils/events': {}, '@/libs/utils/className': classNames,
    '@/libs/config/onboarding': { EVENTS: {} }, '@/contexts/OnboardingProvider': {},
    '@/libs/utils/formatCode': {}, '@/libs/code/anmEditorTheme': {}, '@/libs/code': {},
    '@/components/ui/Tooltip': coreTooltip,
  });
  assert.ok(renderToStaticMarkup(React.createElement(McpNotice, { showMcp: false })).includes('Needs GSAP'));
  fake.harness.unmount();
});
test('the detail footer uses the existing notice rather than a second viewer without required props', async () => {
  const source = await readFile(path.join(root, 'src/features/animation-detil/AnimationDetailPage.jsx'), 'utf8');
  assert.ok(source.includes('{ CodeViewer, McpNotice }'));
  assert.ok(source.includes('<McpNotice showMcp={false} />'));
  assert.ok(!source.includes('CodeViewer as CodeViewerFooter'));
});
test('unsupported preferred frameworks fall back to available code on the first render', async () => {
  const viewer = await viewerHarness({ defaultPlatform: 'vue' });
  assert.equal(find(viewer.tree, node => node.type === 'PlatformSwitcher').props.activePlatform, 'html');
  assert.equal(viewer.views.at(-1).state.doc.toString(), fixtureAnimation.html_code);
  viewer.harness.unmount();
});
test('framework and code-tab controls update the editor and release replaced editor views', async () => {
  const animation = { ...fixtureAnimation, react_code: 'export default function Fixture() {}' };
  const viewer = await viewerHarness({ animation, codeState: { html: fixtureAnimation.html_code, react: animation.react_code, css: 'button {}' } });
  assert.equal(viewer.views[0].state.doc.toString(), animation.react_code);
  find(viewer.tree, node => node.type === 'PlatformSwitcher').props.onChange('html');
  viewer.harness.render();
  assert.equal(viewer.views[0].destroyed, true);
  assert.equal(viewer.views.at(-1).state.doc.toString(), fixtureAnimation.html_code);
  viewer.harness.unmount();
  assert.ok(viewer.views.every(view => view.destroyed));
});
test('refreshing code updates CodeMirror without recursively reporting a user edit', async () => {
  const viewer = await viewerHarness();
  viewer.refresh({ codeState: { html: '<button>Updated</button>' } });
  assert.equal(viewer.views.at(-1).state.doc.toString(), '<button>Updated</button>');
  assert.equal(viewer.editCalls.length, 0);
  viewer.harness.unmount();
});
test('a successful editor copy waits for clipboard completion', async () => {
  const viewer = await viewerHarness();
  await find(viewer.tree, node => node.type === 'button' && node.props['aria-label'] === 'Copy code').props.onClick();
  assert.deepEqual(viewer.copied, [['text', fixtureAnimation.html_code]]);
  assert.equal(viewer.notifications[0][0], 'success');
  viewer.harness.unmount();
});
for (const label of ['Copy code', 'Copy for AI']) {
  test('clipboard rejection for ' + label + ' never reports success', async () => {
    const viewer = await viewerHarness({ clipboardFails: true });
    await find(viewer.tree, node => node.type === 'button' && node.props['aria-label'] === label).props.onClick();
    assert.equal(viewer.notifications[0][0], 'error');
    assert.ok(!viewer.notifications.some(([kind]) => kind === 'success'));
    assert.ok(!viewer.tracked.some(([kind]) => kind === 'copied' || kind === 'copy_for_ai'));
    viewer.harness.unmount();
  });
}
for (const success of [true, false]) {
  test('Webflow copy ' + (success ? 'uses JSON MIME data' : 'handles failure') + ' and removes its listener', async () => {
    const animation = { ...fixtureAnimation, html_code: '', webflow_code: '{"fixture":true}' };
    const viewer = await viewerHarness({ animation, codeState: { webflow: animation.webflow_code }, defaultPlatform: 'webflow', execResult: success });
    await find(viewer.tree, node => node.type?.name === 'WebflowCopyPanel').props.onCopy();
    assert.equal(viewer.dom.listeners.get('copy')?.size ?? 0, 0);
    assert.equal(viewer.notifications[0][0], success ? 'success' : 'error');
    if (success) assert.deepEqual(viewer.copied[0], ['application/json', animation.webflow_code]);
    viewer.harness.unmount();
  });
}
for (const ai of [false, true]) {
  test('sidebar ' + (ai ? 'AI' : 'code') + ' copy handles denied clipboard access', async () => {
    const dom = browser(), harness = renderer(), messages = [];
    const { default: Sidebar } = await load('src/features/animation-detil/components/SidebarCopyActions.jsx', {
      react: harness.react, 'react/jsx-runtime': jsx,
      '@/libs/analytics/posthogAnalytics': { analytics: { animation: { copied: () => assert.fail('Must not report success') }, track: () => assert.fail('Must not report success') } },
      '@/libs/utils/events': { sendServerEvent: () => assert.fail('Must not report success') },
      sonner: { toast: { error: message => messages.push(message), success: () => assert.fail('Must not report success') } },
      '@/libs/config/onboarding': { EVENTS: {} }, '@/components/ui/Button': 'Button',
      '@/features/common/PlatformSwitcher': { PlatformSwitcher: 'PlatformSwitcher', PLATFORM_LABELS: { html: 'HTML' } },
    }, { ...dom, navigator: { clipboard: { writeText: async () => { throw Error('Denied'); } } } });
    const tree = harness.mount(Sidebar, { animation: fixtureAnimation, codeState: { html: '<div />' }, hasAccess: true });
    const buttons = tree.props.children[1].props.children;
    await buttons[ai ? 1 : 0].props.onClick();
    assert.equal(messages.length, 1);
  });
}

async function headerHarness() {
  const dom = browser(), harness = renderer(), locks = [];
  const { default: Header } = await load('src/components/header/Header.jsx', {
    react: harness.react, 'react/jsx-runtime': jsx, 'next/navigation': { usePathname: () => '/animations' },
    gsap: { killTweensOf() {}, set() {}, to() {}, fromTo() {} },
    '@/components/navigation/TransitionLink': 'Link',
    '@/libs/utils/className': classNames, '@/libs/utils/formatImageUrl': { formatImageUrl: value => value },
    '@/assets/logos/BrandLogo': { BrandLogo: 'BrandLogo' }, '@/components/navigation/NavSurface': 'NavLink',
    '@/components/ui/Button': 'Button', '@/libs/utils/i18n': { t: key => key },
    '@/contexts/CategoryProvider': { useCategories: () => [] },
    '@/components/header/NavDropdownTrigger': { NavDropdownTrigger: 'NavDropdownTrigger' },
    '@/components/header/MobileNavAccordion': { MobileNavAccordion: 'MobileNavAccordion' },
    '@/components/header/HeaderMarquee': { HeaderMarquee: 'HeaderMarquee' },
    '@/components/header/header.config': { NAV_ITEMS: [{ key: 'library', label: 'Library', mega: { intro: { heading: 'Library', text: '', cta: { href: '/animations' } }, columns: [{ label: 'Browse', links: [{ label: 'Saved', href: '/animations/saved' }] }] } }] },
    '@/libs/config/isRouteActive': { isRouteActive: () => false },
    '@/hooks/useAuth': { useAuth: () => ({ hasAccess: false, isAuthenticated: false, loading: false }) },
    '@/hooks/useHeaderState': { useHeaderState: () => ({ headerTheme: 'dark', scrollState: 'top' }) },
    '@/contexts/ScrollLockProvider': { useScrollLockContext: () => ({ lockScroll: () => locks.push('lock'), unlockScroll: () => locks.push('unlock') }) },
  }, { ...dom, setTimeout: dom.window.setTimeout.bind(dom.window), clearTimeout: dom.window.clearTimeout });
  harness.mount(Header, {});
  return { ...dom, harness, locks, get tree() { return harness.render(); }, open() { find(harness.render(), node => node.props['aria-label'] === 'Open menu').props.onClick(); return harness.render(); } };
}
test('Escape closes the mobile menu and releases the existing scroll lock', async () => {
  const header = await headerHarness(); header.open();
  assert.ok(header.classes.has('v2-scroll-locked'));
  header.emit('keydown', { key: 'Escape' });
  assert.ok(find(header.tree, node => node.props['aria-label'] === 'Open menu'));
  assert.deepEqual(header.locks, ['lock', 'unlock']);
  assert.ok(!header.classes.has('v2-scroll-locked'));
});
test('crossing into desktop closes an open mobile menu', async () => {
  const header = await headerHarness(); header.open();
  const media = header.window.matchMedia('(min-width: 1024px)');
  media.matches = true; media.callbacks.forEach(fn => fn({ matches: true }));
  assert.ok(find(header.tree, node => node.props['aria-label'] === 'Open menu'));
  assert.ok(!header.classes.has('v2-scroll-locked'));
  assert.deepEqual(header.locks, ['lock', 'unlock']);
});
test('same-page category navigation closes the mobile menu without waiting for pathname changes', async () => {
  const header = await headerHarness(); header.open();
  find(header.tree, node => node.type === 'MobileNavAccordion').props.onNavigate();
  assert.ok(find(header.tree, node => node.props['aria-label'] === 'Open menu'));
  assert.ok(!header.classes.has('v2-scroll-locked'));
});
test('unmounting an open header releases the scroll lock', async () => {
  const header = await headerHarness(); header.open(); header.harness.unmount();
  assert.deepEqual(header.locks, ['lock', 'unlock']);
  assert.ok(!header.classes.has('v2-scroll-locked'));
});
test('mobile accordion links call the supplied navigation callback', async () => {
  const dom = browser(), harness = renderer(); let closed = 0;
  const { MobileNavAccordion } = await load('src/components/header/MobileNavAccordion.jsx', {
    react: harness.react, 'react/jsx-runtime': jsx, gsap: { gsap: { to() {} } },
    '@/components/navigation/TransitionLink': 'Link', '@/libs/utils/className': classNames,
    '@/hooks/useScramble': { useScramble: () => ({ ref: {}, scramble() {} }) },
  }, dom);
  const tree = harness.mount(MobileNavAccordion, { item: { label: 'Library', mega: { columns: [{ links: [{ label: 'Buttons', href: '/animations?category=button' }] }] } }, expanded: true, onToggle() {}, onNavigate: () => closed++ });
  find(tree, node => node.type === 'Link').props.onClick(); assert.equal(closed, 1);
});

test('list-view hover previews use the actual class-name helper', async () => {
  const dom = browser(), harness = renderer();
  const { MediaHoverReveal } = await load('src/features/common/MediaHoverReveal.jsx', {
    react: harness.react, 'react/jsx-runtime': jsx, gsap: { registerPlugin() {} },
    '@gsap/react': { useGSAP: () => ({ contextSafe: fn => fn }) },
    '@/libs/utils/className': classNames,
  }, { ...dom, navigator: { maxTouchPoints: 0 } });
  const tree = harness.mount(MediaHoverReveal, { items: [{ type: 'image', src: '/fixture.png' }], containerRef: { current: null } });
  assert.ok(find(tree, node => typeof node.props.className === 'string' && node.props.className.includes('pointer-events-none')));
});

const removed = {
  'src/features/common/DescriptionList.jsx': 'src/components/ui/SpecList.jsx',
  'src/features/common/SmoothScroll.jsx': 'src/contexts/LenisProvider.jsx',
  'src/hooks/useScrollAnimation.js': 'src/hooks/useRevealTimeline.js',
  'src/contexts/TooltipProvider.jsx': 'src/components/ui/Tooltip.jsx',
  'src/libs/config/pricingHelpers.js': 'src/libs/data/seat-prices.js',
  'src/libs/config/pricing.js': 'src/libs/data/seat-prices.js',
  'src/libs/config/stripe.js': 'src/libs/data/stripe-prices.js',
  'src/components/ui/AskAiBar.jsx': 'src/components/footer/AskAi.jsx',
  'src/components/ui/Divider.jsx': 'src/components/footer/LandingDivider.jsx',
};
test('removed redundant files retain existing canonical replacements and no remaining imports', async () => {
  for (const [old, canonical] of Object.entries(removed)) {
    assert.equal(existsSync(path.join(root, old)), false, old);
    assert.equal(existsSync(path.join(root, canonical)), true, canonical);
  }
  async function inspect(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await inspect(file);
      else if (/\.jsx?$/.test(file)) {
        const text = await readFile(file, 'utf8');
        for (const [old] of Object.entries(removed)) {
          const spec = '@/' + old.slice(4).replace(/\.jsx?$/, '');
          assert.ok(!text.includes("'" + spec + "'") && !text.includes('"' + spec + '"'), file);
        }
      }
    }
  }
  await inspect(path.join(root, 'src'));
});
test('the retained description list renders existing string and labeled values', async () => {
  const { default: SpecList } = await load('src/components/ui/SpecList.jsx');
  const markup = renderToStaticMarkup(React.createElement(SpecList, { items: [{ label: 'Runtime', value: 'GSAP' }, 'Available'] }));
  assert.ok(markup.includes('<dt') && markup.includes('Runtime') && markup.includes('GSAP') && markup.includes('Available'));
});
test('the retained pricing helpers preserve volume and tier calculations using fixture amounts', async () => {
  const prices = await load('src/libs/data/seat-prices.js');
  assert.equal(prices.calculateStudioTotalCents(5, 30000, 3), 90000);
  assert.equal(prices.calculateTieredStudioTotalCents(5, 30000, 'T2', 3), 63000);
  assert.equal(prices.calculateTieredStudioTotalCents(5, 30000, 'T3', 3), 45000);
});
