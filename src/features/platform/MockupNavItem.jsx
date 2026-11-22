import TransitionLink from '@/components/navigation/TransitionLink'; // NOTE: module id: 101836

/* Variable Mapping:
 * C -> MockupNavItem, e/t/l/r/n -> Icon/label/active/href/external, c/o -> className/content
 */
// NOTE: module id: 572332
export function MockupNavItem({ icon: Icon, label, active = false, href, external = false }) {
  const className = `group relative flex w-full items-center gap-8 rounded-sm px-12 py-8 text-left text-sm transition-colors duration-(--duration-quick) ${
    active
      ? 'bg-foreground/10 text-foreground'
      : 'bg-transparent text-foreground-muted hover:bg-foreground/[0.06] hover:text-foreground'
  }`;
  const content = (
    <>
      {active ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 inset-y-8 w-2 bg-brand"
        />
      ) : null}
      <span className="inline-flex size-16 items-center justify-center">
        <Icon className="size-16" />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <TransitionLink href={href} className={className}>
      {content}
    </TransitionLink>
  );
}
