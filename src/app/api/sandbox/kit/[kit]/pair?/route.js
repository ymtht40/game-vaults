// GET /api/sandbox/kit/[kit]/pair?cover=<slug>&hero=<slug>&speed=1&invert=0&k=0
// Renders a preloader cover on top of a hero section and wires them together,
// so the page can show the real handoff. Used by the pairing iframe on the
// Reveal Kit page (and by the handoff preview at the top of it).
//
// Handoff contract (host side):
//   - window.anmReveal.release()   -> call this from the cover at its release frame
//   - window.anmReveal.onRelease() -> subscribe to the release
//   - the hero's JS runs on release, so the hero's first frame starts exactly there
//   - the document also dispatches an "anm:release" event
// If a cover never calls release(), the host releases it after a timeout so the
// preview can never hang.

import {
  buildDependencyTags,
  findKit,
  getAdminSupabase,
  htmlDocument,
  htmlResponse,
  isSafeSlug,
  loadKitComponent,
  messagePage,
  safeJson,
  wrapComponentScript,
} from '@/libs/server/kitSandbox';

const MIN_SPEED = 0.1;
const MAX_SPEED = 4;
const RELEASE_FALLBACK_SECONDS = 10;

function parseSpeed(raw) {
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, value));
}

const HOST_CSS = `
[data-reveal-hero] { position: relative; min-height: 100vh; }
[data-reveal-cover] { position: fixed; inset: 0; z-index: 50; }
[data-reveal-cover][data-released='true'] { pointer-events: none; }
body[data-invert='true'] { background: #fafafa; color: #0a0a0a; }
`;

function hostScript({ speed, invert }) {
  return `<script>
(function () {
  var released = false;
  var listeners = [];

  function release() {
    if (released) return;
    released = true;
    var cover = document.querySelector('[data-reveal-cover]');
    if (cover) cover.setAttribute('data-released', 'true');
    document.dispatchEvent(new CustomEvent('anm:release'));
    listeners.splice(0).forEach(function (fn) {
      try { fn(); } catch (err) { console.error('[reveal] release listener failed:', err); }
    });
  }

  window.anmReveal = {
    speed: ${safeJson(speed)},
    invert: ${safeJson(invert)},
    release: release,
    onRelease: function (fn) {
      if (released) fn();
      else listeners.push(fn);
    }
  };

  // The speed slider scales every tween on the global timeline
  if (window.gsap) window.gsap.globalTimeline.timeScale(${safeJson(speed)});

  // Safety net: never leave the preview stuck on the cover
  setTimeout(release, ${RELEASE_FALLBACK_SECONDS} * 1000 / ${safeJson(speed)});
})();
</script>`;
}

// Hero code waits for the release so its first frame lines up with the cover
function deferredHeroScript(hero) {
  if (!hero.js) return '';
  const body = hero.js.replace(/<\/script/gi, '<\\/script');
  return `<script>
window.anmReveal.onRelease(function () {
  try {
${body}
  } catch (err) {
    console.error('[reveal] hero "${hero.slug}" failed:', err);
  }
});
</script>`;
}

export async function GET(request, context) {
  try {
    const { kit: kitSlug } = await context.params;
    const { searchParams } = new URL(request.url);

    const coverSlug = searchParams.get('cover');
    const heroSlug = searchParams.get('hero');

    if (!isSafeSlug(kitSlug) || !isSafeSlug(coverSlug) || !isSafeSlug(heroSlug)) {
      return messagePage('Invalid pairing request', 400);
    }
    if (!findKit(kitSlug)) return messagePage(`Kit not found: ${kitSlug}`);

    const speed = parseSpeed(searchParams.get('speed'));
    const invert = searchParams.get('invert') === '1';

    const supabase = getAdminSupabase();
    const [cover, hero] = await Promise.all([
      loadKitComponent(supabase, kitSlug, coverSlug),
      loadKitComponent(supabase, kitSlug, heroSlug),
    ]);

    if (!cover) return messagePage(`Preloader not found: ${coverSlug}`);
    if (!hero) return messagePage(`Hero not found: ${heroSlug}`);

    const html = htmlDocument({
      title: `${cover.title} + ${hero.title}`,
      css: `${HOST_CSS}\n${hero.css}\n${cover.css}`,
      body: `<div data-reveal-hero="${hero.slug}">${hero.html}</div>
<div data-reveal-cover="${cover.slug}">${cover.html}</div>
${buildDependencyTags([cover, hero])}
${hostScript({ speed, invert })}
${wrapComponentScript(cover.slug, cover.js)}
${deferredHeroScript(hero)}
<script>document.body.setAttribute('data-invert', ${safeJson(invert)});</script>`,
    });

    return htmlResponse(html);
  } catch (err) {
    console.error('[sandbox/kit/pair]', err);
    return messagePage('Preview failed to load', 500);
  }
}

