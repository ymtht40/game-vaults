'use client';

import React, { useEffect } from 'react';
import { useAnimation } from '@/contexts/AnimationProvider'; // NOTE: module id: 488463

// NOTE: module id: 543860
export default function PageReadyTrigger() {
  const { revealPage } = useAnimation();

  useEffect(() => {
    document.body.setAttribute('data-page-ready', 'true');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        revealPage();
      });
    });
  }, [revealPage]);

  return null;
}
