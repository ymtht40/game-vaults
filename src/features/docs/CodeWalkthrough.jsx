'use client';

// Variable Mapping: i -> FRAMEWORK_TABS, o -> StepFileCode, e -> file / steps / storedFramework / handleSync / observer / entries / nextFramework / el, r -> activeStep, d -> setActiveStep, c -> activeFramework, u -> setActiveFramework, x -> stepRefs, f -> frameworkTabs, n -> step, l -> index

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import Tabs from '@/features/docs/components/Tabs'; // NOTE: module id: 512922
import CodeBlock from '@/features/common/CodeBlock'; // NOTE: module id: 317840
import { STORAGE_KEY, SYNC_EVENT } from '@/features/docs/components/FrameworkTabs'; // NOTE: module id: 12236

const FRAMEWORK_TABS = [
  {
    id: 'react',
    label: 'React',
  },
  {
    id: 'vue',
    label: 'Vue',
  },
  {
    id: 'html',
    label: 'HTML',
  },
];

function StepFileCode({ file }) {
  return (
    <>
      <CodeBlock
        language={file.lang}
        filename={file.file}
        maxHeight="auto"
      >
        {file.code}
      </CodeBlock>
      {file.note ? (
        <p className="text-body-sm leading-relaxed text-foreground-muted">
          {file.note}
        </p>
      ) : null}
    </>
  );
}

// NOTE: module id: 979349
export default function CodeWalkthrough({ steps = [] }) {
  const [activeStep, setActiveStep] = useState(0);
  const [activeFramework, setActiveFramework] = useState('react');
  const stepRefs = useRef([]);

  useEffect(() => {
    try {
      const storedFramework = window.localStorage.getItem(STORAGE_KEY);
      if (FRAMEWORK_TABS.some((tab) => tab.id === storedFramework)) {
        setActiveFramework(storedFramework);
      }
    } catch {}

    const handleSync = (event) => {
      if (FRAMEWORK_TABS.some((tab) => tab.id === event.detail)) {
        setActiveFramework(event.detail);
      }
    };

    window.addEventListener(SYNC_EVENT, handleSync);
    return () => window.removeEventListener(SYNC_EVENT, handleSync);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const topEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0];

        if (topEntry) {
          setActiveStep(Number(topEntry.target.dataset.step));
        }
      },
      {
        rootMargin: '-30% 0px -60% 0px',
      }
    );

    stepRefs.current.forEach((el) => {
      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [steps.length]);

  const frameworkTabs = (
    <Tabs
      tabs={FRAMEWORK_TABS}
      activeId={activeFramework}
      onChange={(nextFramework) => {
        setActiveFramework(nextFramework);
        try {
          window.localStorage.setItem(STORAGE_KEY, nextFramework);
        } catch {}
        window.dispatchEvent(
          new CustomEvent(SYNC_EVENT, {
            detail: nextFramework,
          })
        );
      }}
      ariaLabel="Framework"
    />
  );

  return (
    <div
      data-wide={true}
      className="grid gap-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-48"
    >
      <div className="flex flex-col gap-24">
        <div className="lg:hidden">{frameworkTabs}</div>
        <ol className="flex flex-col">
          {steps.map((step, index) => (
            <li
              key={index}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              data-step={index}
              className="flex gap-20"
            >
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'text-accent-xs flex size-28 shrink-0 items-center justify-center border transition-colors duration-200',
                    activeStep === index
                      ? 'border-brand text-brand'
                      : 'border-foreground/20 text-foreground-muted'
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="w-px flex-1 bg-foreground/10"
                  />
                ) : null}
              </div>
              <div
                className={cn(
                  'flex min-w-0 flex-1 flex-col gap-16 pt-4',
                  index < steps.length - 1 && 'pb-48'
                )}
              >
                <h3 className="text-h5 text-foreground">{step.title}</h3>
                {step.body}
                {step.files?.[activeFramework] ? (
                  <div className="flex flex-col gap-10 lg:hidden">
                    <StepFileCode file={step.files[activeFramework]} />
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="hidden lg:block">
        <div className="sticky top-[var(--v2-sticky-top)] flex flex-col gap-12">
          <div className="flex items-center justify-between gap-16">
            {frameworkTabs}
            <span className="text-accent-xs text-foreground-muted">
              Step {activeStep + 1} of {steps.length}
            </span>
          </div>
          {steps[activeStep]?.files?.[activeFramework] ? (
            <StepFileCode
              key={`${activeStep}-${activeFramework}`}
              file={steps[activeStep].files[activeFramework]}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}