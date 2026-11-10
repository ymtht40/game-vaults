'use client';

// Variable Mapping: e -> isDesktop, o -> containerRef, i -> headingRevealRef, l -> playDescriptionRevealRef, s -> ctaWrapperRef

import { useRef } from 'react'; // NOTE: module id: 271645
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import SplitTextReveal from '@/features/demos/SplitTextReveal'; // NOTE: module id: 218091
import { useBreakpoint } from '@/hooks/useBreakpoint'; // NOTE: module id: 400701
import { BrandLogo } from '@/assets/logos/BrandLogo'; // NOTE: module id: 843028
import ParticleMorphCanvas from '@/features/marketing/ParticleMorphCanvas'; // NOTE: module id: 567028
import TransitionLink from '@/components/navigation/TransitionLink'; // NOTE: module id: 101836

// NOTE: module id: 567028
export default function NotFoundPage() {
  const isDesktop = useBreakpoint('lg');
  const containerRef = useRef(null);
  const headingRevealRef = useRef(null);
  const playDescriptionRevealRef = useRef(null);
  const ctaWrapperRef = useRef(null);

  useGSAP(
    () => {
      const runEntranceAnimation = (withDelays) => {
        headingRevealRef.current?.reveal?.();
        gsap.delayedCall(0.15 * !!withDelays, () => playDescriptionRevealRef.current?.());
        if (ctaWrapperRef.current) {
          gsap.fromTo(
            ctaWrapperRef.current,
            { autoAlpha: 0, y: 12 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              ease: 'expo.out',
              delay: 0.5 * !!withDelays,
            }
          );
        }
      };

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const delayedCall = gsap.delayedCall(0.4, () => runEntranceAnimation(true));
        return () => delayedCall.kill();
      });
      mm.add('(prefers-reduced-motion: reduce)', () => runEntranceAnimation(false));

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <main
      ref={containerRef}
      data-theme="dark"
      className="not-found relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-24 text-foreground"
    >
      <TransitionLink
        href="/"
        aria-label="Annnimate home"
        className="absolute left-24 top-24 lg:left-32 lg:top-32"
      >
        <BrandLogo height={20} className="text-foreground" />
      </TransitionLink>

      <div aria-hidden="true" className="flex w-full items-center justify-center">
        {isDesktop ? (
          <ParticleMorphCanvas
            className="aspect-[16/10] w-full max-w-[1020px]"
            color="#fafafa"
            digit="404"
            count={40000}
            pointSize={0.22}
            waveSpeed={0.6}
            interactive={true}
            cameraZ={3.2}
          />
        ) : (
          <span className="text-h1 font-medium leading-none">404</span>
        )}
      </div>

      <div className="mt-24 flex flex-col items-center text-center lg:mt-32">
        <RevealHeading
          ref={headingRevealRef}
          as="h1"
          sizeClass="text-h2"
          className="font-medium"
          trigger="manual"
        >
          This page came apart.
        </RevealHeading>

        <SplitTextReveal
          tag="p"
          className="text-body-lg mt-12 max-w-[44ch] text-foreground-muted lg:mt-16"
          type="lines"
          mask="lines"
          duration={0.6}
          stagger={0.03}
          ease="power2.out"
          animationProps={{ yPercent: 100 }}
          triggerMode="manual"
          onReady={(play) => {
            playDescriptionRevealRef.current = play;
          }}
        >
          The link is gone, but the rest of Annnimate is one click away.
        </SplitTextReveal>

        <div ref={ctaWrapperRef} className="mt-24 lg:mt-32">
          <Button href="/" theme="brand" size="sm">
            BACK TO ANNNIMATE
          </Button>
        </div>
      </div>

      <nav className="sr-only" aria-label="Where to look next">
        <h2>404. Page not found.</h2>
        <p>
          The page you requested does not exist. These indexes cover everything on
          Annnimate:
        </p>
        <ul>
          <li>
            <TransitionLink href="/animations">Component library</TransitionLink>
          </li>
          <li>
            <TransitionLink href="/docs">Documentation</TransitionLink>
          </li>
          <li>
            <TransitionLink href="/developers">
              Developer and agent resources
            </TransitionLink>
          </li>
          <li>
            <a href="/sitemap.xml">Sitemap</a>
          </li>
          <li>
            <a href="/llms.txt">Link index for agents (llms.txt)</a>
          </li>
          <li>
            <a href="/agents.md">Agent guide (agents.md)</a>
          </li>
          <li>
            <a href="/openapi.json">OpenAPI specification</a>
          </li>
        </ul>
      </nav>
    </main>
  );
}