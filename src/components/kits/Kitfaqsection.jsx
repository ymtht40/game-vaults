// Variable Mapping: e -> kit, n -> faqs, i -> resolvedFaqs

import { FaqSection } from '@/components/faq/FaqSection'; // NOTE: module id: 752362

// NOTE: module id: 498872
export function KitFaqSection({ kit, faqs }) {
  const resolvedFaqs = faqs || kit?.metadata?.faq || [];

  return resolvedFaqs.length ? (
    <FaqSection
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