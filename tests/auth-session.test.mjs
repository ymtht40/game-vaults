import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { compileFunction } from 'node:vm';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { transform } = require('next/dist/build/swc');
const { NextRequest, NextResponse } = require('next/server');
const root = new URL('../', import.meta.url);
const compiled = new Map();
const quiet = { warn() {}, error() {}, log() {} };
const environment = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-public-key',
};
const user = { id: 'viewer-id', email: 'viewer@example.invalid' };
const session = { user };

async function loadModule(file, imports, globals = {}) {
  if (!compiled.has(file)) {
    const filename = fileURLToPath(new URL(file, root));
    const source = await readFile(filename, 'utf8');
    const result = await transform(source, {
      filename,
      jsc: {
        parser: { syntax: 'ecmascript', jsx: file.endsWith('.jsx') },
        target: 'es2022',
        transform: { react: { runtime: 'automatic' } },
      },
      module: { type: 'commonjs' },
    });
    compiled.set(file, compileFunction(result.code, [
      'exports', 'require', 'module', 'process', 'console',
      'window', 'setTimeout', 'clearTimeout', 'fetch', 'URLSearchParams',
    ], { filename }));
  }
  const module = { exports: {} };
  const mockedRequire = (name) => {
    assert.ok(Object.hasOwn(imports, name), 'Unexpected import: ' + name);
    return imports[name];
  };
  compiled.get(file)(
    module.exports, mockedRequire, module,
    { env: globals.env ?? environment }, quiet, globals.window,
    setTimeout, clearTimeout, globals.fetch, URLSearchParams,
  );
  return module.exports;
}

function makeSdk(options = {}) {
  const calls = [];
  const sdk = {
    auth: {
      getUser: options.getUser ?? (async () => ({ data: { user }, error: null })),
    },
    from(table) {
      calls.push(['from', table]);
      const result = () => {
        const value = table === 'users' ? options.profile : options.saved;
        if (typeof value === 'function') return value();
        return value ?? { data: table === 'users' ? { id: user.id, has_access: true } : [], error: null };
      };
      const query = {
        select(fields) { calls.push(['select', table, fields]); return query; },
        eq(field, value) { calls.push(['eq', table, field, value]); return query; },
        maybeSingle() { return Promise.resolve().then(result); },
        then(resolve, reject) { return Promise.resolve().then(result).then(resolve, reject); },
        insert(record) {
          calls.push(['insert', table, record]);
          return typeof options.insert === 'function'
            ? options.insert(record)
            : Promise.resolve(options.insert ?? { data: null, error: null });
        },
      };
      return query;
    },
  };
  return { sdk, calls };
}

async function serverModule(sdk, factory = () => sdk, getCookies = async () => ({ getAll: () => [], set() {} })) {
  return loadModule('src/libs/supabase/server.js', {
    'next/headers': { cookies: getCookies },
    '@supabase/ssr': { createServerClient: factory },
  });
}

async function postAuthModule() {
  return loadModule('src/libs/utils/resolvePostAuthPath.js', {});
}

const guest = { user: null, hasAccess: false, savedIds: [] };

test('anonymous viewer does not query profile or saved IDs', async () => {
  const { sdk, calls } = makeSdk({ getUser: async () => ({ data: { user: null }, error: null }) });
  assert.deepEqual(await (await serverModule(sdk)).getViewerContext(), guest);
  assert.equal(calls.length, 0);
});

test('an Auth error never authenticates a user returned alongside it', async () => {
  const { sdk, calls } = makeSdk({ getUser: async () => ({ data: { user }, error: Error('Invalid session') }) });
  assert.deepEqual(await (await serverModule(sdk)).getViewerContext(), guest);
  assert.equal(calls.length, 0);
});

test('Auth rejection falls back to an anonymous viewer', async () => {
  const { sdk } = makeSdk({ getUser: async () => { throw Error('Auth unavailable'); } });
  assert.deepEqual(await (await serverModule(sdk)).getViewerContext(), guest);
});

test('client configuration failure falls back safely', async () => {
  const module = await serverModule(null, () => { throw Error('Missing configuration'); });
  assert.deepEqual(await module.getViewerContext(), guest);
});


test('Next.js request/rendering signals propagate instead of becoming anonymous content', async () => {
  const renderingSignal = Error('Dynamic rendering required');
  const module = await serverModule(null, () => assert.fail('Should not create client'), async () => { throw renderingSignal; });
  await assert.rejects(module.getViewerContext(), (error) => error === renderingSignal);
});

