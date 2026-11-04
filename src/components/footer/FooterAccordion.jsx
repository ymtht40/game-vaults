'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import NavLink from '@/components/navigation/NavSurface'; // NOTE: module id: 520237

// Variable Mapping:
// E -> FooterAccordion
// o -> isOpen
// s -> setIsOpen
// l -> contentRef
// a -> iconRef
// c -> verticalLineRef
// h -> timelineRef

// NOTE: module id: 297428
export function FooterAccordion({ label, links }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const iconRef = useRef(null);
  const verticalLineRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    gsap.set(el, {
      height: 0,
      overflow: 'hidden',
      force3D: true,
    });

    const tl = gsap.timeline({
      paused: true,
      defaults: {
        duration: 0.5,
        ease: 'expo.inOut',
      },
    });

    tl.to(el, { height: 'auto' }, 0);

    if (iconRef.current) {
      tl.to(iconRef.current, { rotation: -180 }, 0);
    }

    if (verticalLineRef.current) {
      tl.to(
        verticalLineRef.current,
        {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.inOut',
        },
        0.1
      );
    }

    timelineRef.current = tl;
    return () => tl.kill();
  }, []);

  useEffect(() => {
    if (timelineRef.current) {
      if (isOpen) {
        timelineRef.current.play();
      } else {
        timelineRef.current.reverse();
      }
    }
  }, [isOpen]);

  return (
    <div className="border-b border-foreground/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-16 py-20 text-left text-foreground transition-colors duration-300"
      >
        <span className="text-mono-sm">{label}</span>
        <svg
          ref={iconRef}
          className="h-12 w-12 shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            ref={verticalLineRef}
            d="M8 1V15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
          <path
            d="M1 8H15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>
      </button>
      <div ref={contentRef}>
        <ul className="flex flex-col pb-20">
          {links.map((link) => (
            <li key={link.label}>
              <NavLink
                href={link.href}
                variant="nav"
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-body-sm -mx-12 text-foreground"
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FooterAccordion;
