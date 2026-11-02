'use client';

// Variable Mapping: x -> LenisGsapSync, e -> lenis / children, t -> tickerCallback / time

import { useEffect } from 'react'; // NOTE: module id: 271645
import gsap from 'gsap'; // NOTE: module id: 989970
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // NOTE: module id: 883495
import { ReactLenis, useLenis } from 'lenis/react'; // NOTE: module id: 776017

function LenisGsapSync() {
  const lenis = useLenis(() => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    if (!lenis) return;
    window.lenis = lenis;
    const tickerCallback = (time) => {
      lenis.raf(1e3 * time);
    };
    gsap.ticker.add(tickerCallback, false, true);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tickerCallback);
      delete window.lenis;
    };
  }, [lenis]);

  return null;
}

gsap.registerPlugin(ScrollTrigger);

// NOTE: module id: 776017
export default function LenisProvider({ children }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.5,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        autoRaf: false,
      }}
    >
      <LenisGsapSync />
      {children}
    </ReactLenis>
  );
}