'use client';

import { useRef } from 'react';
import { DraggableGrid as ImageShowcase } from '@/components/motion/DraggableGrid';
import { usePageEnterAnimation } from '@/providers/AnimationProvider';

const showcaseLayout = {
  rowCount: 9,
};

export function AuthShowcase({
  images = [],
  className = '',
  driftVx,
  driftVy,
}) {
  const showcaseRef = useRef(null);

  usePageEnterAnimation(
    () => showcaseRef.current?.reveal(),
    [],
    'AuthShowcase',
  );

  return (
    <div
      className={`relative hidden overflow-hidden bg-background lg:sticky lg:top-0 lg:block lg:h-dvh lg:self-start ${className}`.trim()}
    >
      {images.length > 0 ? (
        <ImageShowcase
          ref={showcaseRef}
          images={images}
          entrance="center-out"
          layout={showcaseLayout}
          className="h-full"
          driftVx={driftVx}
          driftVy={driftVy}
        />
      ) : null}
    </div>
  );
}