test('saved IDs are scoped to the verified user and deduplicated', async () => {
  const { sdk, calls } = makeSdk({
    saved: { data: [{ animation_id: 'animation-a' }, { animation_id: 'animation-a' }, { animation_id: null }, { animation_id: 'animation-b' }], error: null },
  });
  const viewer = await (await serverModule(sdk)).getViewerContext();
  assert.deepEqual(viewer, { user, hasAccess: true, savedIds: ['animation-a', 'animation-b'] });
  assert.ok(calls.some((call) => JSON.stringify(call) === JSON.stringify(['eq', 'saved_animations', 'user_id', user.id])));
  assert.ok(calls.some((call) => JSON.stringify(call) === JSON.stringify(['select', 'saved_animations', 'animation_id'])));
});

test('profile rejection preserves verified identity and saved IDs without granting access', async () => {
  const { sdk } = makeSdk({
    profile: () => { throw Error('Profile unavailable'); },
    saved: { data: [{ animation_id: 'animation-a' }], error: null },
  });
  assert.deepEqual(await (await serverModule(sdk)).getViewerContext(), { user, hasAccess: false, savedIds: ['animation-a'] });
});

test('saved query error discards data from that response but preserves verified identity', async () => {
  const { sdk } = makeSdk({ saved: { data: [{ animation_id: 'untrusted' }], error: Error('Denied') } });
  assert.deepEqual(await (await serverModule(sdk)).getViewerContext(), { user, hasAccess: true, savedIds: [] });
});

test('saved query rejection does not crash rendering', async () => {
  const { sdk } = makeSdk({ saved: () => { throw Error('Unavailable'); } });
  assert.deepEqual(await (await serverModule(sdk)).getViewerContext(), { user, hasAccess: true, savedIds: [] });
});

test('profile query error fails closed for subscription access', async () => {
  const { sdk } = makeSdk({ profile: { data: { has_access: true }, error: Error('Denied') } });
  assert.equal((await (await serverModule(sdk)).getViewerContext()).hasAccess, false);
});

const jsxRuntime = {
  jsx: (type, props) => ({ type, props }),
  jsxs: (type, props) => ({ type, props }),
};

test('library page passes viewer props and opts out of shared prerendering', async () => {
  const animations = [{ id: 'animation-a' }];
  const viewer = { user, savedIds: ['animation-a'] };
  const module = await loadModule('src/app/animations/page.jsx', {
    react: { Suspense: 'Suspense' },
    'react/jsx-runtime': jsxRuntime,
    '@/features/animation-page/AnimationsLibrary': 'AnimationsLibrary',
    '@/libs/supabase/latestAnimation': { getPublishedAnimations: async () => animations },
    '@/libs/supabase/server': { getViewerContext: async () => viewer },
  });
  const rendered = await module.default();
  assert.equal(module.dynamic, 'force-dynamic');
  assert.deepEqual(rendered.props.children.props, {
    initialAnimations: animations, savedAnimationIds: viewer.savedIds, isAuthenticated: true,
  });
});

test('anonymous library rendering remains available', async () => {
  const module = await loadModule('src/app/animations/page.jsx', {
    react: { Suspense: 'Suspense' },
    'react/jsx-runtime': jsxRuntime,
    '@/features/animation-page/AnimationsLibrary': 'AnimationsLibrary',
    '@/libs/supabase/latestAnimation': { getPublishedAnimations: async () => [] },
    '@/libs/supabase/server': { getViewerContext: async () => guest },
  });
  assert.equal((await module.default()).props.children.props.isAuthenticated, false);
});

test('new OTP users get a free profile and the existing library route', async () => {
  const { sdk, calls } = makeSdk({ profile: { data: null, error: null } });
  const destination = await (await postAuthModule()).resolvePostAuthPath({ supabase: sdk, session });
  assert.equal(destination, '/animations');
  const insert = calls.find((call) => call[0] === 'insert');
  assert.equal(insert[1], 'users');
  assert.equal(insert[2].id, user.id);
  assert.equal(insert[2].has_access, false);
  assert.equal(insert[2].onboarding_completed, false);
});

test('existing profiles are not overwritten after OTP verification', async () => {
  const { sdk, calls } = makeSdk();
  assert.equal(await (await postAuthModule()).resolvePostAuthPath({ supabase: sdk, session }), '/animations');
  assert.equal(calls.filter((call) => call[0] === 'insert').length, 0);
});

test('profile lookup errors do not trigger inserts or lose a valid OTP session', async () => {
  const { sdk, calls } = makeSdk({ profile: { data: null, error: Error('Unavailable') } });
  assert.equal(await (await postAuthModule()).resolvePostAuthPath({ supabase: sdk, session }), '/animations');
  assert.equal(calls.filter((call) => call[0] === 'insert').length, 0);
});

test('profile creation failures and duplicate races preserve the verified session', async () => {
  const module = await postAuthModule();
  for (const insert of [
    { data: null, error: { code: '23505' } },
    { data: null, error: { code: '42501' } },
    async () => { throw Error('Network failure'); },
  ]) {
    const { sdk } = makeSdk({ profile: { data: null, error: null }, insert });
    assert.equal(await module.resolvePostAuthPath({ supabase: sdk, session }), '/animations');
  }
});

