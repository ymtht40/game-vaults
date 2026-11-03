'use client';

import TransitionLink from '@/components/navigation/TransitionLink'; // module id: 101836

export default function DocCardLink({
  href,
  title,
  line,
  media = null,
  cardRef,
  onPointerEnter,
  onPointerLeave,
}) {
  return (
    <TransitionLink
      ref={cardRef}
      href={href}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className="group flex h-full flex-col border border-foreground/10 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:border-foreground/30"
    >
      {media}

      <span className="flex flex-col gap-6 px-16 py-14">
        <span className="text-body-sm font-medium text-foreground transition-colors duration-(--duration-quick) group-hover:text-brand">
          {title}
        </span>

        {line ? (
          <span className="text-body-sm line-clamp-2 text-foreground-muted">
            {line}
          </span>
        ) : null}
      </span>
    </TransitionLink>
  );
}
