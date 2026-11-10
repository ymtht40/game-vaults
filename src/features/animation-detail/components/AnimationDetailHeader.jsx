'use client';

// Variable Mapping: p -> AnimationDetailHeader, e -> animation, s -> isSaved, a -> availableFormats, r -> totalCount, l -> detectedFormats, o -> isAuthenticated, c -> resolvedFormats, f.default -> Link, h.default -> FrameworkGuides, g.f -> SaveAnimationButton, x.f -> ArrowSquareOutIcon, n.H -> analytics

import Link from 'next/link'; // NOTE: module id: 101836
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { useUser } from '@/providers/UserProvider'; // NOTE: module id: 201220
import FrameworkGuides from '@/features/animation-page/components/FrameworkGuides'; // NOTE: module id: 367649
import { SaveAnimationButton } from '@/features/animation-page/components/SaveAnimationButton'; // NOTE: module id: 878512
import { ArrowSquareOutIcon } from '@phosphor-icons/react'; // NOTE: module id: 364203

// NOTE: module id: 521041
export default function AnimationDetailHeader({
  animation,
  isSaved,
  availableFormats = null,
  totalCount = null,
}) {
  let detectedFormats;
  const { isAuthenticated } = useUser();

  const resolvedFormats =
    availableFormats ??
    ((detectedFormats = []),
    (animation?.html_code ||
      animation?.css_code ||
      animation?.js_code ||
      animation?.gsap_code) &&
      detectedFormats.push('html'),
    animation?.react_code && detectedFormats.push('react'),
    animation?.vue_code && detectedFormats.push('vue'),
    animation?.webflow_code && detectedFormats.push('webflow'),
    detectedFormats);

  return (
    <header className="flex flex-col gap-8">
      <div className="flex flex-col gap-16">
        <h1 className="text-h1 max-w-[20ch] text-foreground">{animation.title}</h1>
        <div className="flex flex-col gap-16 lg:flex-row lg:items-end lg:justify-between lg:gap-32">
          {animation.description && (
            <p className="text-body-sm max-w-[72ch] text-foreground-muted lg:text-body">
              {animation.description}
            </p>
          )}
          <div className="flex shrink-0 flex-col gap-16 lg:items-end">
            <div className="flex items-end gap-12">
              <FrameworkGuides
                animation={animation}
                availableFormats={resolvedFormats}
                compact={true}
              />
              <SaveAnimationButton
                animation={animation}
                initialIsSaved={isSaved}
                isAuthenticated={isAuthenticated}
                variant="inline"
              />
            </div>
          </div>
        </div>
        {(totalCount || animation.is_free || animation.inspiration_source) && (
          <div className="flex flex-wrap items-baseline justify-between gap-x-32 gap-y-12">
            {totalCount ? (
              <p className="text-body-sm text-foreground-muted">
                One of{' '}
                <Link
                  href="/animations"
                  onClick={() =>
                    analytics.track(
                      'detail_browse_used',
                      {
                        action: 'orientation_link',
                        from_slug: animation.slug,
                      },
                      {
                        transport: 'sendBeacon',
                      }
                    )
                  }
                  className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors duration-(--duration-quick) hover:decoration-brand"
                >
                  {totalCount} GSAP components
                </Link>{' '}
                in React, Vue and HTML.
              </p>
            ) : null}
            {(animation.is_free || animation.inspiration_source) && (
              <div className="ml-auto flex items-center gap-16">
                {animation.is_free && (
                  <span className="text-accent-2xs bg-brand px-8 py-4 font-medium text-[#141314]">
                    Free
                  </span>
                )}
                {animation.inspiration_source && (
                  <a
                    href={animation.inspiration_source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-6 text-body-sm text-foreground-muted transition-colors duration-(--duration-quick) hover:text-foreground"
                  >
                    <span>
                      Inspired by{' '}
                      {animation.metadata?.inspiration_label ||
                        new URL(animation.inspiration_source).hostname
                          .replace(/^www\./, '')
                          .split('.')[0]}
                    </span>
                    <ArrowSquareOutIcon size={14} />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
