'use client';

// Variable Mapping: e -> animation, a -> isSaved, r -> relatedAnimations, c -> currentUserSavedAnimations, m -> conceptsInComponent, x -> availableFormats, f -> totalCount, g -> starterPack, h -> faq, w -> hasAccess, N -> isAuthenticated, _ -> loading, C -> profile, P -> codeState, $ -> setCodeState, H -> handleCodeChange, R -> isCustomizable, L -> rootSelectorAttr, I -> configurables, F -> customizeApiConfig, B -> draftCustomValues, G -> setDraftCustomValues, V -> committedCustomValues, J -> setCommittedCustomValues, K -> handleCustomChange, D -> handleCustomCommit, W -> handleApplyPreset, Y -> handleCustomReset, X -> savedAnimationIds, Z -> hasTrackedPaywallRef, ee -> stickySidebarRef

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'; // NOTE: module id: 271645
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { useUser } from '@/providers/UserProvider'; // NOTE: module id: 201220
import {
  getConfigurableCount,
  DEFAULT_CUSTOMIZE_OFFSET,
  getPrimarySelectorAttribute,
  getValidConfigurables,
  slugToPascalCase,
  applyHtmlConfigurables,
  applyReactConfigurables,
  applyVueConfigurables } from '@/libs/config/configurables'; // NOTE: module id: 726368
import { ProvenanceChip } from '@/components/ui/ProvenanceChip'; // NOTE: module id: 909247
import AnimationPreview from '@/features/animation-detail/preview/AnimationPreview'; // NOTE: module id: 113861
import StaggerSegments from '@/features/animation-page/components/StaggerSegments'; // NOTE: module id: 444230
import AttributesTable from '@/features/animation-page/components/AttributesTable'; // NOTE: module id: 747198
import UseCaseItem from '@/features/animation-page/components/UseCaseItem'; // NOTE: module id: 799422
import { CustomizePanel } from '@/features/animation-detail/components/CustomizePanel'; // NOTE: module id: 135178
import { CodeViewer, McpNotice } from '@/features/animation-detail/components/CodeViewer'; // NOTE: module id: 343931
import { PaywallBlock } from '@/features/paywall/PaywallBlock'; // NOTE: module id: 993603
import FaqSection from '@/features/animation-detail/sections/AnimationFAQ'; // NOTE: module id: 126272
import StarterPackPopup from '@/features/newsletter/StarterPackPopup'; // NOTE: module id: 573564

import AnimationViewTracker from '@/features/animation-detail/preview/AnimationViewTracker';
import CodeAccessGate from '@/features/animation-detail/components/CodeAccessGate';
import AnimationDetailHeader from '@/features/animation-detail/components/AnimationDetailHeader';
import ProvenanceSection from '@/features/animation-detail/sections/ProvenanceSection';
import TeachingSection from '@/features/animation-detail/sections/TeachingSection';
import RequirementsSection from '@/features/animation-detail/sections/RequirementsSection';
import RelatedAnimationsSection from '@/features/animation-detail/sections/RelatedAnimationsSection';
import FirstComponentBanner from '@/features/animation-detail/components/FirstComponentBanner';
import MobileCaptureCard from '@/features/animation-detail/components/MobileCaptureCard';
import CategoryBrowseSection from '@/features/animation-detail/sections/CategoryBrowseSection';
import SidebarCopyActions from '@/features/animation-detail/components/SidebarCopyActions';
import InlineCodeCollapsible from '@/features/animation-detail/components/InlineCodeCollapsible';
import LockedDocsCallout from '@/features/animation-detail/components/LockedDocsCallout';

