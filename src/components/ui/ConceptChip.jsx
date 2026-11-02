import { cx } from '@/libs/utils/className';

import TransitionLink from '@/components/navigation/TransitionLink'; // module id: 101836

export default function ConceptChip({
  category,
  slug,
  children,
  className,
}) {
  return (
    <TransitionLink
      href={`/learn/${category}/${slug}`}
      className={cx(
        'inline-flex items-center gap-8 bg-foreground/[0.05] px-10 py-6',
        'text-accent-xs normal-case text-foreground-muted',
        'transition-colors duration-(--duration-quick) ease-(--ease-expo-out)',
        'hover:bg-foreground/[0.10] hover:text-foreground',
        className,
      )}
    >
      {children}
    </TransitionLink>
  );
}