/* Variable Mapping:
   e (platforms) -> platforms
   r (activePlatform) -> activePlatform
   a (onChange) -> onChange
   n (idPrefix) -> idPrefix
   o (className) -> className
   c -> PLATFORM_LABELS 
   u -> platformIcons
   L -> PLATFORM_LABELS
   E -> PLATFORM_LIST
   U -> PlatformTabs
*/

import HtmlIcon from "@/assets/icons/HtmlIcon"; // NOTE: module id: 514162
import ReactIcon from "@/assets/icons/ReactIcon"; // NOTE: module id: 989080
import VueIcon from "@/assets/icons/VueIcon"; // NOTE: module id: 667024
import WebflowIcon from "@/assets/icons/WebflowIcon"; // NOTE: module id: 687460

import { TooltipManager as TooltipGroup, HoverArea as Tooltip } from '@/components/ui/Tooltip'; // NOTE: module id: 672706

import AnimatedTabs from '@/features/common/PillContainer'; // NOTE: module id: 876355
import { cn } from "@/libs/utils/className"; // NOTE: module id: 103746

// NOTE: module id: 247733 
export const PLATFORM_LABELS = {
  html: "HTML",
  react: "React",
  vue: "Vue",
  webflow: "Webflow"
};

const platformIcons = {
  html: HtmlIcon,
  react: ReactIcon,
  vue: VueIcon,
  webflow: WebflowIcon
};

// NOTE: module id: 247733
export const PLATFORM_LIST = ["react", "vue", "html", "webflow"];

// NOTE: module id: 247733
export function PlatformSwitcher({
  platforms,
  activePlatform,
  onChange,
  idPrefix = "code-platform",
  className
}) {
  return (
    <TooltipGroup
      delayDuration={250}
      flipDuration={0.2}
      flipEase="power3.out"
      side="top"
      sideOffset={8}
    >
      <AnimatedTabs
        activeId={activePlatform}
        duration={0.3}
        containerClassName={cn("flex items-center bg-foreground/[0.06]", className)}
        role="tablist"
      >
        {platforms.map(platform => {
          let isActive = activePlatform === platform;
          let Icon = platformIcons[platform];

          return (
            <Tooltip
              id={`${idPrefix}-${platform}`}
              content={PLATFORM_LABELS[platform]}
              key={platform}
            >
              <button
                type="button"
                data-flip-id={platform}
                onClick={() => onChange(platform)}
                aria-label={PLATFORM_LABELS[platform]}
                aria-pressed={isActive}
                role="tab"
                className={cn(
                  "relative z-10 flex h-40 w-full items-center justify-center transition-colors duration-(--duration-fast) ease-(--ease-expo-out)",
                  isActive
                    ? "text-foreground"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                {Icon && (
                  <span className="flex size-16 shrink-0 items-center justify-center">
                    <Icon />
                  </span>
                )}
              </button>
            </Tooltip>
          );
        })}
      </AnimatedTabs>
    </TooltipGroup>
  );
}
