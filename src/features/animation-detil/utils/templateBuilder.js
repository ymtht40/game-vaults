
import { timelineCaptureScript } from '@/features/animation-detil/utils/timelineCaptureScript';
import { shortcutBridgeScript } from '@/features/animation-detil/utils/shortcutBridgeScript';

const DEPENDENCY_URLS = {
  gsap: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js',
  ScrollTrigger: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js',
  three: 'https://cdn.jsdelivr.net/npm/three@0.169.0/+esm',
  ScrollSmoother: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollSmoother.min.js',
  SplitText: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js',
  Flip: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Flip.min.js',
  Draggable: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Draggable.min.js',
  InertiaPlugin: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/InertiaPlugin.min.js',
  Observer: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Observer.min.js',
  MotionPathPlugin: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/MotionPathPlugin.min.js',
  ScrollToPlugin: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollToPlugin.min.js',
  DrawSVGPlugin: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/DrawSVGPlugin.min.js',
  MorphSVGPlugin: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/MorphSVGPlugin.min.js',
  ScrambleTextPlugin: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrambleTextPlugin.min.js',
  CustomEase: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/CustomEase.min.js',
};

function buildAnimationScripts({
  jsCode,
  dependencies,
  category,
  forwardKeysScript,
}) {
  return `
<script>
(function () {
  var origLog = console.log, origErr = console.error;
  function sendConsole(type, args) {
    var message = Array.from(args).map(function (a) {
      if (typeof a === 'object') { try { return JSON.stringify(a, null, 2); } catch (e) { return String(a); } }
      return String(a);
    }).join(' ');
    try { window.parent.postMessage({ type: 'console', level: type, message: message, timestamp: new Date().toISOString() }, '*'); } catch (e) {}
  }
  console.log = function () { sendConsole('log', arguments); origLog.apply(console, arguments); };
  console.error = function () { sendConsole('error', arguments); origErr.apply(console, arguments); };

  var dependencyMap = ${JSON.stringify(DEPENDENCY_URLS)};
  var requiredDeps = ${JSON.stringify(Array.isArray(dependencies) ? dependencies : [])};
  var depsToLoad = ['gsap'];
  requiredDeps.forEach(function (d) { if (d !== 'gsap' && !depsToLoad.includes(d)) depsToLoad.push(d); });

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve;
      s.onerror = function () { reject(new Error('Failed: ' + src)); };
      document.head.appendChild(s);
    });
  }
  function loadModule(url, globalName) {
    return new Promise(function (resolve, reject) {
      var eventId = 'anm-esm-' + globalName;
      var s = document.createElement('script');
      s.type = 'module';
      s.textContent = 'import * as m from "' + url + '"; window.' + globalName + ' = m; window.dispatchEvent(new CustomEvent("' + eventId + '"));';
      window.addEventListener(eventId, resolve, { once: true });
      setTimeout(function () { reject(new Error('ESM timeout: ' + url)); }, 20000);
      document.head.appendChild(s);
    });
  }
  async function loadDependencies() {
    var esmDeps = { three: 'THREE' };
    try {
      for (var i = 0; i < depsToLoad.length; i++) {
        var dep = depsToLoad[i];
        var url = dependencyMap[dep];
        if (!url) continue;
        if (esmDeps[dep]) await loadModule(url, esmDeps[dep]);
        else await loadScript(url);
      }
      return true;
    } catch (e) {
      console.error('Failed to load dependencies:', e);
      return false;
    }
  }
  function waitForGSAP(cb, attempts) {
    attempts = attempts || 0;
    if (typeof gsap === 'undefined') {
      if (attempts < 50) setTimeout(function () { waitForGSAP(cb, attempts + 1); }, 100);
      else console.error('GSAP failed to load');
      return;
    }
    var pluginsToRegister = [];
    ['ScrollTrigger','ScrollSmoother','SplitText','Flip','Draggable','InertiaPlugin','Observer','MotionPathPlugin','ScrollToPlugin','DrawSVGPlugin','MorphSVGPlugin','ScrambleTextPlugin','CustomEase']
      .forEach(function (name) { if (typeof window[name] !== 'undefined') pluginsToRegister.push(window[name]); });
    if (pluginsToRegister.length) gsap.registerPlugin.apply(gsap, pluginsToRegister);
    cb();
  }
  function runAnimation() {
    ${jsCode || "console.log('No animation code provided');"}
  }
  loadDependencies().then(function (success) {
    if (!success) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { waitForGSAP(runAnimation); });
    } else {
      waitForGSAP(runAnimation);
    }
  });
${category === 'scroll' ? `  window.addEventListener('load', function () {
    var section = document.getElementById('animation-section');
    if (!section) return;
    setTimeout(function () { section.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 600);
  });` : ''}
})();
</script>
${forwardKeysScript}
${timelineCaptureScript}
`;
}

export function buildPreviewDocument({
  templateHtml,
  processedHtmlCode,
  cssCode,
  jsCode,
  dependencies,
  animationName,
  animationDescription,
  category,
  metadata,
}) {
  const isFullWidth =
    typeof metadata?.previewFullWidth === 'boolean'
      ? metadata.previewFullWidth
      : category !== 'button';

  let html = templateHtml;

  if (isFullWidth) {
    html = html
      .replace(
        'class="preview-container"',
        'class="preview-container is-fullwidth"',
      )
      .replace(
        'class="animation-container"',
        'class="animation-container is-fullwidth"',
      )
      .replace(
        'class="preview-animation"',
        'class="preview-animation is-fullwidth"',
      );
  }

  const scripts =
    jsCode && jsCode.trim() !== ''
      ? buildAnimationScripts({
          jsCode,
          dependencies,
          category,
          forwardKeysScript: shortcutBridgeScript,
        })
      : `<script>console.log('[preview] CSS-only animation loaded');</script>${shortcutBridgeScript}`;

  return html
    .replace(/\{\{ANIMATION_NAME\}\}/g, () => animationName)
    .replace(
      /\{\{ANIMATION_DESCRIPTION\}\}/g,
      () => animationDescription,
    )
    .replace(
      /\{\{ANIMATION_HTML\}\}/g,
      () =>
        processedHtmlCode ||
        '<div class="demo-text">No preview available</div>',
    )
    .replace(/\{\{ANIMATION_CSS\}\}/g, () => cssCode || '')
    .replace(/\{\{ANIMATION_SCRIPTS\}\}/g, () => scripts);
}

