import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { V3SectionHeader } from '@/features/home-v3/V3SectionHeader'; // NOTE: module id: 118970
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391

// Variable Mapping: c -> textAnimation, e -> action, o -> edges, map e -> edge
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

// NOTE: module id: 437825
export default function PlatformDocs({ action = null }) {
  const edges = t('platform.docs.edges');

  return (
    <section data-theme="light" className="bg-background py-64 text-foreground lg:py-160">
      <div className="v2-container flex flex-col gap-48 lg:gap-64">
        <div className="flex flex-col gap-16">
          <V3SectionHeader action={action} actionClass="hidden lg:block">
            {t('platform-v3.docs.headline')}
          </V3SectionHeader>
          <AnimatedText
            tag="p"
            className="text-body-lg max-w-[52ch] text-foreground-muted"
            {...textAnimation}
            delay={0.25}
          >
            {t('platform-v3.docs.body')}
          </AnimatedText>
        </div>
        <FadeIn as="ul" trigger="scroll" stagger={0.05} className="flex flex-col border-t border-border">
          {edges.map((edge) => (
            <li
              key={edge.area}
              className="grid grid-cols-12 gap-y-8 border-b border-border py-24 lg:gap-x-24"
            >
              <p className="text-body col-span-12 font-medium lg:col-span-3">{edge.area}</p>
              <p className="text-body-sm col-span-12 text-foreground-muted max-lg:hidden lg:col-span-4">
                {edge.description}
              </p>
              <p className="text-body-sm col-span-12 text-foreground lg:col-span-5">{edge.quote}</p>
            </li>
          ))}
        </FadeIn>
        {action ? (
          <FadeIn trigger="scroll" className="lg:hidden">
            {action}
          </FadeIn>
        ) : null}
      </div>
    </section>
  );
}
