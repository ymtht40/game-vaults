// Shared helpers for the kit sandbox preview routes
// (/api/sandbox/kit/[kit]/[slug] and /api/sandbox/kit/[kit]/pair).

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { KITS } from '@/libs/data/kits';

const GSAP_VERSION = '3.15.0';
const GSAP_CDN = `https://cdn.jsdelivr.net/npm/gsap@${GSAP_VERSION}/dist`;

// Same CDN map the library sandbox uses, so kit code can declare dependencies by name
export const DEPENDENCY_MAP = {
  gsap: `${GSAP_CDN}/gsap.min.js`,
  ScrollTrigger: `${GSAP_CDN}/ScrollTrigger.min.js`,
  SplitText: `${GSAP_CDN}/SplitText.min.js`,
  Flip: `${GSAP_CDN}/Flip.min.js`,
  Draggable: `${GSAP_CDN}/Draggable.min.js`,
  InertiaPlugin: `${GSAP_CDN}/InertiaPlugin.min.js`,
  Observer: `${GSAP_CDN}/Observer.min.js`,
  CustomEase: `${GSAP_CDN}/CustomEase.min.js`,
  DrawSVGPlugin: `${GSAP_CDN}/DrawSVGPlugin.min.js`,
  MorphSVGPlugin: `${GSAP_CDN}/MorphSVGPlugin.min.js`,
  ScrambleTextPlugin: `${GSAP_CDN}/ScrambleTextPlugin.min.js`,
  // three is loaded as a classic script so kit code can use the THREE global
  three: 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.min.js',
};

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Serialise a value for inline <script> use without allowing "</script>" breakouts
export function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

// Only slugs that look like slugs ever reach the database
export function isSafeSlug(value) {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value);
}

export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key, { auth: { persistSession: false } });
}

export function findKit(kitSlug) {
  return KITS.find((kit) => kit.slug === kitSlug) || null;
}

function parseDependencies(raw) {
  if (!raw) return [];
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.keys(value);
  return [];
}

// Load one kit component (cover, hero or menu) from the kit_components table.
// See supabase/kit-schema.sql for the expected columns.
export async function loadKitComponent(supabase, kitSlug, slug) {
  const { data, error } = await supabase
    .from('kit_components')
    .select('*')
    .eq('kit_slug', kitSlug)
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    slug: data.slug,
    title: data.title || data.slug,
    role: data.role || null, // 'cover' | 'hero' | 'menu'
    html: data.html_code ?? '',
    css: data.css_code ?? '',
    js: data.js_code ?? '',
    dependencies: parseDependencies(data.dependencies),
  };
}

// Script tags for the dependencies a set of components asks for.
// gsap always comes first and three only loads when something requests it.
export function buildDependencyTags(componentList) {
  const names = new Set(['gsap']);
  for (const component of componentList) {
    for (const name of component.dependencies) names.add(name);
  }
  const ordered = ['gsap', ...[...names].filter((name) => name !== 'gsap')];
  return ordered
    .filter((name) => DEPENDENCY_MAP[name])
    .map((name) => `<script src="${DEPENDENCY_MAP[name]}"></script>`)
    .join('\n');
}

// Component JS runs inside a try/catch so one broken kit never blanks the stage
export function wrapComponentScript(label, code) {
  if (!code) return '';
  const body = code.replace(/<\/script/gi, '<\\/script');
  return `<script>
(function () {
  try {
${body}
  } catch (err) {
    console.error('[kit-sandbox] ${escapeHtml(label)} failed:', err);
  }
})();
</script>`;
}

const BASE_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; width: 100%; min-height: 100%; }
body {
  background: #0a0a0a;
  color: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
`;

export function htmlDocument({ title, css = '', body = '', head = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${BASE_CSS}${css}</style>
${head}
</head>
<body>
${body}
</body>
</html>`;
}

export function htmlResponse(body, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // These previews are replayed on demand, so they must never be cached
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export function messagePage(message, status = 404) {
  return htmlResponse(
    htmlDocument({
      title: 'Preview',
      css: `body { display: flex; align-items: center; justify-content: center; height: 100vh; color: #888; font-family: ui-monospace, monospace; font-size: 13px; }`,
      body: `<div>${escapeHtml(message)}</div>`,
    }),
    status,
  );
}

