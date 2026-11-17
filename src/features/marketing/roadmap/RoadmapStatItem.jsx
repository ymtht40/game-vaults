'use client';

// Variable Mapping: m -> RoadmapStatItem, e -> label, r -> value, a -> suffix, n -> accent, s -> isMissing, i -> href, l -> Wrapper, c -> wrapperProps

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import AnimatedNumber from '@/components/motion/AnimatedNumber'; // NOTE: module id: 162387
import TransitionLink from '@/components/navigation/TransitionLink'; // NOTE: module id: 101836

// NOTE: module id: 626171
export function RoadmapStatItem({ label, value, suffix, accent, isMissing, href }) {
  const Wrapper = href ? TransitionLink : 'div';
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'group flex flex-col gap-8 border-b border-r border-foreground/15 px-16 py-16 last:border-r-0 [&:nth-child(2)]:border-r-0 [&:nth-child(n+3)]:border-b-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r lg:px-20 lg:py-20',
        href &&
          'transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:bg-foreground/[0.03]'
      )}
    >
      <dt className="flex items-center gap-8 text-accent-xs text-foreground/55">
        {accent && <span className="inline-block size-6 bg-brand" aria-hidden="true" />}
        <span>{label}</span>
      </dt>
      <dd className="flex items-baseline gap-6 text-h3 font-medium leading-none tabular-nums text-foreground">
        {isMissing ? (
          <span className="text-foreground/30">--</span>
        ) : (
          <>
            <AnimatedNumber
              value={value || 0}
              duration={1.1}
              ease="expo.out"
              triggerMode="scroll"
              className="text-h3 font-medium leading-none tabular-nums"
            />
            {suffix && <span className="text-accent-xs text-foreground/55">{suffix}</span>}
          </>
        )}
      </dd>
    </Wrapper>
  );
}
