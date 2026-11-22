'use client';

import { useCallback, useMemo, useState } from 'react';

import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { getPrimarySelectorAttribute, slugToPascalCase } from '@/libs/config/configurables'; // NOTE: module id: 726368
// UNRESOLVED: getValidConfigurables and getAnimationApi are usage-based names.
import AnimationPreview from '@/features/animation-detail/preview/AnimationPreview'; // NOTE: module id: 113861
// UNRESOLVED: AnimationPreview is a usage-based name for export f.
import { CustomizePanel } from '@/features/animation-detail/components/CustomizePanel'; // NOTE: module id: 135178
// UNRESOLVED: CustomizePanel is a usage-based name for export f.
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { SecondaryButton } from '@/components/ui/SecondaryButton'; // NOTE: module id: 520237
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091

// import '@/lib/module-988051'; // NOTE: module id: 988051
// UNRESOLVED: The chunk gives only the side-effect import ID.
import ReactIcon from '@/assets/icons/ReactIcon'; // NOTE: module id: 989080
import VueIcon from '@/assets/icons/VueIcon'; // NOTE: module id: 667024
import HtmlIcon from '@/assets/icons/HtmlIcon'; // NOTE: module id: 514162
// UNRESOLVED: Format labels identify the icons; the export signatures are absent.

/* Variable Mapping:
 * g/f -> lineAnimation/formatOptions, e/u/h/m -> animation/controls/formats/count,
 * p/x -> values/setValues, v/b -> committed/setCommitted, y/j -> attribute/api,
 * w/N/E -> handleChange/handleCommit/handleReset, A -> availableFormats
 */
const lineAnimation = {
  type: 'lines',
  mask: 'lines',
  duration: 0.6,
  stagger: 0.03,
  ease: 'power2.out',
  animationProps: {
    yPercent: 100,
  },
};

const formatOptions = [
  { key: 'html', label: 'HTML', Icon: HtmlIcon },
  { key: 'react', label: 'React', Icon: ReactIcon },
  { key: 'vue', label: 'Vue', Icon: VueIcon },
];

// NOTE: module id: 790010
export default function V3Spotlight({ animation, controls, formats = [], count = 0 }) {
  const [values, setValues] = useState({});
  const [committed, setCommitted] = useState({});
  const attribute = useMemo(() => getPrimarySelectorAttribute(animation), [animation]);
  const api = useMemo(() => slugToPascalCase(animation.slug), [animation.slug]);
  const handleChange = useCallback((key, value) => {
    return setValues((previousValues) => ({
      ...previousValues,
      [key]: value,
    }));
  }, []);
  const handleCommit = useCallback((key, value) => {
    return setCommitted((previousValues) => ({
      ...previousValues,
      [key]: value,
    }));
  }, []);
  const handleReset = useCallback(() => {
    setValues({});
    setCommitted({});
  }, []);
  const availableFormats = formatOptions.filter(({ key }) => formats.includes(key));

  return (
    <section data-theme="dark" className="bg-background pt-64 pb-64 text-foreground lg:pt-192 lg:pb-96">
      <div className="v2-container">
        <div className="grid grid-cols-12 gap-x-24 gap-y-32 lg:gap-y-24">
          <div className="relative col-span-12 aspect-square bg-background sm:aspect-[16/10] lg:col-span-8 lg:row-span-3 lg:aspect-auto">
            <div className="absolute inset-0">
              <AnimationPreview
                animation={animation}
                bare
                fill
                customize={{
                  values,
                  committed,
                  selector: `[${attribute}]`,
                  api,
                }}
              />
            </div>
          </div>
          <div className="col-span-12 flex flex-col gap-12 bg-background lg:col-span-4 lg:p-32">
            <RevealHeading as="h2" sizeClass="text-h3" className="font-medium" trigger="scroll">
              {t('home-v3.spotlight.headline')}
            </RevealHeading>
            <AnimatedText
              tag="p"
              className="text-body text-foreground-muted"
              {...lineAnimation}
              triggerMode="scroll"
              delay={0.25}
            >
              {t('home-v3.spotlight.line', { title: animation.title })}
            </AnimatedText>
            <SecondaryButton href={`/animations/${animation.slug}`} inline className="text-body-sm self-start">
              {t('home-v3.spotlight.open')}
            </SecondaryButton>
          </div>
          <div className="col-span-12 bg-background lg:col-span-4 lg:p-32">
            <CustomizePanel
              animation={animation}
              only={controls}
              values={values}
              onChange={handleChange}
              onCommit={handleCommit}
              onReset={handleReset}
            />
          </div>
          <div className="col-span-12 flex flex-wrap items-center justify-between gap-16 bg-background lg:col-span-4 lg:flex-nowrap lg:p-32">
            <div className="flex items-center gap-12">
              <p className="text-body-sm whitespace-nowrap text-foreground-muted">
                {t('home-v3.spotlight.formats')}
              </p>
              <span
                role="img"
                aria-label={availableFormats.map((format) => format.label).join(', ')}
                className="flex items-center gap-12 text-foreground"
              >
                {availableFormats.map(({ key, Icon }) => (
                  <span key={key} aria-hidden="true" className="flex size-20 items-center justify-center">
                    <Icon />
                  </span>
                ))}
              </span>
            </div>
            <Button href="/animations" theme="brand" size="sm">
              {t('home-v3.spotlight.browse', { count })}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
