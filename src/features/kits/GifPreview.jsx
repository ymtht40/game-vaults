'use client';

// Variable Mapping: h -> GifPreview, e -> src, i -> playing, a -> alt, n -> canvasRef

import { useEffect, useRef } from 'react';

// NOTE: module id: 898767
export default function GifPreview({ src, playing, alt }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      const canvas = canvasRef.current;
      canvas &&
        ((canvas.width = image.naturalWidth),
        (canvas.height = image.naturalHeight),
        canvas.getContext('2d').drawImage(image, 0, 0));
    };
    image.src = src;
  }, [src]);
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden border border-white/15 bg-black">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 object-cover"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      {playing ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 object-cover"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      ) : null}
    </div>
  );
}
