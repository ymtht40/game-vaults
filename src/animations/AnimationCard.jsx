'use client';

// Variable Mapping: v -> isRecentlyPublished, y -> VIEW_MODE_ASPECTS, j -> resolvedChipLabel, w -> id, k -> title, N -> slug, H -> category, V -> preview_image_url, E -> preview_video_url, _ -> videoRef, A -> isHovered, S -> setIsHovered, M -> shouldLoadVideo, Z -> setShouldLoadVideo, L -> isNew, T -> isUpdated, C -> handleMouseEnter, U -> handleMouseLeave, $ -> handleVideoLoadedData, F -> aspectClassName

import { useRef, useState, useCallback } from 'react';
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { formatImageUrll as formatImageUrl } from '@/libs/utils/formatImageUrl'; // NOTE: module id: 632021
import { getProvenanceSite } from '@/libs/utils/provenance'; // NOTE: module id: 809630
import TransitionLink from '@/components/navigation/TransitionLink'; // NOTE: module id: 101836
import { ProvenanceChip } from '@/components/ui/ProvenanceChip'; // NOTE: module id: 909247
import { FreeBadge } from '@/features/paywall/PaywallBlock'; // NOTE: module id: 993603
import { SaveAnimationButton } from '@/animations/SaveAnimationButton'; // NOTE: module id: 878512

function isRecentlyPublished(animation) {
  return (
    !!animation?.published_at &&
    Date.now() - new Date(animation.published_at).getTime() < 1209600000
  );
}

const VIEW_MODE_ASPECTS = {
  grid: 'aspect-[16/10]',
  duo: 'aspect-[16/10]',
  condensed: 'aspect-[16/10]',
  list: 'aspect-[16/10]'
};

// NOTE: module id: 591611
export default function AnimationCard({
  animation,
  viewMode = 'grid',
  isAuthenticated = false,
  initialIsSaved = false,
  priority = false,
  hrefBase = '/animations',
  href = null,
  chipLabel,
  hideSave = false,
  badge = null
}) {
  const resolvedChipLabel =
    chipLabel || getProvenanceSite(animation) || 'Studio Original';
  const {
    id,
    title,
    slug,
    category,
    preview_image_url,
    preview_video_url
  } = animation;

  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  const isNew = isRecentlyPublished(animation);
  const isUpdated =
    !(!animation?.content_updated_at || isRecentlyPublished(animation)) &&
    Date.now() - new Date(animation.content_updated_at).getTime() < 604800000;

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (preview_video_url && !shouldLoadVideo) {
      setShouldLoadVideo(true);
      return;
    }
    if (videoRef.current && preview_video_url) {
      const playPromise = videoRef.current.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    }
  }, [preview_video_url, shouldLoadVideo]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (videoRef.current && preview_video_url) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [preview_video_url]);

  const handleVideoLoadedData = useCallback(() => {
    if (isHovered && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    }
  }, [isHovered]);

  const aspectClassName = VIEW_MODE_ASPECTS[viewMode] ?? VIEW_MODE_ASPECTS.grid;

  return (
    <TransitionLink
      href={href || `${hrefBase}/${slug}`}
      data-theme="dark"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative block bg-surface p-12 text-foreground transition-transform duration-(--duration-quick) ease-(--ease-back-out) hover:scale-[0.98]"
    >
      <div
        className={cn(
          'relative overflow-hidden bg-foreground/[0.06]',
          `w-full ${aspectClassName}`
        )}
      >
        {preview_image_url && (
          <img
            src={formatImageUrl(preview_image_url, { width: 720 })}
            alt={title}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
            className="absolute inset-0 block object-cover"
            style={{ width: '100%', height: '100%' }}
          />
        )}
        {preview_video_url && shouldLoadVideo && (
          <video
            ref={videoRef}
            src={preview_video_url}
            muted={true}
            loop={true}
            playsInline={true}
            preload="metadata"
            onLoadedData={handleVideoLoadedData}
            className={cn(
              'absolute inset-0 block size-full object-cover transition-opacity duration-(--duration-snap)',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
            style={{ width: '100%', height: '100%' }}
          />
        )}
        {!hideSave && (
          <div className="absolute right-8 top-8 z-10">
            <SaveAnimationButton
              animation={animation}
              initialIsSaved={initialIsSaved}
              isAuthenticated={isAuthenticated}
              variant="overlay"
              fadeOnHover={true}
              unauthHint="arrow"
            />
          </div>
        )}
      </div>
      <div className="mt-12 flex h-24 items-center justify-between gap-8">
        <ProvenanceChip
          label={resolvedChipLabel}
          size="default"
          className="text-foreground-muted"
        />
        <div className="flex h-full items-center gap-8">
          {badge}
          {animation.is_free_preview && <FreeBadge />}
          {isNew && (
            <span className="text-accent-xs inline-flex h-full items-center bg-brand px-8 font-medium text-[#141314]">
              New
            </span>
          )}
          {isUpdated && (
            <span className="text-accent-xs inline-flex h-full items-center bg-foreground px-8 font-medium text-background">
              Updated
            </span>
          )}
        </div>
      </div>
      <div className="mt-36 flex items-baseline justify-between gap-12">
        <p className="text-body-sm truncate font-medium text-foreground">
          {title}
        </p>
        <p className="text-accent-xs shrink-0 text-foreground-muted">
          {category}
        </p>
      </div>
    </TransitionLink>
  );
}

