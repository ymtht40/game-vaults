'use client';

// NOTE: module id: 672706
import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/libs/utils/className';
import gsap from 'gsap'; 

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden border border-foreground/10 bg-surface px-10 py-6 text-accent-xs text-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const AnimatedTooltipContext = React.createContext(null);

function AnimatedTooltipTrigger({ children, content, id }) {
  const context = React.useContext(AnimatedTooltipContext);
  const triggerId = React.useRef(id || `tooltip-${Math.random().toString(36).substr(2, 9)}`);
  const [triggerNode, setTriggerNode] = React.useState(null);
  
  const refCallback = React.useCallback(node => {
    setTriggerNode(node);
  }, []);

  React.useEffect(() => {
    if (context && triggerNode) {
      context.registerTrigger(triggerId.current, triggerNode);
      return () => {
        context.registerTrigger(triggerId.current, null);
      };
    }
  }, [context, triggerNode]);

  if (context) {
    return (
      <div
        ref={refCallback}
        onMouseEnter={() => context.handleMouseEnter(triggerId.current, content)}
        onMouseLeave={() => context.handleMouseLeave()}
        className="flex flex-1 min-w-0"
      >
        {children}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AnimatedTooltipProvider({
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
  const [activeTooltip, setActiveTooltip] = React.useState(null);
  const [content, setContent] = React.useState("");
  const [isVisible, setIsVisible] = React.useState(false);
  
  const tooltipRef = React.useRef(null);
  const triggersRef = React.useRef(new Map());
  const enterTimeoutRef = React.useRef(null);
  const leaveTimeoutRef = React.useRef(null);
  const lastActiveTimeRef = React.useRef(0);
  const isAnimatingOutRef = React.useRef(false);

  const calculatePosition = React.useCallback((triggerNode) => {
    let top, left;
    if (!triggerNode || !tooltipRef.current) return { top: 0, left: 0 };
    
    const triggerRect = triggerNode.getBoundingClientRect();
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

  const showTooltip = React.useCallback((id, newContent) => {
    const now = Date.now();
    const timeDiff = now - lastActiveTimeRef.current;
    lastActiveTimeRef.current = now;
    
    const triggerNode = triggersRef.current.get(id);
    if (triggerNode) {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = null;
      }
      
      if (isVisible && activeTooltip !== id && timeDiff < flipThreshold && tooltipRef.current) {
        setContent(newContent);
        setActiveTooltip(id);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!tooltipRef.current) return;
            const pos = calculatePosition(triggerNode);
            gsap.to(tooltipRef.current, { x: pos.left, y: pos.top, duration: flipDuration, ease: flipEase });
          });
        });
      } else {
        setContent(newContent);
        setActiveTooltip(id);
        setIsVisible(true);
        requestAnimationFrame(() => {
          if (!tooltipRef.current) return;
          const pos = calculatePosition(triggerNode);
          gsap.set(tooltipRef.current, { x: pos.left, y: pos.top });
          gsap.fromTo(tooltipRef.current, 
            { opacity: 0, scale: 0.9, yPercent: pos.side === "top" ? 5 : pos.side === "bottom" ? -5 : 0 }, 
            { opacity: 1, scale: 1, yPercent: 0, duration: enterDuration, ease: enterEase }
          );
        });
      }
    }
  }, [isVisible, activeTooltip, flipThreshold, flipDuration, flipEase, enterDuration, enterEase, calculatePosition]);

  const hideTooltip = React.useCallback(() => {
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

  const registerTrigger = React.useCallback((id, node) => {
    if (node) {
      triggersRef.current.set(id, node);
    } else {
      triggersRef.current.delete(id);
    }
  }, []);

  const handleMouseEnter = React.useCallback((id, content) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    
    if (isVisible) {
      showTooltip(id, content);
    } else {
      enterTimeoutRef.current = setTimeout(() => {
        showTooltip(id, content);
        enterTimeoutRef.current = null;
      }, delayDuration);
    }
  }, [isVisible, delayDuration, showTooltip]);

  const handleMouseLeave = React.useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
    leaveTimeoutRef.current = setTimeout(() => {
      hideTooltip();
      leaveTimeoutRef.current = null;
    }, hideDelay);
  }, [hideDelay, hideTooltip]);

  React.useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  return (
    <AnimatedTooltipContext.Provider value={{ registerTrigger, handleMouseEnter, handleMouseLeave, activeTooltip }}>
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn("pointer-events-none fixed z-50 overflow-hidden border border-foreground/10 bg-surface px-10 py-6 text-accent-xs text-foreground")}
          style={{ top: 0, left: 0, opacity: 0 }}
        >
          {content}
        </div>
      )}
    </AnimatedTooltipContext.Provider>
  );
}

export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  AnimatedTooltipProvider,
  AnimatedTooltipTrigger
};
