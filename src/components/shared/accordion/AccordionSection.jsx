'use client';

import { useState, useCallback } from 'react';
import { t } from '@/libs/utils/i18n';
import RevealHeading from '@/components/motion/RevealHeading';
import AnimatedText from '@/components/motion/AnimatedText';
import FadeIn from '@/components/motion/FadeIn';
import Button from '@/components/ui/Button';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { AccordionItem } from '@/components/shared/accordion/AccordionItem';

const STICKY_COLUMN_CLASS =
  'col-span-12 lg:col-span-4 lg:col-start-1 lg:sticky lg:top-[var(--v2-sticky-top)] lg:self-start';

function buildFaqSchema(faqs) {
  return {
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
}

function AccordionCta({ ctaLink, className }) {
  return (
    <div className={className}>
      <Button
        href={ctaLink.href}
        theme="brand"
        size="sm"
      >
        {ctaLink.label}
      </Button>
    </div>
  );
}

function AccordionHeader({ eyebrow, headline, subtext, ctaLink }) {
  return (
    <div data-sticky className={STICKY_COLUMN_CLASS}>
      {eyebrow && (
        <AnimatedText
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
        </AnimatedText>
      )}
      <RevealHeading
        as="h2"
        trigger="scroll"
        className="max-w-[14ch]"
      >
        {headline}
      </RevealHeading>
      <div className="mt-24">
        <AnimatedText
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
        </AnimatedText>
      </div>
      {ctaLink && <AccordionCta ctaLink={ctaLink} className="mt-32 hidden lg:flex" />}
    </div>
  );
}

function AccordionList({ faqs, openIndex, onToggle, isDesktop }) {
  return (
    <FadeIn
      trigger="scroll"
      stagger={0.06}
      y={20}
      className="w-full"
    >
      {faqs.map((item, index) => (
        <AccordionItem
          key={item.q}
          q={item.q}
          a={item.a}
          isOpen={openIndex === index}
          onToggle={() => onToggle(index)}
          isDesktop={isDesktop}
        />
      ))}
    </FadeIn>
  );
}

function AccordionContent({
  list,
  faqs,
  openIndex,
  onToggle,
  isDesktop,
  ctaLink,
}) {
  return (
    <div className="col-span-12 lg:col-span-7 lg:col-start-7">
      {list ?? (
        <AccordionList
          faqs={faqs}
          openIndex={openIndex}
          onToggle={onToggle}
          isDesktop={isDesktop}
        />
      )}
      {ctaLink && <AccordionCta ctaLink={ctaLink} className="mt-32 flex lg:hidden" />}
    </div>
  );
}

function AccordionContainer({ inset, children }) {
  const outerGridClass = inset ? 'grid grid-cols-12 gap-x-24' : 'contents';
  const innerGridClass = inset ? 'col-span-12 lg:col-span-10 lg:col-start-2' : 'contents';

  return (
    <div className="v2-container py-64 lg:py-128">
      <div className={outerGridClass}>
        <div className={innerGridClass}>
          <div className="grid grid-cols-12 gap-x-24 gap-y-64">{children}</div>
        </div>
      </div>
    </div>
  );
}

function AccordionSection({
  faqs = t('common.faq.items'),
  eyebrow,
  headline = t('common.faq.headline'),
  subtext = t('common.faq.subtext'),
  ctaLink = { label: t('common.faq.ctaLabel'), href: '/faq' },
  sectionId,
  inset = false,
  list = null,
  theme = 'light',
}) {
  const [openIndex, setOpenIndex] = useState(null);
  const isDesktop = useBreakpoint('lg');
  const faqSchema = buildFaqSchema(faqs);

  const handleToggle = useCallback((index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  }, []);

  return (
    <section
      id={sectionId}
      data-theme={theme}
      className="faq relative bg-background text-foreground"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <AccordionContainer inset={inset}>
        <AccordionHeader
          eyebrow={eyebrow}
          headline={headline}
          subtext={subtext}
          ctaLink={ctaLink}
        />
        <AccordionContent
          list={list}
          faqs={faqs}
          openIndex={openIndex}
          onToggle={handleToggle}
          isDesktop={isDesktop}
          ctaLink={ctaLink}
        />
      </AccordionContainer>
    </section>
  );
}

export default AccordionSection;
