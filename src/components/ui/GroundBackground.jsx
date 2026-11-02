// Variable Mapping: r -> TONE_CLASSES, e -> tone, n -> priority, s -> className

import { preload } from 'react-dom'; // NOTE: module id: 174080
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

const TONE_CLASSES = {
  dusk: 'bg-[#b98e86] bg-[url(/imgs/v3/ground-dusk.avif)]',
  violet: 'bg-[#7584af] bg-[url(/imgs/v3/ground-violet.avif)]',
  blue: 'bg-[#6f9abb] bg-[url(/imgs/v3/ground-blue.avif)]'
};

// NOTE: module id: 578275
export default function GroundBackground({
  tone = 'dusk',
  priority = false,
  className = ''
}) {
  if (priority) {
    preload(`/imgs/v3/ground-${TONE_CLASSES[tone] ? tone : 'dusk'}.avif`, {
      as: 'image',
      fetchPriority: 'high'
    });
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden bg-cover bg-center',
        TONE_CLASSES[tone] || TONE_CLASSES.dusk,
        className
      )}
    >
      <div className="v3-noise absolute inset-0" />
    </div>
  );
}

