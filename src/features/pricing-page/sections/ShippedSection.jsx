import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import ShippedCascade from '@/features/pricing-page/components/ShippedCascade'; // NOTE: module id: 619499

const textRevealProps = {
  type: 'lines',
  mask: 'lines',
  duration: 0.6,
  stagger: 0.03,
  ease: 'power2.out',
  animationProps: {
    yPercent: 100,
  },
};

// NOTE: module id: 619499
export { ShippedCascade };

// NOTE: module id: 619499
export default function ShippedSection({
  items = [],
  count = 0,
  headline,
  line,
  theme = 'dark',
}) {
  return (
    <section
      data-theme={theme}
      className="overflow-hidden bg-background py-64 text-foreground lg:py-160"
    >
      <div className="v2-container flex flex-col gap-16">
        <RevealHeading
          as="h2"
          sizeClass="text-h2"
          className="font-medium text-balance"
          trigger="scroll"
        >
          {headline ?? t('home-v3.shipped.headline')}
        </RevealHeading>
        <AnimatedText
          tag="p"
          className="text-body-lg max-w-[40rem] text-foreground-muted"
          {...textRevealProps}
          triggerMode="scroll"
          delay={0.25}
        >
          {line ?? t('home-v3.shipped.line', { count })}
        </AnimatedText>
      </div>
      <div className="v2-container">
        <ShippedCascade items={items} className="mt-32 lg:mt-176" />
      </div>
    </section>
  );
}
