// GET /api/sandbox/kit/[kit]/[slug]
// Renders one kit component (for example a menu) on a neutral demo page so the
// only thing the visitor compares is the component itself. Used by the "stage"
// iframe on the Menu Kit page.

import {
  buildDependencyTags,
  findKit,
  getAdminSupabase,
  htmlDocument,
  htmlResponse,
  isSafeSlug,
  loadKitComponent,
  messagePage,
  wrapComponentScript,
} from '@/libs/server/kitSandbox';

// A calm, static page behind the component. It never changes between menus.
const STAGE_CSS = `
.stage-page { min-height: 100vh; display: flex; flex-direction: column; }
.stage-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 28px; border-bottom: 1px solid rgba(255,255,255,0.08);
}
.stage-logo { font-weight: 600; letter-spacing: -0.02em; }
.stage-main { flex: 1; padding: 64px 28px; max-width: 1100px; width: 100%; margin: 0 auto; }
.stage-eyebrow { font: 12px ui-monospace, monospace; color: #777; text-transform: uppercase; letter-spacing: 0.08em; }
.stage-title { margin: 16px 0 0; font-size: clamp(36px, 7vw, 84px); line-height: 1.02; letter-spacing: -0.035em; font-weight: 500; max-width: 14ch; }
.stage-copy { margin-top: 20px; max-width: 46ch; color: #8a8a8a; line-height: 1.6; }
.stage-grid { margin-top: 56px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.stage-card { aspect-ratio: 4 / 3; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
`;

const STAGE_MARKUP = `
<div class="stage-page" data-stage-page>
  <header class="stage-bar">
    <span class="stage-logo">Studio</span>
  </header>
  <main class="stage-main">
    <div class="stage-eyebrow">Demo page</div>
    <h1 class="stage-title">The page behind the menu.</h1>
    <p class="stage-copy">Nothing here changes between menus, so the only thing you are judging is how the menu opens, moves and closes.</p>
    <div class="stage-grid">
      <div class="stage-card"></div><div class="stage-card"></div><div class="stage-card"></div>
      <div class="stage-card"></div><div class="stage-card"></div><div class="stage-card"></div>
    </div>
  </main>
</div>
`;

export async function GET(request, context) {
  try {
    const { kit: kitSlug, slug } = await context.params;

    if (!isSafeSlug(kitSlug) || !isSafeSlug(slug)) {
      return messagePage('Invalid preview address', 400);
    }
    // "pair" has its own static route, so it should never land here
    if (!findKit(kitSlug)) return messagePage(`Kit not found: ${kitSlug}`);

    const supabase = getAdminSupabase();
    const component = await loadKitComponent(supabase, kitSlug, slug);
    if (!component) return messagePage(`Component not found: ${slug}`);

    const html = htmlDocument({
      title: component.title,
      css: `${STAGE_CSS}\n${component.css}`,
      body: `${STAGE_MARKUP}
<div data-kit-component="${slug}">${component.html}</div>
${buildDependencyTags([component])}
${wrapComponentScript(component.slug, component.js)}`,
    });

    return htmlResponse(html);
  } catch (err) {
    console.error('[sandbox/kit/slug]', err);
    return messagePage('Preview failed to load', 500);
  }
}

