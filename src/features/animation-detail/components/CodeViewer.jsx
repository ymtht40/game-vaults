'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { PlatformSwitcher, PLATFORM_LIST } from '@/features/animation-detail/components/PlatformSwitcher'; // NOTE: module id: 247733
import { toast } from 'sonner'; // NOTE: module id: 84669
import { EditorState } from '@codemirror/state'; // NOTE: module id: 356421
import { EditorView, lineNumbers } from '@codemirror/view'; // NOTE: module id: 115080
import { css } from '@codemirror/lang-css'; // NOTE: module id: 73840
import { javascript } from '@codemirror/lang-javascript'; // NOTE: module id: 837153
import { html } from '@codemirror/lang-html'; // NOTE: module id: 724433

import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { sendServerEvent } from '@/libs/utils/events'; // NOTE: module id: 185161
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { EVENTS } from '@/libs/config/onboarding'; // NOTE: module id: 734601
import { useOnboarding } from '@/providers/OnboardingProvider'; // NOTE: module id: 92451
import { getLanguage, formatCode } from '@/libs/utils/formatCode'; // NOTE: module id: 737322

import { anmEditorTheme } from '@/libs/code/anmEditorTheme'
import { anmThemeExtensions } from '@/libs/code'
import { jsonLanguage } from '@codemirror/lang-json'; // NOTE: module id: 693125 / 998540

// Replaced custom SVGs with Phosphor Icons per user request
import { Check, Copy, Info, Eye, Brain, ChatText } from '@phosphor-icons/react';

// Tooltips
import { HoverArea, TooltipManager, TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from '@/components/ui/Tooltip'; // NOTE: module id: 672706

function getTabsForPlatform(platform, animation) {
  const hasJsGsap = animation.js_code || animation.gsap_code;
  const hasWebflowCss = !!animation.webflow_css_code;

  switch (platform) {
    case "html":
      return hasJsGsap ? ["HTML", "CSS", "JS"] : ["HTML", "CSS"];
    case "react":
      return animation.demo_react_code ? ["JSX", "CSS", "Usage"] : ["JSX", "CSS"];
    case "vue":
      return animation.demo_vue_code ? ["Vue", "CSS", "Usage"] : ["Vue", "CSS"];
    case "webflow": {
      let tabs = ["JSON"];
      if (hasJsGsap) tabs.push("JS");
      if (hasWebflowCss) tabs.push("CSS");
      return tabs;
    }
    default:
      return [];
  }
}

export function McpNotice({ showMcp = false }) {
  return (
    <TooltipProvider delayDuration={150}>
    <TooltipRoot>
      <TooltipTrigger asChild>
        <button type="button" className="text-accent-xs mt-12 inline-flex items-center gap-6 text-foreground-muted transition-colors duration-(--duration-quick) hover:text-foreground">
          <Info size={13} />
          Needs GSAP
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8} className="max-w-[34ch]">
        <p className="text-body-sm font-sans normal-case leading-relaxed text-foreground">
          This component needs GSAP.{" "}
          <a href="/docs/getting-started/installation" className="text-foreground underline underline-offset-4">
            See installation.
          </a>
          {showMcp ? (
            <>
              {" "}Or{" "}
              <a href="/docs/guides/mcp" className="text-foreground underline underline-offset-4">
                connect the MCP
              </a>
              {" "}to pull components straight from your editor.
            </>
          ) : null}
        </p>
      </TooltipContent>
    </TooltipRoot>
    </TooltipProvider>
  );
}

function WebflowCopyPanel({ onCopy, copied }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-20 bg-foreground/[0.04] p-32 text-center">
      <div className="flex flex-col items-center gap-12">
        <div className="flex size-56 items-center justify-center border border-foreground/10 bg-background">
          {copied ? <Check size={20} className="text-brand" /> : <Copy size={20} className="text-foreground-muted" />}
        </div>
        <div>
          <p className="text-body font-medium text-foreground">
            {copied ? "Copied to clipboard" : "Ready to paste into Webflow"}
          </p>
          <p className="text-body-sm mt-6 max-w-[28ch] text-foreground-muted">
            {copied ? "Paste directly into Webflow with Cmd or Ctrl + V." : "Webflow needs the JSON copied as application/json - this button handles that."}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className={`text-accent-xs flex items-center gap-8 px-14 py-8 transition-opacity duration-(--duration-quick) ease-(--ease-expo-out) ${copied ? "bg-brand text-[#141314]" : "bg-foreground text-background hover:opacity-90"}`}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        <span>{copied ? "Copied" : "Copy JSON"}</span>
      </button>
    </div>
  );
}

