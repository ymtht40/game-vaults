'use client';

/* Variable Mapping:
   e -> faqs
   s -> eyebrow
   i -> headline
   c -> subtext
   h -> ctaLink
   m -> sectionId
   g -> inset
   p -> list
   x -> theme
   w -> openIndex
   y -> setOpenIndex
   b -> isDesktop
   v -> handleToggle
   j -> faqJsonLd
*/

import { useState, useCallback } from 'react';
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import RevealHeading from '@/animations/RevealHeading'; // NOTE: module id: 963160 // UNRESOLVED: name guessed from usage
import SplitTextReveal from '@/animations/AnimatedText';// NOTE: module id: 218091 // UNRESOLVED: name guessed from usage
import FadeIn from '@/animations/FadeIn'; // NOTE: module id: 460391 // UNRESOLVED: name guessed from usage
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { useBreakpoint } from '@/hooks/useBreakpoint'; // NOTE: module id: 400701
import { FaqItem } from '@/components/faq/FaqItem'; // NOTE: module id: 752362

// NOTE: module id: 752362
export function FaqSection({
  faqs = t('common.faq.items'),
  eyebrow,
  headline = t('common.faq.headline'),
  subtext = t('common.faq.subtext'),
  ctaLink = {
    label: t('common.faq.ctaLabel'),
    href: '/faq',
  },
  sectionId,
  inset = false,
  list = null,
  theme = 'light',
}) {
  const [openIndex, setOpenIndex] = useState(null);
  const isDesktop = useBreakpoint('lg');

  const handleToggle = useCallback((index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  }, []);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  };

  return (
    <section
      id={sectionId}
      data-theme={theme}
      className="faq relative bg-background text-foreground"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="v2-container py-64 lg:py-128">
        <div className={inset ? 'grid grid-cols-12 gap-x-24' : 'contents'}>
          <div className={inset ? 'col-span-12 lg:col-span-10 lg:col-start-2' : 'contents'}>
            <div className="grid grid-cols-12 gap-x-24 gap-y-64">
              <div
                data-sticky={true}
                className="col-span-12 lg:col-span-4 lg:col-start-1 lg:sticky lg:top-[var(--v2-sticky-top)] lg:self-start"
              >
                {eyebrow ? (
                  <SplitTextReveal
                    tag="p"
                    className="text-mono-sm mb-24 text-foreground-muted"
                    type="lines"
                    mask="lines"
                    duration={0.6}
                    stagger={0.03}
                    ease="power2.out"
                    animationProps={{ yPercent: 100 }}
                    triggerMode="scroll"
                  >
                    {eyebrow}
                  </SplitTextReveal>
                ) : null}
                <RevealHeading as="h2" trigger="scroll" className="max-w-[14ch]">
                  {headline}
                </RevealHeading>
                <div className="mt-24">
                  <SplitTextReveal
                    tag="p"
                    className="text-body max-w-[34ch] text-foreground-muted"
                    type="lines"
                    mask="lines"
                    duration={0.6}
                    stagger={0.03}
                    ease="power2.out"
                    animationProps={{ yPercent: 100 }}
                    triggerMode="scroll"
                  >
                    {subtext}
                  </SplitTextReveal>
                </div>
                {ctaLink ? (
                  <div className="mt-32 hidden lg:flex">
                    <Button href={ctaLink.href} theme="brand" size="sm">
                      {ctaLink.label}
                    </Button>
                  </div>
                ) : null}
              </div>
              <div className="col-span-12 lg:col-span-7 lg:col-start-7">
                {list ?? (
                  <FadeIn trigger="scroll" stagger={0.06} y={20} className="w-full">
                    {faqs.map((faq, index) => (
                      <FaqItem
                        key={faq.q}
                        q={faq.q}
                        a={faq.a}
                        isOpen={openIndex === index}
                        onToggle={() => handleToggle(index)}
                        isDesktop={isDesktop}
                      />
                    ))}
                  </FadeIn>
                )}
                {ctaLink ? (
                  <div className="mt-32 flex lg:hidden">
                    <Button href={ctaLink.href} theme="brand" size="sm">
                      {ctaLink.label}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
