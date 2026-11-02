'use client';

import TipsList from '@/features/animation-page/components/TipsList'; // module id: 799422
import PresetItem from '@/features/animation-page/components/PresetItem'; // module id: 799422
import UseCaseItem from '@/features/animation-page/components/UseCaseItem'; // module id: 799422

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export default function AnimationTips({
  animation,
  onApplyPreset = null,
}) {
  const metadata = animation?.metadata || {};

  const tips = [
    ...toArray(metadata.tips),
    ...toArray(metadata.troubleshooting).map((item) => ({
      title: item.title || item.problem,
      content: item.content || item.solution,
      code: item.code,
    })),
  ];

  const useCases = toArray(metadata.use_cases);

  const presets = toArray(metadata.variations).filter(
    (variation) => (
      variation
      && variation.attributes_override
      && Object.keys(variation.attributes_override).length > 0
    ),
  );

  if (
    tips.length === 0
    && useCases.length === 0
    && presets.length === 0
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-32">
      {tips.length > 0 && (
        <section className="border-t border-foreground/10 pt-32">
          <span className="text-accent-xs text-foreground-muted">
            Tips
          </span>

          <h2 className="text-h4 mt-12 text-foreground">
            How to get it right.
          </h2>

          <TipsList tips={tips} />

          {presets.length > 0 && (
            <div className="mt-24 border-t border-foreground/10 pt-16">
              <span className="text-accent-xs text-foreground-muted">
                Drop-in presets
              </span>

              {onApplyPreset ? (
                <p className="text-body-sm mt-6 text-foreground-muted">
                  Click one to apply it to the sliders.
                </p>
              ) : null}

              <ul className="mt-12 flex flex-col gap-4">
                {presets.map((preset, index) => (
                  <PresetItem
                    key={index}
                    item={preset}
                    onApply={onApplyPreset}
                  />
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {useCases.length > 0 && (
        <section className="border-t border-foreground/10 pt-32">
          <span className="text-accent-xs text-foreground-muted">
            Good for
          </span>

          <h2 className="text-h4 mt-12 text-foreground">
            Where it fits.
          </h2>

          <ul className="mt-16 flex flex-col gap-12">
            {useCases.map((useCase, index) => (
              <UseCaseItem
                key={index}
                item={useCase}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}