// Variable Mapping: R -> RevealCaptureSection?

import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160 // UNRESOLVED: name guessed from usage
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091 // UNRESOLVED: name guessed from usage
import NewsletterForm from '@/features/newsletter/NewsletterForm'; // NOTE: module id: 42242 // UNRESOLVED: name guessed from usage
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682

// NOTE: module id: 301900
export function RevealCaptureSection() {
  return (
    <section
      data-theme="light"
      data-starter-pack-band={true}
      className="bg-background text-foreground"
    >
      <div className="v2-container py-96 lg:py-160">
        <div className="grid grid-cols-12 gap-x-24 gap-y-32 lg:items-center">
          <div className="col-span-12 lg:col-span-5 lg:col-start-2">
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="font-medium"
            >
              {t('kits.capture.headline')}
            </RevealHeading>
            <AnimatedText
              triggerMode="scroll"
              className="text-body mt-16 leading-relaxed text-foreground-muted"
            >
              {t('kits.capture.body')}
            </AnimatedText>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-8">
            <NewsletterForm
              source="kit-reveal-page"
              idPrefix="kit-reveal"
              buttonLabel={t('kits.capture.buttonLabel')}
              inputSize="lg"
              emailPlaceholder={t('kits.capture.emailPlaceholder')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