// NOTE: module id: 343931
export function CodeViewer({ codeState, animation, onCodeChange, defaultPlatform, flush = false, hideCopyActions = false }) {
  const availablePlatforms = useMemo(() => {
    const list = [];
    if (animation.html_code || animation.css_code || animation.js_code || animation.gsap_code) list.push("html");
    if (animation.react_code) list.push("react");
    if (animation.vue_code) list.push("vue");
    if (animation.webflow_code) list.push("webflow");
    return PLATFORM_LIST.filter(p => list.includes(p));
  }, [animation]);
  const initialPlatform = availablePlatforms.includes(defaultPlatform)
    ? defaultPlatform
    : availablePlatforms[0] || "html";
  const [activePlatform, setActivePlatform] = useState(initialPlatform);
  const [activeTab, setActiveTab] = useState(() => getTabsForPlatform(initialPlatform, animation)[0] || "HTML");
  const [isCopied, setIsCopied] = useState(false);
  const [codeMode, setCodeMode] = useState("focused");
  const [isAiCopied, setIsAiCopied] = useState(false);
  
  const { active: onboardingActive, steps: onboardingSteps } = useOnboarding();
  const highlightCopy = onboardingActive && !onboardingSteps.copy;

  const editorParentRef = useRef(null);
  const editorViewRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const ignoreNextUpdateRef = useRef(false);



  useEffect(() => {
    const platform = availablePlatforms.includes(activePlatform)
      ? activePlatform : availablePlatforms[0] || "html";
    const nextTabs = getTabsForPlatform(platform, animation);
    if (platform !== activePlatform) setActivePlatform(platform);
    if (!nextTabs.includes(activeTab)) setActiveTab(nextTabs[0] || "HTML");
  }, [availablePlatforms, activePlatform, activeTab, animation]);

  const tabs = useMemo(() => getTabsForPlatform(activePlatform, animation), [activePlatform, animation]);

  const rawCode = useMemo(() => {
    if (activePlatform === "webflow" && activeTab === "CSS") return codeState.webflowCss || "";
    if (activeTab === "CSS") return codeState.css || "";
    if (activeTab === "JS" || activeTab === "Javascript") return codeState.js || "";
    if (activeTab === "HTML") return codeState.html || "";
    if (activeTab === "JSX") return codeState.react || "";
    if (activeTab === "Vue") return codeState.vue || "";
    if (activeTab === "Usage") return activePlatform === "vue" ? codeState.vueUsage || "" : codeState.reactUsage || "";
    if (activeTab === "JSON" || activeTab === "Webflow") return codeState.webflow || "";
    return codeState.html || "";
  }, [codeState, activePlatform, activeTab]);

  const fileName = (() => {
    const slug = animation.slug;
    if (activePlatform === "webflow" && activeTab === "CSS") return "custom-code.css";
    if (activeTab === "HTML") return `${slug}.html`;
    if (activeTab === "CSS") return `${slug}.css`;
    if (activeTab === "JS" || activeTab === "Javascript") return `${slug}.js`;
    if (activeTab === "JSX") return `${slug}.jsx`;
    if (activeTab === "Vue") return `${slug}.vue`;
    if (activeTab === "Usage") return activePlatform === "vue" ? "example.vue" : "example.jsx";
    if (activeTab === "JSON") return "animation.json";
    return "code";
  })();

  const langStr = getLanguage(activePlatform, activeTab);
  const finalCode = useMemo(() => codeMode === "focused" ? formatCode(rawCode, langStr) : rawCode, [codeMode, rawCode, langStr]);

  const cmLanguageExt = useMemo(() => {
    if (activeTab === "CSS") return css();
    if (activeTab === "JS" || activeTab === "Javascript") return javascript();
    if (activeTab === "JSON") return jsonLanguage;
    if (activePlatform === "react" && (activeTab === "JSX" || activeTab === "Usage")) return javascript({ jsx: true });
    return html();
  }, [activePlatform, activeTab]);

  const cmExtraExt = useMemo(() => {
    return []; // Placeholder array for original extension parser
  }, [animation.js_code, animation.gsap_code]);

  const isTrackingEditRef = useRef(false);
  const handleCodeEdit = useCallback((newCode) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onCodeChange?.(newCode, activePlatform, activeTab);
      if (!isTrackingEditRef.current) {
        isTrackingEditRef.current = true;
        analytics.track("code_edited", { animation_slug: animation.slug, platform: activePlatform });
      }
      window.dispatchEvent(new CustomEvent(EVENTS.tuned, { detail: { slug: animation.slug } }));
    }, 300);
  }, [onCodeChange, activePlatform, activeTab, animation.slug]);

  useEffect(() => {
    if (!editorParentRef.current) return;
    if (editorViewRef.current) {
      editorViewRef.current.destroy();
      editorViewRef.current = null;
    }

    const state = EditorState.create({
      doc: finalCode,
      extensions: [
        anmEditorTheme,
        cmLanguageExt,
        EditorState.allowMultipleSelections.of(true),
        lineNumbers(),
        ...anmThemeExtensions,
        ...cmExtraExt,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !ignoreNextUpdateRef.current) {
            handleCodeEdit(update.state.doc.toString());
          }
        })
      ]
    });

    const view = new EditorView({
      state,
      parent: editorParentRef.current
    });
    editorViewRef.current = view;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      view.destroy();
      if (editorViewRef.current === view) editorViewRef.current = null;
    };
  }, [activePlatform, activeTab, cmLanguageExt]);

  useEffect(() => {
    if (!editorViewRef.current) return;
    const currentDoc = editorViewRef.current.state.doc.toString();
    if (currentDoc !== finalCode) {
      ignoreNextUpdateRef.current = true;
      const tr = editorViewRef.current.state.update({
        changes: { from: 0, to: currentDoc.length, insert: finalCode }
      });
      editorViewRef.current.dispatch(tr);
      ignoreNextUpdateRef.current = false;
    }
  }, [finalCode]);

  useEffect(() => {
    if (animation?.id) {
      analytics.feature.codeViewerOpened(animation.id, activePlatform);
    }
  }, [animation?.id]);

  const handleCopy = async () => {
    try {
      if (activePlatform === "webflow" && activeTab === "JSON") {
        const handleClipboard = (event) => {
          event.clipboardData.setData("application/json", rawCode);
          event.preventDefault();
        };
        document.addEventListener("copy", handleClipboard);
        try {
          if (!document.execCommand("copy")) throw new Error("Copy failed");
        } finally {
          document.removeEventListener("copy", handleClipboard);
        }
      } else {
        await navigator.clipboard.writeText(finalCode);
      }
    } catch {
      toast.error("Unable to copy code. Please try again.");
      return;
    }

    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success(`${fileName} copied`);
    
    const name = animation.title || animation.name;
    analytics.animation.copied(animation.id, name, activePlatform, animation.category?.name || animation.category || "unknown");
    sendServerEvent("animation_copied", {
      animation_id: animation.id,
      animation_name: name,
      category: animation.category?.slug || animation.category?.name || "unknown",
      platform: activePlatform
    });
    window.dispatchEvent(new CustomEvent(EVENTS.copied, { detail: { slug: animation.slug, platform: activePlatform } }));
  };

  const isWebflowJson = activePlatform === "webflow" && activeTab === "JSON";

  return (
    <div className={cn("flex h-full flex-col overflow-hidden bg-background", flush ? "" : "border border-foreground/10")}>
      <div className="flex items-center gap-12 border-b border-foreground/10 p-12">
        <div className="min-w-0 flex-1">
          <PlatformSwitcher
            platforms={availablePlatforms}
            activePlatform={activePlatform}
            onChange={(p) => {
              setActivePlatform(p);
              setActiveTab(getTabsForPlatform(p, animation)[0]);
              analytics.track("code_viewer_tab_switched", { animation_id: animation.id, platform: p });
            }}
          />
        </div>
        {!isWebflowJson && (
          <TooltipManager delayDuration={250} side="bottom" sideOffset={8}>
            <div className="flex shrink-0 items-stretch gap-2 self-stretch bg-foreground/[0.06] p-2">
              <HoverArea id="code-mode-focused" content="Focused - comments hidden">
                <button
                  type="button"
                  onClick={() => setCodeMode("focused")}
                  aria-pressed={codeMode === "focused"}
                  aria-label="Focused - comments hidden"
                  className={cn(
                    "flex h-full w-full items-center justify-center px-10 transition-colors duration-(--duration-quick) ease-(--ease-expo-out)",
                    codeMode === "focused" ? "bg-foreground text-background" : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  <Eye size={14} />
                </button>
              </HoverArea>
              <HoverArea id="code-mode-full" content="Full - all comments (good for AI)">
                <button
                  type="button"
                  onClick={() => setCodeMode("full")}
                  aria-pressed={codeMode === "full"}
                  aria-label="Full - all comments"
                  className={cn(
                    "flex h-full w-full items-center justify-center px-10 transition-colors duration-(--duration-quick) ease-(--ease-expo-out)",
                    codeMode === "full" ? "bg-foreground text-background" : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  <ChatText size={14} />
                </button>
              </HoverArea>
            </div>
          </TooltipManager>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-12 border-b border-foreground/10 px-12 py-10">
        <span className="text-accent-xs text-foreground-muted">{fileName}</span>
        <div className="flex items-center gap-8">
          {tabs.length > 1 && (
            <div className="flex items-center gap-2 bg-foreground/[0.06] p-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`text-accent-xs px-8 py-4 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) ${isActive ? "bg-foreground text-background" : "text-foreground-muted hover:text-foreground"}`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          )}
          {hideCopyActions && !isWebflowJson && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={`Copy ${fileName}`}
              className="text-accent-xs flex items-center gap-4 bg-foreground/[0.06] px-8 py-6 text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground"
            >
              {isCopied ? <Check size={12} /> : <Copy size={12} />}
              <span>{isCopied ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {isWebflowJson ? (
          <WebflowCopyPanel onCopy={handleCopy} copied={isCopied} />
        ) : (
          <div ref={editorParentRef} className="h-full overflow-auto" style={{ fontSize: "13px" }} data-lenis-prevent={true} />
        )}
      </div>

      {!isWebflowJson && hideCopyActions && (
        <div className="shrink-0 border-t border-foreground/10 p-12">
          <McpNotice showMcp={true} />
        </div>
      )}

      {!isWebflowJson && !hideCopyActions && (
        <div className="flex shrink-0 flex-col gap-10 border-t border-foreground/10 p-12">
          <div className="flex gap-8">
            <button
              type="button"
              onClick={handleCopy}
              aria-label={isCopied ? "Copied" : "Copy code"}
              className={cn(
                "flex flex-1 items-center justify-center gap-6 py-10 text-body-sm font-medium transition-opacity duration-(--duration-quick) ease-(--ease-expo-out)",
                isCopied ? "bg-brand text-[#141314]" : "bg-foreground text-background hover:opacity-90",
                highlightCopy && !isCopied ? "outline outline-2 -outline-offset-2 outline-brand" : ""
              )}
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
              <span>{isCopied ? "Copied" : "Copy code"}</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                const name = animation.title || animation.name || "this component";
                const url = `https://app.drivexstore.shop/animations/${animation.slug}`;
                const instructionText = animation.metadata?.teaching?.blocks?.map(b => b.text).filter(Boolean).join("\n\n");
                const aiPrompt = [
                  `# ${name}`,
                  animation.description || "",
                  instructionText ? `## How it works\n\n${instructionText}` : "",
                  `## Code (${activePlatform})`,
                  "```" + langStr + "\n" + rawCode.trim() + "\n```",
                  `Source: ${url} - a production GSAP component from GameVault. Keep the data-anm-* attributes; they configure the animation.`
                ].filter(Boolean).join("\n\n");

                try {
                  await navigator.clipboard.writeText(aiPrompt);
                } catch {
                  toast.error("Unable to copy code. Please try again.");
                  return;
                }
                setIsAiCopied(true);
                setTimeout(() => setIsAiCopied(false), 2000);
                toast.success("Copied with context - paste into your AI assistant");
                analytics.track("copy_for_ai", { animation_id: animation.id, platform: activePlatform });
              }}
              aria-label="Copy for AI"
              className="flex flex-1 items-center justify-center gap-6 border border-foreground/10 bg-foreground/[0.04] py-10 text-body-sm font-medium text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground"
            >
              {isAiCopied ? <Check size={13} /> : <Brain size={13} />}
              <span>{isAiCopied ? "Copied" : "Copy for AI"}</span>
            </button>
          </div>
          <McpNotice showMcp={true} />
        </div>
      )}
    </div>
  );
}

