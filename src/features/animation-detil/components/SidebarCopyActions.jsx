'use client';

// Variable Mapping: Y -> resolvePlatform, X -> getCodeForPlatform, Q -> SidebarCopyActions, e -> animation / codeState, a -> codeState, i -> hasAccess, l -> userLoading, o -> preferredPlatform, c -> isCodeCopied, d -> setIsCodeCopied, u -> isAiCopied, m -> setIsAiCopied, x -> availablePlatforms, f -> activePlatform, g -> setActivePlatform, h -> scrollToCapture, W.U -> PlatformSwitcher, W.L -> PLATFORM_NAMES, r.default -> Button, J._ -> CheckIcon, G.f -> CopyIcon, V.f -> ChatTextIcon, K.c -> toast, n.H -> analytics, D.G -> serverEvents, R.r -> EVENTS

import { useEffect, useMemo, useState } from 'react'; // NOTE: module id: 271645
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { serverEvents } from '@/libs/utils/events'; // NOTE: module id: 185161
import { toast } from 'sonner';
import { EVENTS } from '@/libs/config/onboarding'; // NOTE: module id: 734601
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import {
  PlatformSwitcher,
  PLATFORM_NAMES,
} from '@/features/common/PlatformSwitcher'; // NOTE: module id: 247733
import { CopyIcon, ChatTextIcon, CheckIcon } from '@phosphor-icons/react'; // NOTE: module id: 499839

export function resolvePlatform(codeState, preferredPlatform) {
  const hasCode = {
    react: !!codeState?.react,
    vue: !!codeState?.vue,
    html: !!(codeState?.html || codeState?.css || codeState?.js),
  };

  if (preferredPlatform && hasCode[preferredPlatform]) return preferredPlatform;
  if (hasCode.react) return 'react';
  if (hasCode.vue) return 'vue';
  return 'html';
}

export function getCodeForPlatform(codeState, platform) {
  if (platform === 'react') {
    return {
      code: codeState?.react || '',
      lang: 'jsx',
    };
  }

  if (platform === 'vue') {
    return {
      code: codeState?.vue || '',
      lang: 'vue',
    };
  }

  const sections = [];
  if (codeState?.html) {
    sections.push(`<!-- HTML -->\n${codeState.html.trim()}`);
  }
  if (codeState?.css) {
    sections.push(`<style>\n${codeState.css.trim()}\n</style>`);
  }
  if (codeState?.js) {
    sections.push(`<script>\n${codeState.js.trim()}\n</script>`);
  }

  return {
    code: sections.join('\n\n'),
    lang: 'html',
  };
}

function formatCodeForAi({ animation, code, platform, lang }) {
  const title = animation.title || animation.name || 'this component';
  const sourceUrl = `https://app.drivexstore.shop/animations/${animation.slug}`;
  const howItWorks = animation.metadata?.teaching?.blocks
    ?.map((block) => block.text)
    .filter(Boolean)
    .join('\n\n');

  return [
    `# ${title}`,
    animation.description || '',
    howItWorks ? `## How it works\n\n${howItWorks}` : '',
    `## Code (${platform})`,
    '```' + lang + '\n' + code.trim() + '\n```',
    `Source: ${sourceUrl} - a production GSAP component from GameVault. Keep the data-anm-* attributes; they configure the animation.`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

// NOTE: module id: 521041
export default function SidebarCopyActions({
  animation,
  codeState,
  hasAccess,
  userLoading = false,
  preferredPlatform = null,
}) {
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isAiCopied, setIsAiCopied] = useState(false);

  const availablePlatforms = useMemo(() => {
    const platforms = [];
    if (codeState?.react) platforms.push('react');
    if (codeState?.vue) platforms.push('vue');
    if (codeState?.html || codeState?.css || codeState?.js) platforms.push('html');
    return platforms;
  }, [codeState]);

  const [activePlatform, setActivePlatform] = useState(() =>
    resolvePlatform(codeState, preferredPlatform)
  );

  useEffect(() => {
    try {
      const savedFramework = window.localStorage.getItem('anm-docs-framework');
      if (savedFramework && availablePlatforms.includes(savedFramework)) {
        setActivePlatform(savedFramework);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (availablePlatforms.length && !availablePlatforms.includes(activePlatform)) {
      setActivePlatform(availablePlatforms[0]);
    }
  }, [availablePlatforms, activePlatform]);

  if (userLoading) return null;

  const scrollToCapture = () => {
    const elements = Array.from(document.querySelectorAll('[data-detail-capture]'));
    const target = elements.find((el) => el.offsetParent !== null) || elements[0];
    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  return (
    <div className="flex w-full flex-col gap-8">
      {availablePlatforms.length > 1 && (
        <PlatformSwitcher
          platforms={availablePlatforms}
          activePlatform={activePlatform}
          onChange={(nextPlatform) => {
            setActivePlatform(nextPlatform);
            try {
              window.localStorage.setItem('anm-docs-framework', nextPlatform);
            } catch {}
          }}
          idPrefix="sidebar-stack"
          className="w-full"
        />
      )}
      <div className="flex w-full gap-8">
        <Button
          theme="light"
          size="sm"
          className="flex-1"
          icon={isCodeCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          onClick={() => {
            if (!hasAccess) return scrollToCapture();

            const { code } = getCodeForPlatform(codeState, activePlatform);
            if (!code) return;

            navigator.clipboard.writeText(code);
            setIsCodeCopied(true);
            setTimeout(() => setIsCodeCopied(false), 2000);

            toast.success(
              `${PLATFORM_NAMES[activePlatform]} code copied`,
              activePlatform === 'html'
                ? undefined
                : {
                    description: `You also need ${animation.slug}.css. Grab it${
                      codeState?.[`${activePlatform}Usage`]
                        ? ', and a usage example,'
                        : ''
                    } from the code under the preview.`,
                  }
            );

            const animationTitle = animation.title || animation.name;
            analytics.animation.copied(
              animation.id,
              animationTitle,
              activePlatform,
              animation.category?.name || animation.category || 'unknown'
            );
            serverEvents('animation_copied', {
              animation_id: animation.id,
              animation_name: animationTitle,
              category:
                animation.category?.slug || animation.category?.name || 'unknown',
              platform: activePlatform,
            });
            window.dispatchEvent(
              new CustomEvent(EVENTS.copied, {
                detail: {
                  slug: animation.slug,
                  platform: activePlatform,
                },
              })
            );
          }}
        >
          {isCodeCopied ? 'Copied' : 'Copy code'}
        </Button>
        <Button
          theme="surface"
          size="sm"
          className="flex-1"
          icon={isAiCopied ? <CheckIcon size={14} /> : <ChatTextIcon size={14} />}
          onClick={() => {
            if (!hasAccess) return scrollToCapture();

            const { code, lang } = getCodeForPlatform(codeState, activePlatform);
            if (!code) return;

            navigator.clipboard.writeText(
              formatCodeForAi({
                animation,
                code,
                platform: activePlatform,
                lang,
              })
            );
            setIsAiCopied(true);
            setTimeout(() => setIsAiCopied(false), 2000);
            toast.success('Copied with context - paste into your AI assistant');
            analytics.track('copy_for_ai', {
              animation_id: animation.id,
              platform: activePlatform,
              source: 'sidebar',
            });
          }}
        >
          {isAiCopied ? 'Copied' : 'Copy for AI'}
        </Button>
      </div>
    </div>
  );
}