test('missing OTP session is rejected before any profile query', async () => {
  const { sdk, calls } = makeSdk();
  await assert.rejects((await postAuthModule()).resolvePostAuthPath({ supabase: sdk, session: null }), /valid email sign-in session/);
  assert.equal(calls.length, 0);
});

test('middleware refreshes request and response cookies with original options', async () => {
  const request = new NextRequest('https://app.example/animations', { headers: { cookie: 'session-token=expired' } });
  const module = await loadModule('src/middleware.js', {
    'next/server': { NextResponse },
    '@supabase/ssr': {
      createServerClient(url, key, options) {
        assert.equal(url, environment.NEXT_PUBLIC_SUPABASE_URL);
        assert.equal(options.cookies.getAll()[0].value, 'expired');
        return { auth: { async getUser() {
          options.cookies.setAll([{ name: 'session-token', value: 'refreshed', options: { path: '/', httpOnly: true, sameSite: 'lax' } }]);
          return { data: { user }, error: null };
        } } };
      },
    },
  });
  const response = await module.middleware(request);
  assert.equal(request.cookies.get('session-token').value, 'refreshed');
  assert.equal(response.cookies.get('session-token').value, 'refreshed');
  assert.equal(response.cookies.get('session-token').httpOnly, true);
  assert.ok(response.headers.get('x-middleware-request-cookie').includes('session-token=refreshed'));
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(module.config.matcher, ['/animations/:path*', '/login']);
});

test('middleware tolerates Auth failure without redirecting or discarding cookies already set', async () => {
  const module = await loadModule('src/middleware.js', {
    'next/server': { NextResponse },
    '@supabase/ssr': { createServerClient: (url, key, options) => ({ auth: { async getUser() {
      options.cookies.setAll([{ name: 'invalid-session', value: '', options: { path: '/', maxAge: 0 } }]);
      throw Error('Auth unavailable');
    } } }) },
  });
  const response = await module.middleware(new NextRequest('https://app.example/login'));
  assert.equal(response.headers.get('location'), null);
  assert.equal(response.cookies.get('invalid-session').value, '');
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});

test('middleware tolerates missing public configuration', async () => {
  const module = await loadModule('src/middleware.js', {
    'next/server': { NextResponse },
    '@supabase/ssr': { createServerClient: () => assert.fail('Should not create client') },
  }, { env: {} });
  const response = await module.middleware(new NextRequest('https://app.example/login'));
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});

function findElement(node, predicate) {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, predicate);
      if (found) return found;
    }
  } else if (node?.props) {
    if (predicate(node)) return node;
    return findElement(node.props.children, predicate);
  }
}

