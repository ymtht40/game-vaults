'use client';

import { useRef } from 'react';
import { ImageShowcase } from '@/features/sigin/ImageShowcase'; // module id: 73062
import { usePageEnterAnimation } from '@/contexts/AnimationProvider'; // module id: 488463

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
      className={`relative hidden overflow-hidden bg-background lg:block ${className}`.trim()}
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

