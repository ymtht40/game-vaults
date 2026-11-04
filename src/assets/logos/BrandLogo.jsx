'use client';

import React, { useRef } from 'react';
import Link from 'next/link'; // NOTE: module id: 522016
import AnnnimateLogo from '@/assets/logos/LogoText'; // NOTE: module id: 867584
import { AnimatedStrokeIcon } from '@/assets/icons/AnimatedStrokeIcon'; // NOTE: module id: 503433
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { useTransitionLinkClick } from '@/hooks/useTransitionLinkClick'; // NOTE: module id: 995289
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682

// NOTE: module id: 635566
export function BrandLogo({ className }) {
  const handleClick = useTransitionLinkClick('/');
  const iconRef = useRef(null);

  return (
    <Link
      href="/"
      onClick={handleClick}
      onMouseEnter={() => iconRef.current?.play()}
      aria-label="Annnimate - Home"
      className={cn('flex shrink-0 items-end justify-start gap-8', className)}
    >
      <span className="flex items-end gap-6">
        <AnimatedStrokeIcon ref={iconRef} className="h-[15px] lg:h-[18px]" />
        <AnnnimateLogo className="h-[15px] w-auto text-foreground lg:h-[18px]" />
      </span>
      <span className="-mb-2 mt-auto text-[9px] text-foreground-muted lg:text-[10px]">
        {t('common.header.logoByline')}
      </span>
    </Link>
  );
}

