'use client';

// Variable Mapping: S -> isNewAnimation, R -> AnimationListRow, I -> AnimationListView, D -> GRID_COLS_BY_MODE, O -> GRID_GAP_BY_MODE, e -> animations, n -> viewMode, s -> isAuthenticated, r -> savedAnimationIds, l -> sentinelRef, o -> hasMore, i -> animationKey, d -> interstitial, c -> tileProps, u -> listProps, m -> savedIdsSet, x -> gridRef, f -> prevAnimationKeyRef

import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react'; // NOTE: module id: 271645
import TransitionLink from '@/components/navigation/TransitionLink'; // NOTE: module id: 101836
import {
  f as ArrowIcon,
  f as BookmarkIcon,
} from '@phosphor-icons/react'; // NOTE: module id: 933325, 683845
import { formatImageUrl } from '@/libs/utils/formatImageUrl'; // NOTE: module id: 632021
import AnimationCard from '@/animations/AnimationCard'; // NOTE: module id: 591611
import { MediaHoverReveal } from '@/features/common/MediaHoverReveal'; // NOTE: module id: 934783
import { useSaveAnimation } from '@/hooks/useSaveAnimation'; // NOTE: module id: 488843

function isNewAnimation(animation) {
  return (
    !!animation?.published_at &&
    Date.now() - new Date(animation.published_at).getTime() < 1209600000
  );
}

function AnimationListRow({
  animation,
  index,
  isAuthenticated,
  initialIsSaved,
  hrefBase = '/animations',
  hideSave = false,
}) {
  const { id, title, slug, category } = animation;
  const isNew = isNewAnimation(animation);
  const isUpdated =
    !(!animation?.content_updated_at || isNewAnimation(animation)) &&
    Date.now() - new Date(animation.content_updated_at).getTime() < 604800000;

  const { isSaved, isLoading, toggleSave } = useSaveAnimation(
    isAuthenticated ? id : null,
    initialIsSaved,
    isAuthenticated ? animation : null
  );

  const handleSaveClick = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleSave?.(event);
    },
    [toggleSave]
  );

  return (
    <li
      data-row-index={index}
      data-hfp-index={index}
      data-tile
      className="animate-stagger-in group relative"
      style={{ animationDelay: `${(index % 12) * 0.04}s` }}
    >
      <TransitionLink
        href={`${hrefBase}/${slug}`}
        className="grid items-center gap-16 px-16 py-20 transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/5"
        style={{ gridTemplateColumns: '32px minmax(0,1fr) 240px 8rem 32px' }}
      >
        <span
          aria-hidden="true"
          className="text-accent-xs text-foreground-muted"
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <h3 className="text-h5 truncate font-medium text-foreground">
          {title}
        </h3>

        <span className="flex justify-start gap-8">
          {animation.is_free_preview && (
            <span className="text-accent-xs bg-brand px-8 py-4 font-medium text-[#141314]">
              Free
            </span>
          )}
          {isNew && (
            <span className="text-accent-xs bg-brand px-8 py-4 font-medium text-[#141314]">
              New
            </span>
          )}
          {isUpdated && (
            <span className="text-accent-xs bg-foreground px-8 py-4 font-medium text-background">
              Updated
            </span>
          )}
        </span>

        <span className="text-accent-xs truncate text-foreground-muted">
          {category}
        </span>

        <div className="flex justify-end">
          {hideSave ? null : isAuthenticated ? (
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isLoading}
              aria-label={isSaved ? 'Remove from saved' : 'Save animation'}
              aria-pressed={isSaved}
              className="flex size-32 items-center justify-center text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:text-foreground"
            >
              <BookmarkIcon
                className={
                  isSaved
                    ? 'size-16 fill-brand text-brand'
                    : 'size-16 text-current'
                }
              />
            </button>
          ) : (
            <span
              aria-hidden="true"
              className="flex size-32 items-center justify-center text-foreground-muted opacity-0 transition-opacity duration-(--duration-fast) ease-(--ease-expo-out) group-hover:opacity-100"
            >
              <ArrowIcon className="size-16" />
            </span>
          )}
        </div>
      </TransitionLink>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-foreground/10"
      />
    </li>
  );
}

