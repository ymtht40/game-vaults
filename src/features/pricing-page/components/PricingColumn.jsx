'use client';

import { useRef } from 'react';
import { IsoBoxes, useIsoBoxes } from '@/components/canvas/IsoBoxes'; // NOTE: module id: 576720
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import FactList from '@/features/pricing-page/components/FactList'; // NOTE: module id: 567874

// Variable Mapping: m -> containerRef, h -> boxes, f -> handleMouseEnter, g -> handleMouseLeave
// NOTE: module id: 547118
export function PricingColumn({
  fig,
  title,
  line,
  facts,
  cta,
  href,
  action = null,
}) {
  const containerRef = useRef(null);
  const { rest: boxes, onEnter: handleMouseEnter, onLeave: handleMouseLeave } = useIsoBoxes(containerRef, fig);

  return (
    <article
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="col-span-12 flex flex-col gap-32 bg-background p-24 md:col-span-6 lg:p-40"
    >
      <div
        aria-hidden="true"
        className="flex h-[140px] items-center justify-center md:h-[200px]"
      >
        <IsoBoxes boxes={boxes} />
      </div>
      <div className="flex flex-col gap-12">
        <h3 className="text-h4 font-medium">{title}</h3>
        <p className="text-body text-foreground-muted">{line}</p>
      </div>
      <FactList className="w-full max-w-[420px]" items={facts} />
      {action || href ? (
        <div className="mt-auto">
          {action || (
            <Button href={href} theme="surface">
              {cta}
            </Button>
          )}
        </div>
      ) : null}
    </article>
  );
}

// NOTE: module id: 547118
export { PricingColumn as Column };
// NOTE: module id: 547118
export default PricingColumn;
