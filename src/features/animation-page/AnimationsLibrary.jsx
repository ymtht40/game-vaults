// AnimationsLibrary.jsx
'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import AnimationsHero from '@/features/animation-page/sections/AnimationsHero'; // NOTE: module id: 599178
import NewsletterForm from '@/features/newsletter/NewsletterForm'; // NOTE: module id: 42242
import StarterPackPopup from '@/features/animation-page/components/StarterPackPopup'; // NOTE: module id: 573564

import AnimationsLibraryNav, { VIEW_MODES } from '@/features/animation-page/components/AnimationsLibraryNav'; // NOTE: module id: 108800
import { AnimationCollection } from '@/features/common/AnimationCollection'; // NOTE: module id: 425565
import { EmptyAnimationsState } from '@/features/common/EmptyAnimationsState'; // NOTE: module id: 503408
import EntCta from '@/features/common/EndCta'; // NOTE: module id: 482232
import FAQ from '@/features/animation-detil/sections/AnimationFAQ'; // NOTE: module id: 126272
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'; // NOTE: module id: 451945
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { sortOptions } from '@/features/animation-page/utils/sortOptions'; // NOTE: module id: 738629
import { useCategorySlugs, useCategoryOptions } from '@/contexts/CategoryProvider'; // NOTE: module id: 87207

const INTERACTION_OPTIONS = [
  { value: "hover", label: "Hover" },
  { value: "click", label: "Click" },
  { value: "drag", label: "Drag" },
  { value: "scroll", label: "Scroll" },
  { value: "ambient", label: "Ambient" }
];

const interactionValues = INTERACTION_OPTIONS.map(e => e.value);