function AnimationListView({
  animations,
  isAuthenticated = false,
  savedAnimationIds = [],
  hrefBase = '/animations',
  hideSave = false,
}) {
  const listContainerRef = useRef(null);
  const savedIdsSet = new Set(savedAnimationIds);
  const previewItems = animations.map((animation) => ({
    type: 'image',
    src: animation.preview_image_url
      ? formatImageUrl(animation.preview_image_url, { width: 480 })
      : null,
  }));

  return (
    <div className="v2-container pb-128">
      <div ref={listContainerRef} className="relative">
        <div aria-hidden="true" className="h-px bg-foreground/10" />
        <ul role="list" className="flex flex-col">
          {animations.map((animation, index) => (
            <AnimationListRow
              key={animation.id}
              animation={animation}
              index={index}
              isAuthenticated={isAuthenticated}
              initialIsSaved={savedIdsSet.has(animation.id)}
              hrefBase={hrefBase}
              hideSave={hideSave}
            />
          ))}
        </ul>
      </div>

      <MediaHoverReveal
        containerRef={listContainerRef}
        items={previewItems}
        width={240}
      />
    </div>
  );
}

const GRID_COLS_BY_MODE = {
  grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  duo: 'grid-cols-1 sm:grid-cols-2',
  condensed: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

const GRID_GAP_BY_MODE = {
  grid: 'gap-x-24 gap-y-24',
  duo: 'gap-x-32 gap-y-32',
  condensed: 'gap-x-16 gap-y-16',
};

// NOTE: module id: 425565
export function AnimationCollection({
  animations,
  viewMode = 'grid',
  isAuthenticated = false,
  savedAnimationIds = [],
  sentinelRef,
  hasMore = false,
  animationKey = 'default',
  interstitial = null,
  tileProps = null,
  listProps = null,
}) {
  const savedIdsSet = useMemo(
    () => new Set(savedAnimationIds),
    [savedAnimationIds]
  );
  const gridRef = useRef(null);
  const prevAnimationKeyRef = useRef(null);

  useEffect(() => {
    const gridEl = gridRef.current;
    if (!gridEl) return;

    if (prevAnimationKeyRef.current === null) {
      prevAnimationKeyRef.current = animationKey;
      return;
    }

    if (prevAnimationKeyRef.current === animationKey) return;
    prevAnimationKeyRef.current = animationKey;

    const tiles = gridEl.querySelectorAll('[data-tile]');
    if (tiles.length !== 0) {
      tiles.forEach((tile) => tile.classList.remove('animate-stagger-in'));
      void gridEl.offsetWidth;
      tiles.forEach((tile) => tile.classList.add('animate-stagger-in'));
    }
  }, [animationKey]);

  if (viewMode === 'list') {
    return (
      <>
        <AnimationListView
          animations={animations}
          isAuthenticated={isAuthenticated}
          savedAnimationIds={savedAnimationIds}
          {...(listProps || {})}
        />
        {hasMore && (
          <div
            ref={sentinelRef}
            className="v2-container h-32 pb-128"
            aria-hidden="true"
          />
        )}
      </>
    );
  }

  return (
    <div className="v2-container pb-128">
      <div
        ref={gridRef}
        className={`mt-24 grid ${GRID_COLS_BY_MODE[viewMode] ?? GRID_COLS_BY_MODE.grid} ${GRID_GAP_BY_MODE[viewMode] ?? GRID_GAP_BY_MODE.grid}`}
      >
        {animations.map((animation, index) => (
          <Fragment key={animation.id}>
            <div
              data-tile
              className="animate-stagger-in"
              style={{ animationDelay: `${(index % 12) * 0.04}s` }}
            >
              <AnimationCard
                {...(typeof tileProps === 'function'
                  ? tileProps(animation)
                  : tileProps || {})}
                animation={animation}
                viewMode={viewMode}
                isAuthenticated={isAuthenticated}
                initialIsSaved={savedIdsSet.has(animation.id)}
                priority={index < 3}
              />
            </div>

            {interstitial && index === Math.min(8, animations.length) - 1 ? (
              <div className="col-span-full">{interstitial}</div>
            ) : null}
          </Fragment>
        ))}
      </div>

      {hasMore && (
        <div
          ref={sentinelRef}
          className="mt-48 h-32 w-full"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

