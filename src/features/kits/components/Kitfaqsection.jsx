// Variable Mapping: e -> kit, n -> faqs, i -> resolvedFaqs

import Accordion from '@/components/shared/accordion/Accordion'; // NOTE: module id: 752362

// NOTE: module id: 498872
export function KitFaqSection({ kit, faqs }) {
  const resolvedFaqs = faqs || kit?.metadata?.faq || [];

  return resolvedFaqs.length ? (
    <Accordion
      faqs={resolvedFaqs}
      eyebrow="Questions"
      headline="Before you buy."
      subtext="Everything worth knowing before you own the Kit."
      ctaLink={null}
      inset={true}
    />
  ) : null;
}

export default KitFaqSection;