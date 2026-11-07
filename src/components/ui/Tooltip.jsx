'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip'; // NOTE: module id: 853660
import gsap from 'gsap'; // NOTE: module id: 989970
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

export const TooltipProvider = TooltipPrimitive.Provider;
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

const TOOLTIP_CONTENT_CLASS = "z-50 overflow-hidden border border-foreground/10 bg-surface px-10 py-6 text-accent-xs text-foreground";

export const TooltipContent = React.forwardRef(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      TOOLTIP_CONTENT_CLASS,
      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = "TooltipContent";

const TooltipContext = createContext(null);

// NOTE: module id: 672706
export function HoverArea({ children, content, id }) {
  const context = useContext(TooltipContext);
  const idRef = useRef(id || `tooltip-${Math.random().toString(36).substr(2, 9)}`);
  const [node, setNode] = useState(null);
  
  const ref = useCallback((el) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (context && node) {
      context.registerTrigger(idRef.current, node);
      return () => {
        context.registerTrigger(idRef.current, null);
      };
    }
  }, [context, node]);

  if (context) {
    return (
      <div
        ref={ref}
        onMouseEnter={() => context.handleMouseEnter(idRef.current, content)}
        onMouseLeave={() => context.handleMouseLeave()}
        className="flex flex-1 min-w-0"
      >
        {children}
      </div>
    );
  }

  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipPrimitive.Provider>
  );
}

// NOTE: module id: 672706
export function TooltipManager({
  children,
  delayDuration = 300,
  flipDuration = 0.2,
  flipEase = "power3.out",
  enterDuration = 0.25,
  enterEase = "power3.out",
  exitDuration = 0.2,
  exitEase = "power2.in",
  hideDelay = 100,
  flipThreshold = 800,
  side = "top",
  sideOffset = 8
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [content, setContent] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  
  const tooltipRef = useRef(null);
  const triggersRef = useRef(new Map());
  const enterTimeoutRef = useRef(null);
  const leaveTimeoutRef = useRef(null);
  const lastMoveTimeRef = useRef(0);
  const isAnimatingOutRef = useRef(false);

  const calculatePosition = useCallback((triggerEl) => {
    let top, left;
    if (!triggerEl || !tooltipRef.current) return { top: 0, left: 0 };
    
    const triggerRect = triggerEl.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    let currentSide = side;

    switch (side) {
      case "top":
        top = triggerRect.top - tooltipRect.height - sideOffset;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        if (top < sideOffset) {
          currentSide = "bottom";
          top = triggerRect.bottom + sideOffset;
        }
        break;
      case "bottom":
        top = triggerRect.bottom + sideOffset;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        if (top + tooltipRect.height > winHeight - sideOffset) {
          currentSide = "top";
          top = triggerRect.top - tooltipRect.height - sideOffset;
        }
        break;
      case "left":
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - sideOffset;
        if (left < sideOffset) {
          currentSide = "right";
          left = triggerRect.right + sideOffset;
        }
        break;
      case "right":
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + sideOffset;
        if (left + tooltipRect.width > winWidth - sideOffset) {
          currentSide = "left";
          left = triggerRect.left - tooltipRect.width - sideOffset;
        }
        break;
      default:
        top = triggerRect.top - tooltipRect.height - sideOffset;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
    }

    left = Math.max(sideOffset, Math.min(left, winWidth - tooltipRect.width - sideOffset));
    top = Math.max(sideOffset, Math.min(top, winHeight - tooltipRect.height - sideOffset));

    return { top, left, side: currentSide };
  }, [side, sideOffset]);

  const showTooltip = useCallback((id, tooltipContent) => {
    const now = Date.now();
    const timeSinceLast = now - lastMoveTimeRef.current;
    lastMoveTimeRef.current = now;

    const triggerEl = triggersRef.current.get(id);
    if (!triggerEl) return;

    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }

    if (isVisible && activeTooltip !== id && timeSinceLast < flipThreshold && tooltipRef.current) {
      setContent(tooltipContent);
      setActiveTooltip(id);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!tooltipRef.current) return;
          const pos = calculatePosition(triggerEl);
          gsap.to(tooltipRef.current, { x: pos.left, y: pos.top, duration: flipDuration, ease: flipEase });
        });
      });
    } else {
      setContent(tooltipContent);
      setActiveTooltip(id);
      setIsVisible(true);
      requestAnimationFrame(() => {
        if (!tooltipRef.current) return;
        const pos = calculatePosition(triggerEl);
        gsap.set(tooltipRef.current, { x: pos.left, y: pos.top });
        gsap.fromTo(
          tooltipRef.current,
          { opacity: 0, scale: 0.9, yPercent: pos.side === "top" ? 5 : pos.side === "bottom" ? -5 : 0 },
          { opacity: 1, scale: 1, yPercent: 0, duration: enterDuration, ease: enterEase }
        );
      });
    }
  }, [isVisible, activeTooltip, flipThreshold, flipDuration, flipEase, enterDuration, enterEase, calculatePosition]);

  const hideTooltip = useCallback(() => {
    if (tooltipRef.current && !isAnimatingOutRef.current) {
      isAnimatingOutRef.current = true;
      gsap.to(tooltipRef.current, {
        opacity: 0,
        scale: 0.9,
        yPercent: side === "top" ? 5 : side === "bottom" ? -5 : 0,
        duration: exitDuration,
        ease: exitEase,
        onComplete: () => {
          setIsVisible(false);
          setActiveTooltip(null);
          isAnimatingOutRef.current = false;
        }
      });
    }
  }, [side, exitDuration, exitEase]);

  const registerTrigger = useCallback((id, el) => {
    if (el) {
      triggersRef.current.set(id, el);
    } else {
      triggersRef.current.delete(id);
    }
  }, []);

  const handleMouseEnter = useCallback((id, tooltipContent) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
    }

    if (isVisible) {
      showTooltip(id, tooltipContent);
    } else {
      enterTimeoutRef.current = setTimeout(() => {
        showTooltip(id, tooltipContent);
        enterTimeoutRef.current = null;
      }, delayDuration);
    }
  }, [isVisible, delayDuration, showTooltip]);

  const handleMouseLeave = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
    leaveTimeoutRef.current = setTimeout(() => {
      hideTooltip();
      leaveTimeoutRef.current = null;
    }, hideDelay);
  }, [hideDelay, hideTooltip]);

  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  return (
    <TooltipContext.Provider value={{ registerTrigger, handleMouseEnter, handleMouseLeave, activeTooltip }}>
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn("pointer-events-none fixed", TOOLTIP_CONTENT_CLASS)}
          style={{ top: 0, left: 0, opacity: 0 }}
        >
          {content}
        </div>
      )}
    </TooltipContext.Provider>
  );
}