// NOTE: module id: 521041
export default function AnimationDetailPage({
  animation,
  isSaved,
  relatedAnimations,
  currentUserSavedAnimations = [],
  conceptsInComponent = [],
  availableFormats = null,
  totalCount = null,
  starterPack = null,
  faq = [],
}) {
  const { hasAccess, isAuthenticated, loading, profile } = useUser();

  const [codeState, setCodeState] = useState({
    html: animation.html_code || '',
    css: animation.css_code || '',
    js: animation.js_code || animation.gsap_code || '',
    react: animation.react_code || '',
    vue: animation.vue_code || '',
    reactUsage: animation.demo_react_code || '',
    vueUsage: animation.demo_vue_code || '',
    webflow: animation.webflow_code || '',
    webflowCss: animation.webflow_css_code || '',
  });

  const handleCodeChange = useCallback((newCode, platform, tabName) => {
    const stateKey =
      platform === 'webflow' && tabName === 'CSS'
        ? 'webflowCss'
        : tabName === 'CSS'
          ? 'css'
          : tabName === 'JS' || tabName === 'Javascript'
            ? 'js'
            : tabName === 'HTML'
              ? 'html'
              : tabName === 'JSX'
                ? 'react'
                : tabName === 'Vue'
                  ? 'vue'
                  : tabName === 'Usage'
                    ? platform === 'vue'
                      ? 'vueUsage'
                      : 'reactUsage'
                    : tabName === 'JSON' || tabName === 'Webflow'
                      ? 'webflow'
                      : 'html';

    setCodeState((prev) => ({
      ...prev,
      [stateKey]: newCode,
    }));
  }, []);

  const isCustomizable = getConfigurableCount(animation) >= DEFAULT_CUSTOMIZE_OFFSET;
  const rootSelectorAttr = useMemo(() => getPrimarySelectorAttribute(animation), [animation]);
  const configurables = useMemo(() => getValidConfigurables(animation), [animation]);
  const customizeApiConfig = useMemo(
    () => slugToPascalCase(animation.slug),
    [animation.slug]
  );

  const [draftCustomValues, setDraftCustomValues] = useState({});
  const [committedCustomValues, setCommittedCustomValues] = useState({});

  const handleCustomChange = useCallback((attrKey, attrValue) => {
    setDraftCustomValues((prev) => ({
      ...prev,
      [attrKey]: attrValue,
    }));
  }, []);

  const handleCustomCommit = useCallback((attrKey, attrValue) => {
    setCommittedCustomValues((prev) => ({
      ...prev,
      [attrKey]: attrValue,
    }));
  }, []);

  const handleApplyPreset = useCallback(
    (presetAttrs) => {
      const entries = Object.entries(presetAttrs || {});
      if (entries.length === 0) return;

      setDraftCustomValues((prev) => {
        const next = { ...prev };
        for (const [key, val] of entries) next[key] = val;
        return next;
      });
      setCommittedCustomValues((prev) => {
        const next = { ...prev };
        for (const [key, val] of entries) next[key] = val;
        return next;
      });

      analytics.track('customize_preset_applied', {
        animation_slug: animation.slug,
        attrs: entries.map(([key]) => key),
      });
    },
    [animation.slug]
  );

  const handleCustomReset = useCallback(() => {
    setDraftCustomValues({});
    setCommittedCustomValues({});
    setCodeState((prev) => ({
      ...prev,
      html: animation.html_code || '',
      react: animation.react_code || '',
      vue: animation.vue_code || '',
    }));
  }, [animation.html_code, animation.react_code, animation.vue_code]);

  useEffect(() => {
    if (
      isCustomizable &&
      hasAccess &&
      Object.keys(committedCustomValues).length !== 0
    ) {
      setCodeState((prev) => ({
        ...prev,
        html: applyHtmlConfigurables(
          prev.html,
          committedCustomValues,
          rootSelectorAttr
        ),
        react: applyReactConfigurables(
          prev.react,
          committedCustomValues,
          configurables
        ),
        vue: applyVueConfigurables(
          prev.vue,
          committedCustomValues,
          configurables
        ),
      }));
    }
  }, [
    committedCustomValues,
    isCustomizable,
    hasAccess,
    rootSelectorAttr,
    configurables,
  ]);

  const savedAnimationIds = (currentUserSavedAnimations || []).map(
    (item) => item.animation_id || item.id
  );
  const hasTrackedPaywallRef = useRef(false);

  useEffect(() => {
    if (!loading && !hasAccess && !hasTrackedPaywallRef.current) {
      hasTrackedPaywallRef.current = true;
      analytics.track('copy_blocked_paywall', {
        animation_id: animation.id,
        animation_name: animation.title || animation.name,
        animation_slug: animation.slug,
        category:
          animation.category?.slug || animation.category?.name || 'unknown',
        authenticated: isAuthenticated,
      });
    }
  }, [loading, hasAccess, isAuthenticated, animation]);

  const stickySidebarRef = useRef(null);

  useEffect(() => {
    const sidebarEl = stickySidebarRef.current;
    if (!sidebarEl) return;

    let rafId = 0;
    const updateHeight = () => {
      rafId = 0;
      const topOffset = sidebarEl.getBoundingClientRect().top;
      sidebarEl.style.height = `${Math.max(
        360,
        Math.round(window.innerHeight - topOffset - 24)
      )}px`;
    };
    const handleResize = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      data-theme="dark"
      data-transition-content=""
      className="min-h-screen bg-background text-foreground"
    >
      <AnimationViewTracker animation={animation} />
      <FirstComponentBanner
        slug={animation.slug}
        platform={profile?.preferred_platform}
      />

      <section className="v2-container pt-96 pb-16 lg:pb-24">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-10 lg:col-start-3">
            <AnimationDetailHeader
              animation={animation}
              isSaved={isSaved}
              availableFormats={availableFormats}
              totalCount={totalCount}
            />
          </div>
        </div>
      </section>

      <section className="v2-container pb-32 lg:pb-64">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 flex flex-col gap-24 lg:col-span-7 lg:col-start-3 lg:gap-32">
            <AnimationPreview
              animation={animation}
              codeState={codeState}
              customize={
                isCustomizable && !hasAccess
                  ? {
                      values: draftCustomValues,
                      committed: committedCustomValues,
                      selector: `[${rootSelectorAttr}]`,
                      api: customizeApiConfig,
                    }
                  : null
              }
            />
            <StaggerSegments animation={animation} hasAccess={hasAccess} />

            {isCustomizable && (
              <InlineCodeCollapsible
                animation={animation}
                codeState={codeState}
                onCodeChange={handleCodeChange}
                hasAccess={hasAccess}
                userLoading={loading}
                preferredPlatform={profile?.preferred_platform}
                isAuthenticated={isAuthenticated}
                starterPack={starterPack}
              />
            )}

            <div data-detail-capture={true}>
              <MobileCaptureCard
                animation={animation}
                isAuthenticated={isAuthenticated}
                hasAccess={hasAccess}
                starterPack={starterPack}
              />
            </div>

            <ProvenanceSection animation={animation} />

            <div className="-mb-8">
              <ProvenanceChip animation={animation} size="default" />
            </div>

            <TeachingSection animation={animation} />
            <RequirementsSection
              animation={animation}
              concepts={conceptsInComponent}
            />

            {hasAccess ? (
              <>
                {!isCustomizable && <AttributesTable animation={animation} />}
                <UseCaseItem
                  animation={animation}
                  onApplyPreset={isCustomizable && hasAccess ? handleApplyPreset : null}
                />
              </>
            ) : loading ? null : (
              <LockedDocsCallout isAuthenticated={isAuthenticated} />
            )}

            <FaqSection items={faq} heading="Frequently asked" />
          </div>

          {isCustomizable ? (
            <aside className="col-span-12 mt-48 lg:col-span-3 lg:col-start-10 lg:mt-0">
              <div className="flex h-full flex-col gap-24">
                <div className="lg:sticky lg:top-[var(--v2-sticky-top)] lg:pb-72 has-[[aria-expanded=true]]:z-10">
                  {animation.is_free_preview &&
                    !hasAccess &&
                    !isAuthenticated &&
                    !loading && (
                      <div
                        data-detail-capture={true}
                        className="hidden border-b border-foreground/10 pb-24 mb-24 lg:block"
                      >
                        <PaywallBlock
                          animation={animation}
                          isAuthenticated={isAuthenticated}
                          showCheckout={false}
                        />
                      </div>
                    )}
                  <CustomizePanel
                    animation={animation}
                    values={draftCustomValues}
                    onChange={handleCustomChange}
                    onCommit={handleCustomCommit}
                    onReset={handleCustomReset}
                    locked={!hasAccess && !loading}
                  />
                </div>

                <div className="flex flex-col gap-24 lg:sticky lg:bottom-16 lg:mt-auto lg:bg-background lg:pt-16">
                  {hasAccess && (
                    <SidebarCopyActions
                      animation={animation}
                      codeState={codeState}
                      hasAccess={hasAccess}
                      userLoading={loading}
                      preferredPlatform={profile?.preferred_platform}
                    />
                  )}
                  {!hasAccess &&
                    !loading &&
                    !(animation.is_free_preview && !isAuthenticated) && (
                      <div
                        data-detail-capture={true}
                        className="hidden border-t border-foreground/10 pt-20 lg:block"
                      >
                        <PaywallBlock
                          animation={animation}
                          isAuthenticated={isAuthenticated}
                        />
                      </div>
                    )}
                </div>
              </div>
            </aside>
          ) : (
            <aside className="col-span-12 mt-48 lg:col-span-3 lg:col-start-10 lg:mt-0">
              <div
                ref={stickySidebarRef}
                className="sticky top-[var(--v2-sticky-top)] flex h-[calc(100dvh_-_var(--v2-sticky-top)_-_2rem)] flex-col bg-background"
              >
                <div className="min-h-0 flex-1">
                  <CodeAccessGate
                    hasAccess={hasAccess}
                    loading={loading}
                    isAuthenticated={isAuthenticated}
                    animation={animation}
                    starterPack={starterPack}
                  >
                    <CodeViewer
                      codeState={codeState}
                      animation={animation}
                      onCodeChange={handleCodeChange}
                      defaultPlatform={profile?.preferred_platform}
                      flush={true}
                    />
                  </CodeAccessGate>
                </div>
                {!hasAccess && <McpNotice showMcp={false} />}
              </div>
            </aside>
          )}
        </div>
      </section>

      <RelatedAnimationsSection
        animation={animation}
        relatedAnimations={relatedAnimations}
        isAuthenticated={isAuthenticated}
        savedAnimationIds={savedAnimationIds}
      />

      <CategoryBrowseSection
        currentCategory={animation.category}
        slug={animation.slug}
      />

      <StarterPackPopup isAuthenticated={isAuthenticated} />
    </div>
  );
}
