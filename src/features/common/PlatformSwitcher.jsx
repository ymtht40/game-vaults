'use client';

import React from 'react';
import { TooltipManager, HoverArea } from '@/components/ui/Tooltip'; // NOTE: module id: 672706
import PillContainer from '@/features/common/PillContainer'; // NOTE: module id: 876355
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { FileHtml, Atom, VueLogo, Code } from '@phosphor-icons/react'; 

export const PLATFORM_NAMES = { 
 html: "HTML", 
 react: "React", 
 vue: "Vue", 
 webflow: "Webflow" 
};

export const PLATFORMS = ["react", "vue", "html", "webflow"]; 

const PLATFORM_ICONS = {
  html: FileHtml,
  react: Atom,
  vue: VueLogo, 
  webflow: Code, 
};


// NOTE: module id: 247733
export function PlatformSwitcher({
  platforms,
  activePlatform,
  onChange,
  idPrefix = "code-platform",
  className
}) {
  return (
    <TooltipManager delayDuration={250} flipDuration={0.2} flipEase="power3.out" side="top" sideOffset={8}>
      <PillContainer
        activeId={activePlatform}
        duration={0.3}
        containerClassName={cn("flex items-center bg-foreground/[0.06]", className)}
        role="tablist"
      >
        {platforms.map(platform => {
          const isActive = activePlatform === platform;
          const Icon = PLATFORM_ICONS[platform] || Code;
          
          return (
            <HoverArea key={platform} id={`${idPrefix}-${platform}`} content={PLATFORM_NAMES[platform]}>
              <button
                type="button"
                data-flip-id={platform}
                onClick={() => onChange(platform)}
                aria-label={PLATFORM_NAMES[platform]}
                aria-pressed={isActive}
                role="tab"
                className={cn(
                  "relative z-10 flex h-40 w-full items-center justify-center transition-colors duration-(--duration-fast) ease-(--ease-expo-out)",
                  isActive ? "text-foreground" : "text-foreground-muted hover:text-foreground"
                )}
              >
                {Icon && (
                  <span className="flex size-16 shrink-0 items-center justify-center">
                    <Icon weight="duotone" />
                  </span>
                )}
              </button>
            </HoverArea>
          );
        })}
      </PillContainer>
    </TooltipManager>
  );
}

