'use client';

// Variable Mapping: ea -> FALLBACK_PREVIEW_LINES, en -> PLATFORM_TAB_NAMES, er -> PLATFORM_LANGUAGES, ei -> ToggleCodeButton, el -> InlineCodeCollapsible, e -> animation / icon, r -> codeState, i -> onCodeChange, l -> hasAccess, c -> userLoading, u -> preferredPlatform, m -> isAuthenticated, x -> starterPack, f -> isExpanded, g -> setIsExpanded, h -> hasTrackedOpenRef, p -> activePlatform, j -> previewSnippet, o.U -> CodeViewer, et.default -> CodeBlock, es.w -> formatCodePreview, es.c -> getCodeLanguageConfig, ee.f -> CaretUpIcon, Z.f -> CaretDownIcon, a.f -> LockIcon, d.U -> PaywallBlock, n.H -> analytics

import { useMemo, useRef, useState } from 'react'; // NOTE: module id: 271645
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { CodeViewer } from '@/features/common/CodeViewer'; // NOTE: module id: 343931
import CodeBlock from '@/features/common/CodeBlock'; // NOTE: module id: 317840
import {
  formatCode,
  getLanguage,
} from '@/libs/utils/formatCode'; // NOTE: module id: 737322
import { PaywallBlock } from '@/features/paywall/PaywallBlock'; // NOTE: module id: 993603
import { LockIcon, CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react'; // NOTE: module id: 331991
import { resolvePlatform } from '@/features/animation-detil/components/SidebarCopyActions';

const FALLBACK_PREVIEW_LINES = `import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function init(root) {
  const items = root.querySelectorAll("[data-anm-item]");
  const tl = gsap.timeline({ paused: true });

  tl.from(items, {
    yPercent: 120,
    opacity: 0,
    duration: 0.8,
    stagger: 0.06,
    ease: "expo.out",
  });

  root.addEventListener("mouseenter", () => tl.play());
  root.addEventListener("mouseleave", () => tl.reverse());

  return { play: () => tl.restart() };
}`.split('\n');

const PLATFORM_TAB_NAMES = {
  react: 'JSX',
  vue: 'Vue',
  html: 'HTML',
};

const PLATFORM_LANGUAGES = {
  react: 'jsx',
  vue: 'html',
  html: 'html',
};

function ToggleCodeButton({ icon, label, onClick, topBorder = true }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-6 py-8 text-[13px] font-sans text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground ${
        topBorder ? 'border-t border-foreground/10' : ''
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// NOTE: module id: 521041
export default function InlineCodeCollapsible({
  animation,
  codeState,
  onCodeChange,
  hasAccess,
  userLoading = false,
  preferredPlatform = null,
  isAuthenticated = false,
  starterPack = null,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasTrackedOpenRef = useRef(false);

  const activePlatform = useMemo(
    () => resolvePlatform(codeState, preferredPlatform),
    [codeState, preferredPlatform]
  );

  const previewSnippet = useMemo(() => {
    const rawCode =
      activePlatform === 'react'
        ? codeState?.react
        : activePlatform === 'vue'
          ? codeState?.vue
          : codeState?.html;
    const tabName = PLATFORM_TAB_NAMES[activePlatform];
    return formatCode(
      rawCode || '',
      getLanguage(activePlatform, tabName)
    )
      .split('\n')
      .slice(0, 10)
      .join('\n');
  }, [codeState, activePlatform]);

  if (userLoading) return null;

  if (hasAccess) {
    return isExpanded ? (
      <div className="flex flex-col border border-foreground/10">
        <div className="h-[520px]">
          <CodeViewer
            codeState={codeState}
            animation={animation}
            onCodeChange={onCodeChange}
            defaultPlatform={preferredPlatform}
            flush={true}
            hideCopyActions={true}
          />
        </div>
        <ToggleCodeButton
          icon={<CaretUpIcon size={12} />}
          label="Collapse code"
          onClick={() => setIsExpanded(false)}
        />
      </div>
    ) : (
      <div className="flex flex-col overflow-hidden border border-foreground/10">
        <div className="pointer-events-none relative max-h-[190px] select-none overflow-hidden">
          <CodeBlock
            language={PLATFORM_LANGUAGES[activePlatform]}
            copyable={false}
            headerless={true}
            maxHeight="190px"
            fontSize="13px"
          >
            {previewSnippet}
          </CodeBlock>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, transparent 30%, var(--background) 96%)',
            }}
          />
        </div>
        <ToggleCodeButton
          icon={<CaretDownIcon size={12} />}
          label="View code"
          onClick={() => setIsExpanded(true)}
        />
      </div>
    );
  }

  return isExpanded ? (
    <div className="flex flex-col border border-foreground/10">
      <div className="relative overflow-hidden">
        <pre
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre p-20 font-mono text-[12px] leading-[1.7] text-foreground/[0.09] select-none"
        >
          {FALLBACK_PREVIEW_LINES.join('\n')}
        </pre>
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--background) 62%)',
          }}
        />
        <div className="relative flex justify-center px-24 py-40">
          <PaywallBlock
            animation={animation}
            isAuthenticated={isAuthenticated}
            starterPack={starterPack}
            trackShown={false}
          />
        </div>
      </div>
      <ToggleCodeButton
        icon={<CaretUpIcon size={12} />}
        label="Close"
        onClick={() => setIsExpanded(false)}
      />
    </div>
  ) : (
    <div className="flex flex-col overflow-hidden border border-foreground/10 bg-foreground/[0.02]">
      <div className="flex h-80 items-center justify-center">
        <div className="flex items-center gap-10 text-foreground-muted">
          <LockIcon size={14} />
          <span className="text-body-sm">
            The full source for {animation.title || 'this component'} is locked.
          </span>
        </div>
      </div>
      <ToggleCodeButton
        icon={<CaretDownIcon size={12} />}
        label="Get the code"
        onClick={() => {
          setIsExpanded(true);
          if (!hasTrackedOpenRef.current) {
            hasTrackedOpenRef.current = true;
            analytics.track('locked_code_opened', {
              animation_slug: animation.slug,
              animation_name: animation.title || animation.name,
            });
          }
        }}
      />
    </div>
  );
}
