'use client';

// Variable Mapping: E -> MobileCaptureCard, e -> animation, a -> isAuthenticated, i -> hasAccess, l -> starterPack, o -> isDesktop, c -> hasTrackedRef, u -> isLinkCopied, m -> setIsLinkCopied, x -> audience, L.f -> useBreakpoint, n.H -> analytics, r.default -> Button, d.T -> FreeBadge, d.u -> StarterPackMarquee, I.default -> NewsletterForm

import { useEffect, useRef, useState } from 'react'; // NOTE: module id: 271645
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { useBreakpoint } from '@/hooks/useBreakpoint'; // NOTE: module id: 400701
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import {
  FreeBadge,
  StarterPackMarquee,
} from '@/features/paywall/PaywallBlock'; // NOTE: module id: 993603
import NewsletterForm from '@/features/newsletter/NewsletterForm'; // NOTE: module id: 42242

// NOTE: module id: 521041
export default function MobileCaptureCard({
  animation,
  isAuthenticated = false,
  hasAccess = false,
  starterPack = null,
}) {
  const isDesktop = useBreakpoint('lg');
  const hasTrackedRef = useRef(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const audience = hasAccess ? 'member' : isAuthenticated ? 'authed_no_access' : 'anon';

  useEffect(() => {
    if (!isDesktop && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      analytics.track('mobile_capture_shown', {
        animation_slug: animation.slug,
        animation_name: animation.title || animation.name,
        audience,
      });
    }
  }, [isDesktop, animation, audience]);

  if (isDesktop) return null;

  return (
    <div className="border border-foreground/10 bg-background p-24">
      <p className="text-accent-xs text-foreground-muted">On mobile</p>
      {hasAccess ? (
        <div className="mt-12 flex flex-col gap-16">
          <p className="text-body font-medium text-foreground">
            Copying is a desktop job. Send this to your desktop.
          </p>
          <Button
            theme="surface"
            size="sm"
            onClick={() => {
              try {
                const currentUrl = window.location.href;
                navigator.clipboard?.writeText(currentUrl);
                setIsLinkCopied(true);
                setTimeout(() => setIsLinkCopied(false), 2000);
                analytics.track('mobile_capture_link_copied', {
                  animation_slug: animation.slug,
                  audience,
                });
              } catch {}
            }}
          >
            {isLinkCopied ? 'Link copied' : 'Copy link'}
          </Button>
        </div>
      ) : (
        <div className="mt-12 flex flex-col gap-16">
          {animation?.is_free_preview ? (
            <>
              <div>
                <FreeBadge />
              </div>
              <p className="text-body font-medium text-foreground">
                {animation.title || animation.name} is in the free Starter Pack.
              </p>
              <p className="text-body-sm text-foreground-muted">
                This exact component in React, Vue and HTML, in your inbox, ready when
                you&apos;re back at your desk. No card, no trial.
              </p>
            </>
          ) : (
            <>
              <p className="text-body font-medium text-foreground">
                Take the free components with you.
              </p>
              <StarterPackMarquee items={starterPack} />
              <p className="text-body-sm text-foreground-muted">
                In React, Vue and HTML, in your inbox, ready when you&apos;re back at your
                desk.
              </p>
            </>
          )}
          <NewsletterForm
            source="mobile-detail"
            idPrefix="mobile-detail"
            buttonLabel="Send it to me"
            buttonSize="xs"
            wantedComponent={animation?.slug}
          />
        </div>
      )}
    </div>
  );
}
