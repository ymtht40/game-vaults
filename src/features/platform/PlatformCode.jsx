import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { V3SectionHeader } from '@/features/home-v3/V3SectionHeader'; // NOTE: module id: 118970
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391
import { SecondaryButton } from '@/components/ui/SecondaryButton'; // NOTE: module id: 520237

import CodeTabs from '@/features/platform/CodeTabs.jsx'; // NOTE: module id: 113133

// Variable Mapping: c -> codeTabs, i -> textAnimation, e -> action
const codeTabs = [
  {
    label: 'HTML',
    language: 'html',
    filename: 'index.html',
    code: `<h2
  data-anm-scroll-text-reveal
  data-anm-duration="1.2"
  data-anm-stagger="0.06"
>
  Tuned with attributes.
</h2>`,
  },
  {
    label: 'React',
    language: 'jsx',
    filename: 'Page.jsx',
    code: `<TextReveal duration={1.2} stagger={0.06}>
  Tuned with props.
</TextReveal>`,
  },
  {
    label: 'Vue',
    language: 'javascript',
    filename: 'Page.vue',
    code: `<TextReveal :duration="1.2" :stagger="0.06">
  Tuned with props.
</TextReveal>`,
  },
];

const textAnimation = {
  type: 'lines',
  mask: 'lines',
  duration: 0.6,
  stagger: 0.03,
  ease: 'power2.out',
  animationProps: {
    yPercent: 100,
  },
  triggerMode: 'scroll',
};

// NOTE: module id: 922203
export default function PlatformCode({ action = null }) {
  return (
    <section data-theme="dark" className="bg-background py-64 text-foreground lg:py-160">
      <div className="v2-container flex flex-col gap-48 lg:gap-64">
        <V3SectionHeader action={action}>{t('platform-v3.code.headline')}</V3SectionHeader>
        <div className="grid grid-cols-12 gap-y-48 lg:gap-x-24">
          <div className="col-span-12 flex flex-col gap-24 lg:col-span-5">
            <AnimatedText
              tag="p"
              className="text-body-lg max-w-[44ch] text-foreground-muted"
              {...textAnimation}
              delay={0.2}
            >
              {t('platform-v3.code.body')}
            </AnimatedText>
            <FadeIn
              trigger="scroll"
              delay={0.3}
              className="flex flex-col items-start gap-8 border-t border-border pt-24"
            >
              <p className="text-body-sm max-w-[44ch] text-foreground-muted">
                {t('platform-v3.code.mcp')}
              </p>
              <SecondaryButton
                href="/docs/guides/mcp"
                variant="text"
                className="text-body-sm text-foreground"
              >
                {t('platform-v3.code.mcpLink')}
              </SecondaryButton>
            </FadeIn>
          </div>
          <FadeIn
            trigger="scroll"
            delay={0.2}
            className="col-span-12 lg:col-span-6 lg:col-start-7"
          >
            <CodeTabs tabs={codeTabs} maxHeight="none" />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