async function signInHarness({ sdk, query = '', codeSent = false, checking = false, createClient, fetch } = {}) {
  const params = new URLSearchParams(query);
  const effects = [];
  const stateUpdates = [];
  const navigation = [];
  const notifications = [];
  let stateIndex = 0;
  const state = new Map([[0, user.email], [1, '/animations'], [6, codeSent], [7, user.email], [8, checking]]);
  const window = {
    location: { origin: 'https://app.example', hash: '', pathname: '/login', search: '', assign: (href) => navigation.push(['assign', href]) },
    history: { replaceState() {} },
  };
  const module = await loadModule('src/features/sigin/SignInPage.jsx', {
    react: {
      useCallback: (callback) => callback,
      useEffect: (effect) => effects.push(effect),
      useState(initial) {
        const index = stateIndex++;
        return [
          state.has(index) ? state.get(index) : typeof initial === 'function' ? initial() : initial,
          (value) => stateUpdates.push({ index, value }),
        ];
      },
    },
    'react/jsx-runtime': jsxRuntime,
    'next/navigation': { useSearchParams: () => params },
    '@phosphor-icons/react': { GoogleLogo: 'GoogleLogo', Envelope: 'Envelope', GithubLogo: 'GithubLogo', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight' },
    '@/libs/supabase/client': { createClient: createClient ?? (() => sdk) },
    sonner: { toast: { success: (message) => notifications.push(['success', message]), error: (message) => notifications.push(['error', message]) } },
    '@/libs/utils/resolvePostAuthPath': await postAuthModule(),
    '@/components/ui/Button': 'Button',
    '@/animations/FadeIn': 'FadeIn',
    '@/assets/logos/BrandLogo': { BrandLogo: 'BrandLogo' },
    '@/features/sigin/AuthShowcase': { AuthShowcase: 'AuthShowcase' },
    '@/features/sigin/SignInCodeForm': 'SignInCodeForm',
    '@/components/ui/Loader': 'Loader',
    '@/components/navigation/NavSurface': 'NavLink',
    '@/contexts/TransitionRouterProvider': { useTransitionRouter: () => ({
      refresh: () => navigation.push(['refresh']),
      push: (href) => navigation.push(['push', href]),
    }) },
    '@/components/ui/OAuthButton': { OAuthButton: 'OAuthButton' },
  }, { window, fetch });
  return { tree: module.default({}), effects, stateUpdates, navigation, notifications, window };
}

test('both OAuth providers keep the callback and complete nested return URLs', async () => {
  const calls = [];
  const sdk = { auth: { signInWithOAuth: async (options) => { calls.push(options); return { error: null }; } } };
  const target = '/animations/saved?sort=recent&filter=all';
  const harness = await signInHarness({ sdk, query: new URLSearchParams({ redirectTo: target }).toString() });
  await findElement(harness.tree, (node) => node.props.label === 'Google').props.onClick();
  await findElement(harness.tree, (node) => node.props.label === 'GitHub').props.onClick();
  assert.deepEqual(calls.map((call) => call.provider), ['google', 'github']);
  for (const call of calls) {
    const callback = new URL(call.options.redirectTo);
    assert.equal(callback.pathname, '/api/auth/callback');
    assert.equal(callback.searchParams.get('redirectTo'), target);
  }
});

test('Email OTP keeps email verification and returns to the requested saved library', async () => {
  const { sdk } = makeSdk({ profile: { data: null, error: null } });
  const calls = [];
  sdk.auth.verifyOtp = async (options) => { calls.push(options); return { data: { session }, error: null }; };
  const harness = await signInHarness({ sdk, codeSent: true, query: 'redirectTo=%2Fanimations%2Fsaved' });
  await findElement(harness.tree, (node) => node.type === 'SignInCodeForm').props.onVerify('123456');
  assert.deepEqual(calls, [{ email: user.email, token: '123456', type: 'email' }]);
  assert.deepEqual(harness.navigation, [['refresh'], ['push', '/animations/saved']]);
});

test('first-time Email OTP defaults to animations and never redirects to welcome', async () => {
  const { sdk } = makeSdk({ profile: { data: null, error: null } });
  sdk.auth.verifyOtp = async () => ({ data: { session }, error: null });
  const harness = await signInHarness({ sdk, codeSent: true });
  await findElement(harness.tree, (node) => node.type === 'SignInCodeForm').props.onVerify('123456');
  assert.deepEqual(harness.navigation, [['refresh'], ['push', '/animations']]);
});

test('invalid OTP does not create a profile or navigate', async () => {
  const { sdk, calls } = makeSdk();
  sdk.auth.verifyOtp = async () => ({ data: { session: null }, error: Error('Expired code') });
  const harness = await signInHarness({ sdk, codeSent: true });
  await assert.rejects(findElement(harness.tree, (node) => node.type === 'SignInCodeForm').props.onVerify('123456'), /Expired code/);
  assert.equal(calls.length, 0);
  assert.equal(harness.navigation.length, 0);
});

test('session-check rejection releases the login loader and reports a safe error', async () => {
  const harness = await signInHarness({
    sdk: { auth: { getUser: async () => { throw Error('Auth unavailable'); } } },
    checking: true,
  });
  harness.effects[1]();
  await new Promise(setImmediate);
  assert.ok(harness.stateUpdates.some(({ index, value }) => index === 8 && value === false));
  assert.equal(harness.notifications[0][0], 'error');
  assert.equal(harness.navigation.length, 0);
});

test('client configuration failure also releases the login loader', async () => {
  const harness = await signInHarness({ createClient: () => { throw Error('Invalid configuration'); }, checking: true });
  harness.effects[1]();
  await new Promise(setImmediate);
  assert.ok(harness.stateUpdates.some(({ index, value }) => index === 8 && value === false));
});

test('an existing verified session keeps its intended redirect and refreshes cached pages', async () => {
  const harness = await signInHarness({
    sdk: { auth: { getUser: async () => ({ data: { user }, error: null }), getSession: async () => ({ data: { session }, error: null }) } },
    query: 'redirectTo=%2Fanimations%2Fsaved',
  });
  harness.effects[1]();
  await new Promise(setImmediate);
  assert.deepEqual(harness.navigation, [['refresh'], ['push', '/animations/saved']]);
});

test('successful Email OTP invite acceptance keeps its hard navigation', async () => {
  const { sdk } = makeSdk();
  sdk.auth.verifyOtp = async () => ({ data: { session }, error: null });
  const target = '/api/teams/invites/accept?invite=test-invite';
  const harness = await signInHarness({ sdk, codeSent: true, query: new URLSearchParams({ redirectTo: target }).toString() });
  await findElement(harness.tree, (node) => node.type === 'SignInCodeForm').props.onVerify('123456');
  assert.deepEqual(harness.navigation, [['assign', target]]);
});
