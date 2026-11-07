// Variable Mapping: r (captured) -> kits, f (captured) -> kitRefs

import { useEffect } from 'react';
import { repeatKitComponents } from '@/features/kits/utils/repeatKitComponents'; // NOTE: module id: 8545

// NOTE: module id: 8545
export function useKitPreviewVideos(kits, kitRefs) {
  useEffect(() => {
    const stopCallbacks = [];
    const cleanups = kits.flatMap((kit) => {
      const components = repeatKitComponents(kit.components);
      return [
        ...(kitRefs.current[kit.slug]?.querySelectorAll('.circular_slider_item') || []),
      ].map((item, index) => {
        const previewUrl = components[index]?.preview_video_url;
        if (!previewUrl) return null;
        const video = document.createElement('video');
        video.preload = 'none';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.className = 'kits-inside-video';
        video.src = previewUrl;
        item.appendChild(video);
        const playVideo = () => {
          video.play().catch(() => {});
          video.dataset.playing = 'true';
        };
        const pauseVideo = () => {
          video.pause();
          delete video.dataset.playing;
        };
        stopCallbacks.push(pauseVideo);
        const handleEnter = () => !window.matchMedia('(hover: none)').matches && playVideo();
        const handleLeave = () => !window.matchMedia('(hover: none)').matches && pauseVideo();
        let pointerStart = null;
        const handlePointerDown = (event) =>
          (pointerStart = {
            x: event.clientX,
            y: event.clientY,
          });
        const handlePointerUp = (event) => {
          if (!window.matchMedia('(hover: none)').matches || !pointerStart) return;
          const moved =
            Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 8;
          if (((pointerStart = null), !moved)) {
            if (video.dataset.playing) return pauseVideo();
            stopCallbacks.forEach((stop) => stop());
            playVideo();
          }
        };
        item.addEventListener('pointerenter', handleEnter);
        item.addEventListener('pointerleave', handleLeave);
        item.addEventListener('pointerdown', handlePointerDown);
        item.addEventListener('pointerup', handlePointerUp);
        return () => {
          item.removeEventListener('pointerenter', handleEnter);
          item.removeEventListener('pointerleave', handleLeave);
          item.removeEventListener('pointerdown', handlePointerDown);
          item.removeEventListener('pointerup', handlePointerUp);
          video.remove();
        };
      });
    });
    return () => cleanups.forEach((cleanup) => cleanup?.());
  }, [kits]);
}
