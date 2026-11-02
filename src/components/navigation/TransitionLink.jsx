'use client';

// Variable Mapping: l -> TransitionLink, e -> href, r -> onClick, s -> props, a -> ref, o -> handleClick

import { forwardRef } from 'react';
import Link from 'next/link'; // NOTE: module id: 522016
import { useTransitionLinkClick } from '@/hooks/useTransitionLinkClick'; // NOTE: module id: 995289

// NOTE: module id: 101836
const TransitionLink = forwardRef(function (
  { href, onClick, children, ...props },
  ref
) {
  const handleClick = useTransitionLinkClick(href, { onClick });

  return (
    <Link ref={ref} href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
});

export default TransitionLink;
