'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis/react'; // NOTE: module id: 776017
import gsap from 'gsap'; // NOTE: module id: 989970
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // NOTE: module id: 883495

gsap.registerPlugin(ScrollTrigger);

function LenisGsapSync() {
  useEffect(() => {
    const lenis = window.lenis;
    if (!lenis) return;

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker, false, true);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      delete window.lenis;
    };
  }, []);

  return null;
}

// NOTE: module id: 776017
export default function SmoothScroll({ children }) {
  return (
    <Lenis
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
    </Lenis>
  );
}

