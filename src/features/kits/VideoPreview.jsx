'use client';

// Variable Mapping: p -> VideoPreview, e -> src, i -> playing, a -> videoRef

import { useEffect, useRef } from 'react';

// NOTE: module id: 898767
export default function VideoPreview({ src, playing }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    video && (playing ? video.play().catch(() => {}) : video.pause());
  }, [playing]);
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden border border-white/15 bg-black">
      <video
        ref={videoRef}
        src={`${src}#t=0.001`}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 object-cover"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
