'use client';

// Variable Mapping: s -> FigureCanvas, a -> PlaygroundFigure, i -> formatValue, o -> PlaygroundControls, e -> fig / pg / value / lines / figure, r -> containerRef / setValues / options, a -> rest / openParam, i -> onEnter / currentFigure, o -> onLeave, d -> play / setOpenParam, c -> prevFigRef / controlsRef, l -> values / staticFigure, n -> lineIndex / tokenIndex / optionValue / playgroundConfig

import { useState, useEffect, useRef, useMemo } from 'react';

import { useFigureHover as useFigureAnimation } from '@/hooks/useFigureHover'; // NOTE: module id: 576720
import FigureBoxes from '@/features/docs/components/FigureBoxes';
import {
  getInteractiveFigureSpec as getPlaygroundConfig,
  getFigureDefinition as getStaticFigure,
} from '@/libs/utils/figures'; // NOTE: module id: 158024

function FigureCanvas({ fig }) {
  const containerRef = useRef(null);
  const {
    rest,
    onEnter,
    onLeave,
    play,
  } = useFigureAnimation(containerRef, fig);
  const prevFigRef = useRef(fig);

  useEffect(() => {
    if (prevFigRef.current !== fig) {
      prevFigRef.current = fig;
      play();
    }
  }, [fig]);

  return (
    <div
      ref={containerRef}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      aria-hidden="true"
      className="flex h-[200px] cursor-pointer items-center justify-center px-24 py-20 lg:h-[220px]"
    >
      <div className="h-full w-full max-w-[420px]">
        <FigureBoxes boxes={rest} />
      </div>
    </div>
  );
}

function PlaygroundFigure({ pg }) {
  const [values, setValues] = useState(pg.defaults);
  const currentFigure = useMemo(() => pg.figure(values), [pg, values]);

  return (
    <div className="border border-foreground/10">
      <FigureCanvas fig={currentFigure} />
      <PlaygroundControls
        lines={pg.code}
        values={values}
        options={pg.options}
        onChange={(param, nextValue) =>
          setValues((prev) => ({
            ...prev,
            [param]: nextValue,
          }))
        }
      />
    </div>
  );
}

const formatValue = (value) =>
  typeof value === 'string' ? `"${value}"` : String(value);

function PlaygroundControls({ lines, values, options, onChange }) {
  const [openParam, setOpenParam] = useState(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!openParam) return;

    const handlePointerDown = (event) => {
      if (!controlsRef.current?.contains(event.target)) {
        setOpenParam(null);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenParam(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openParam]);

  return (
    <div
      ref={controlsRef}
      className="border-t border-foreground/10 bg-foreground/[0.03] px-16 py-14"
    >
      <p className="text-accent-xs mb-8 text-foreground-muted">
        Pick an underlined value to change it
      </p>
      <pre className="m-0 overflow-visible font-mono text-[12.5px] leading-[1.75] text-foreground-reading">
        {lines.map((line, lineIndex) => (
          <div key={lineIndex} className="whitespace-pre">
            {line.map((token, tokenIndex) =>
              typeof token === 'string' ? (
                <span key={tokenIndex}>{token}</span>
              ) : (
                <span key={tokenIndex} className="relative inline-block">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={openParam === token.p}
                    onClick={() =>
                      setOpenParam(openParam === token.p ? null : token.p)
                    }
                    className="cursor-pointer text-brand underline decoration-brand/50 decoration-dotted underline-offset-4 transition-colors duration-200 hover:decoration-brand"
                  >
                    {formatValue(values[token.p])}
                  </button>
                  {openParam === token.p ? (
                    <span
                      role="listbox"
                      aria-label={token.p}
                      className="absolute top-full left-0 z-30 mt-6 flex min-w-[140px] flex-col border border-foreground/15 bg-background py-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                    >
                      {options[token.p].map((optionValue) => (
                        <button
                          key={String(optionValue)}
                          type="button"
                          role="option"
                          aria-selected={optionValue === values[token.p]}
                          onClick={() => {
                            onChange(token.p, optionValue);
                            setOpenParam(null);
                          }}
                          className="px-12 py-4 text-left text-foreground-muted transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground aria-selected:text-brand"
                        >
                          {formatValue(optionValue)}
                        </button>
                      ))}
                    </span>
                  ) : null}
                </span>
              )
            )}
          </div>
        ))}
      </pre>
    </div>
  );
}

// NOTE: module id: 965261
export default function FigurePlayground({ figure }) {
  const playgroundConfig = getPlaygroundConfig(figure);
  const staticFigure = getStaticFigure(figure);

  return playgroundConfig ? (
    <PlaygroundFigure pg={playgroundConfig} />
  ) : staticFigure ? (
    <div className="border border-foreground/10">
      <FigureCanvas fig={staticFigure} />
    </div>
  ) : null;
}