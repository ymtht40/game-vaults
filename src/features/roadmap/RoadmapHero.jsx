'use client';

// Variable Mapping: g -> RoadmapHero, e -> counts, r -> lastShippedDaysAgo, a -> onOpenSuggest, o -> suggestOpen

import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { SecondaryButton } from '@/components/ui/SecondaryButton'; // NOTE: module id: 520237
import { RoadmapStatItem } from '@/features/roadmap/RoadmapStatItem'; // NOTE: module id: 626171
import { HERO_SUBTEXT_ANIMATION } from '@/features/roadmap/roadmap.config'; // NOTE: module id: 626171

// NOTE: module id: 626171
export function RoadmapHero({
  counts = {},
  lastShippedDaysAgo,
  onOpenSuggest,
  suggestOpen = false,
}) {
  return (
    <section className="roadmap-hero relative bg-background text-foreground">
      <div className="v2-container pt-96 pb-24 lg:pb-32">
        <div className="grid grid-cols-12 gap-x-24 gap-y-48">
          <div className="col-span-12 flex flex-col gap-20">
            <FadeIn className="flex items-center gap-12" delay={0.1}>
              <span className="relative inline-flex">
                <span
                  className="absolute inset-0 inline-block size-12 animate-ping bg-brand opacity-60"
                  aria-hidden="true"
                />
                <span className="relative block size-12 bg-brand" aria-hidden="true" />
              </span>
              <span className="text-mono-sm text-foreground/70">Launch roadmap · Live</span>
            </FadeIn>
            <RevealHeading as="h1" sizeClass="text-h1" className="font-medium" trigger="pageEnter">
              Roadmap.
            </RevealHeading>
            <div className="max-w-[52ch]">
              <AnimatedText
                tag="p"
                className="text-subheadline text-foreground-muted"
                {...HERO_SUBTEXT_ANIMATION}
              >
                What is in flight, what is queued, what we are weighing. Vote to nudge priority, or suggest something we are missing.
              </AnimatedText>
            </div>
            <FadeIn className="mt-8 flex flex-wrap items-center gap-x-16 gap-y-12" delay={0.4}>
              <Button onClick={onOpenSuggest} theme="brand" size="sm" active={suggestOpen}>
                Suggest a component
              </Button>
              <SecondaryButton href="/changelog" className="ml-auto text-body-sm">
                View changelog
              </SecondaryButton>
            </FadeIn>
          </div>
        </div>
        <FadeIn
          as="dl"
          className="mt-40 grid grid-cols-2 border-t border-foreground/15 lg:mt-64 lg:grid-cols-4"
          delay={0.5}
        >
          <RoadmapStatItem label="In flight" value={counts.inProgress || 0} accent={true} />
          <RoadmapStatItem label="Queued" value={counts.nextUp || 0} />
          <RoadmapStatItem label="Weighing" value={counts.underConsideration || 0} />
          <RoadmapStatItem
            label="Last shipped"
            value={lastShippedDaysAgo}
            suffix={lastShippedDaysAgo != null ? 'd ago' : ''}
            isMissing={lastShippedDaysAgo == null}
            href="/animations"
          />
        </FadeIn>
      </div>
    </section>
  );
}
