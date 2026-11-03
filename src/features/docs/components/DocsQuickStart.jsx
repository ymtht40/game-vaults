'use client';

import { useRef } from 'react';

import { getFigureDefinition } from '@/libs/utils/figures';

import Button from '@/components/ui/Button'; // module id: 687989
import FigureBoxes from '@/features/docs/components/FigureBoxes'; // module id: 576720
import { STORAGE_KEY } from '@/features/docs/components/FrameworkTabs'; // module id: 12236

import { useFigureHover } from '@/hooks/useFigureHover'; // module id: 576720

const frameworks = [
  { id: 'react', label: 'React', theme: 'brand' },
  { id: 'vue', label: 'Vue', theme: 'surface' },
  { id: 'html', label: 'HTML', theme: 'surface' },
];

export default function DocsQuickStart() {
  const sectionRef = useRef(null);

  const {
    rest: boxes,
    onEnter,
    onLeave,
  } = useFigureHover(
    sectionRef,
    getFigureDefinition('doc-quick-start'),
  );

  return (
    <section
      ref={sectionRef}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="grid border border-foreground/10 lg:grid-cols-2"
    >
      <div className="flex flex-col gap-16 p-24 lg:p-32">
        <h2 className="text-h4 text-foreground">
          Your first component in two minutes.
        </h2>

        <p className="text-reading text-foreground-reading">
          The quick start takes one real component from the free Starter Pack into a page: where the files go, how to import it, and how to change it. Pick your stack.
        </p>

        <div className="mt-8 flex flex-wrap gap-8">
          {frameworks.map((framework) => (
            <Button
              key={framework.id}
              href="/docs/getting-started/quick-start"
              theme={framework.theme}
              size="sm"
              onClick={() => {
                try {
                  window.localStorage.setItem(
                    STORAGE_KEY,
                    framework.id,
                  );
                } catch {}
              }}
            >
              {framework.label}
            </Button>
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="flex h-[200px] items-center justify-center border-t border-foreground/10 px-24 py-20 lg:h-auto lg:border-t-0 lg:border-l"
      >
        <div className="h-full max-h-[200px] w-full max-w-[360px]">
          <FigureBoxes boxes={boxes} />
        </div>
      </div>
    </section>
  );
}
