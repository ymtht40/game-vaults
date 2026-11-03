export function renderInlineHtml(text = '') {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-foreground/[0.06] px-6 py-1 font-mono text-[0.85em] text-foreground">$1</code>',
    );
}