export default function AnimationsLibrary({
  initialAnimations = [],
  savedAnimationIds = [],
  isAuthenticated = false,
  faq = []
}) {
  const searchParams = useSearchParams();
  const searchTimeoutRef = useRef(null);
  const categorySlugs = useCategorySlugs();
  const categoryOptions = useCategoryOptions();
  
  const [animations] = useState(initialAnimations);
  
  const [categories, setCategories] = useState(() => {
    let category = searchParams.get("category");
    if (!category) return [];
    let splitCategory = category.split(/[?&]/)[0];
    return categorySlugs.includes(splitCategory) ? [splitCategory] : [];
  });
  
  const [interaction, setInteraction] = useState(() => {
    let int = searchParams.get("interaction");
    return int && interactionValues.includes(int) ? int : null;
  });
  
  const [freeOnly, setFreeOnly] = useState(() => "1" === searchParams.get("free"));
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [sort, setSort] = useState(() => searchParams.get("sort") || "recent");
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [previousCount, setPreviousCount] = useState(0);

  useEffect(() => () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
  }, []);

  const updateUrl = useCallback((categoriesParam, searchParam, sortParam, interactionParam, freeOnlyParam) => {
    let params = new URLSearchParams();
    if (categoriesParam.length > 0) params.set("category", categoriesParam[0]);
    if (interactionParam) params.set("interaction", interactionParam);
    if (freeOnlyParam) params.set("free", "1");
    if (searchParam) params.set("search", searchParam);
    if (sortParam && "recent" !== sortParam) params.set("sort", sortParam);
    
    let url = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, "", url);
  }, []);

  const filterOptions = useMemo(() => [{
    id: "category",
    label: "Category",
    options: categoryOptions.map(option => ({
      ...option,
      count: animations.filter(anim => anim.category === option.value).length
    }))
  }], [categoryOptions, animations]);

  const interactionOptionsMapped = useMemo(() => INTERACTION_OPTIONS.map(option => ({
    ...option,
    count: animations.filter(anim => (anim.metadata?.interaction || []).includes(option.value)).length
  })), [animations]);

  const freeCount = useMemo(() => animations.filter(anim => anim.is_free_preview).length, [animations]);

  const filteredAnimations = useMemo(() => {
    let filtered = [...animations];
    
    if (categories.length > 0) {
      filtered = filtered.filter(anim => categories.includes(anim.category));
    }
    
    if (interaction) {
      filtered = filtered.filter(anim => (anim.metadata?.interaction || []).includes(interaction));
    }
    
    if (freeOnly) {
      filtered = filtered.filter(anim => anim.is_free_preview);
    }
    
    if (search.trim()) {
      let query = search.toLowerCase().trim();
      filtered = filtered.filter(anim => 
        anim.title?.toLowerCase().includes(query) || 
        anim.description?.toLowerCase().includes(query) || 
        anim.category?.toLowerCase().includes(query)
      );
    }
    
    switch (sort) {
      case "hot":
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case "new":
        filtered.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
        break;
      case "saved":
        filtered.sort((a, b) => (b.save_count || 0) - (a.save_count || 0));
        break;
      default: {
        let now = Date.now();
        let oneWeekAgo = now - 604800000;
        let twoWeeksAgo = now - 1209600000;
        let isRecent = (anim) => (anim.published_at && new Date(anim.published_at).getTime() > twoWeeksAgo) || (anim.content_updated_at && new Date(anim.content_updated_at).getTime() > oneWeekAgo) ? 1 : 0;
        
        filtered.sort((a, b) => {
          let recencyDiff = isRecent(b) - isRecent(a);
          return 0 !== recencyDiff ? recencyDiff : new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at);
        });
      }
    }
    return filtered;
  }, [animations, categories, interaction, freeOnly, search, sort]);

  const { displayedCount, sentinelRef, hasMore } = useInfiniteScroll(filteredAnimations.length, [categories, interaction, freeOnly, search, sort]);

  const displayedAnimations = useMemo(() => filteredAnimations.slice(0, displayedCount), [filteredAnimations, displayedCount]);

  const animationKey = useMemo(() => {
    let ids = filteredAnimations.slice(0, 9).map(anim => anim.id).join("-");
    return `${ids}-${viewMode}`;
  }, [filteredAnimations, viewMode]);

  useEffect(() => {
    let len = filteredAnimations.length;
    if (0 !== previousCount && previousCount !== len) {
      if (window.lenis) {
        window.lenis.scrollTo(0, {
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      } else {
        let content = document.querySelector("[data-transition-content]");
        if (content && content.scrollHeight > content.clientHeight) {
          content.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }
    setPreviousCount(len);
  }, [filteredAnimations.length, previousCount]);

  const handleCategoryChange = useCallback((newCategories) => {
    setCategories(newCategories);
    updateUrl(newCategories, search, sort, interaction, freeOnly);
    
    let filtered = [...animations];
    if (newCategories.length > 0) {
      filtered = filtered.filter(anim => newCategories.includes(anim.category));
    }
    if (interaction) {
      filtered = filtered.filter(anim => (anim.metadata?.interaction || []).includes(interaction));
    }
    if (search.trim()) {
      let query = search.toLowerCase().trim();
      filtered = filtered.filter(anim => 
        anim.title?.toLowerCase().includes(query) || 
        anim.description?.toLowerCase().includes(query) || 
        anim.category?.toLowerCase().includes(query)
      );
    }
    
    analytics.search.filtered({
      category: newCategories[0] || null,
      interaction: interaction,
      sort: sort
    }, filtered.length);
  }, [animations, search, sort, interaction, freeOnly, updateUrl]);

  const handleInteractionChange = useCallback((newInteraction) => {
    setInteraction(newInteraction);
    updateUrl(categories, search, sort, newInteraction, freeOnly);
    analytics.search.filtered({
      category: categories[0] || null,
      interaction: newInteraction,
      sort: sort
    }, filteredAnimations.length);
  }, [categories, search, sort, freeOnly, updateUrl, filteredAnimations.length]);

  const handleFreeChange = useCallback((isFree) => {
    setFreeOnly(isFree);
    updateUrl(categories, search, sort, interaction, isFree);
    analytics.search.filtered({
      category: categories[0] || null,
      interaction: interaction,
      free: isFree,
      sort: sort
    }, filteredAnimations.length);
  }, [categories, search, sort, interaction, updateUrl, filteredAnimations.length]);

  const handleSearchChange = useCallback((newSearch) => {
    setSearch(newSearch);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(() => {
      updateUrl(categories, newSearch, sort, interaction, freeOnly);
      if (newSearch.trim()) {
        let query = newSearch.toLowerCase().trim();
        let resultCount = animations.filter(anim => 
          anim.title?.toLowerCase().includes(query) || 
          anim.description?.toLowerCase().includes(query) || 
          anim.category?.toLowerCase().includes(query)
        ).length;
        
        analytics.search.performed(newSearch.trim(), resultCount, {
          category: categories[0] || null,
          sort: sort
        });
      }
    }, 300);
  }, [categories, animations, sort, interaction, freeOnly, updateUrl]);

  const handleSortChange = useCallback((newSort) => {
    setSort(newSort);
    updateUrl(categories, search, newSort, interaction, freeOnly);
    analytics.search.filtered({
      category: categories[0] || null,
      interaction: interaction,
      sort: newSort
    }, filteredAnimations.length);
  }, [categories, search, interaction, freeOnly, updateUrl, filteredAnimations.length]);

  const handleViewModeChange = useCallback((mode) => setViewMode(mode), []);

  const handleReset = useCallback(() => {
    setCategories([]);
    setInteraction(null);
    setFreeOnly(false);
    setSearch("");
    setSort("recent");
    updateUrl([], "", "recent", null, false);
  }, [updateUrl]);

  const previewImages = useMemo(() => animations.map(anim => anim.preview_image_url).filter(Boolean).slice(0, 24), [animations]);

  return (
    <div data-theme="dark" className="bg-background text-foreground">
      <AnimationsHero
        headline="GSAP animations, every framework."
        subtext="React and Vue animation components, built on GSAP. The animated UI components studios ship on real brand work - scroll reveals, magnetic buttons, text effects, page transitions. Copy what you need."
      />
      <div className="relative pb-32">
        {displayedAnimations.length === 0 ? (
          <EmptyAnimationsState query={search} onReset={handleReset} />
        ) : (
          <AnimationCollection
            animations={displayedAnimations}
            viewMode={viewMode}
            isAuthenticated={isAuthenticated}
            savedAnimationIds={savedAnimationIds}
            sentinelRef={sentinelRef}
            hasMore={hasMore}
            animationKey={animationKey}
            interstitial={isAuthenticated ? null : (
              <section data-starter-pack-band={true} className="py-32 lg:py-48">
                <div className="mx-auto flex max-w-[640px] flex-col gap-16 text-left">
                  <h3 className="text-h3 font-medium text-foreground">
                    A new free component every week.
                    <span className="block">Get the pack.</span>
                  </h3>
                  <NewsletterForm
                    source="animations-library"
                    idPrefix="animations"
                    buttonLabel="Send it to me"
                    inputSize="lg"
                  />
                </div>
              </section>
            )}
          />
        )}
        <AnimationsLibraryNav
          activeFilters={categories}
          onFiltersChange={handleCategoryChange}
          interaction={interaction}
          onInteractionChange={handleInteractionChange}
          interactionOptions={interactionOptionsMapped}
          freeOnly={freeOnly}
          onFreeChange={handleFreeChange}
          freeCount={freeCount}
          sortBy={sort}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          searchValue={search}
          onSearchChange={handleSearchChange}
          filterOptions={filterOptions}
          sortOptions={sortOptions}
          count={filteredAnimations.length}
          isAuthenticated={isAuthenticated}
        />
      </div>
      <section className="v2-container py-96 lg:py-128">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-8 lg:col-start-3">
            <FAQ items={faq} />
          </div>
        </div>
      </section>
      {isAuthenticated ? (
        <EntCta
          images={previewImages}
          minimal={true}
          headline="Find your next component."
          subtext="Filter, preview live, copy in React or Vue. The library updates every week."
          primaryCta={{
            label: "View your saved",
            href: "/animations/saved"
          }}
          secondaryCta={{
            label: "Suggest a component",
            href: "/roadmap"
          }}
        />
      ) : (
        <EntCta images={previewImages} bleed={true} />
      )}
      <StarterPackPopup
        isAuthenticated={isAuthenticated}
        source="animations-list-modal"
        idPrefix="animations-list-modal"
      />
    </div>
  );
}
