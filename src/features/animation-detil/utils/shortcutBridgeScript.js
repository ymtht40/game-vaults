
export const shortcutBridgeScript = `
<script>
(function () {
  'use strict';
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    var key = null;
    if (e.key === 'Escape') key = 'Escape';
    else if (e.key === 'f' || e.key === 'F') key = 'f';
    else if (e.key === 'r' || e.key === 'R') key = 'r';
    if (!key) return;
    try {
      window.parent.postMessage({ type: 'annnimate-shortcut', key: key }, '*');
    } catch (err) {
      // not framed, or a cross-origin parent: nothing to forward to
    }
  });
})();
</script>
`;

