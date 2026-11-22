import { preload } from 'react-dom';

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
// UNRESOLVED: cn is a usage-based name for the class-name helper.

// Variable Mapping: r -> groundClasses, e -> tone, n -> priority, s -> className
const groundClasses = {
  dusk: 'bg-[#b98e86] bg-[url(/imgs/v3/ground-dusk.avif)]',
  violet: 'bg-[#7584af] bg-[url(/imgs/v3/ground-violet.avif)]',
  blue: 'bg-[#6f9abb] bg-[url(/imgs/v3/ground-blue.avif)]',
};

// NOTE: module id: 578275
export default function V3Ground({ tone = 'dusk', priority = false, className = '' }) {
  if (priority) {
    preload(`/imgs/v3/ground-${groundClasses[tone] ? tone : 'dusk'}.avif`, {
      as: 'image',
      fetchPriority: 'high',
    });
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden bg-cover bg-center',
        groundClasses[tone] || groundClasses.dusk,
        className,
      )}
    >
      <div className="v3-noise absolute inset-0" />
    </div>
  );
}
