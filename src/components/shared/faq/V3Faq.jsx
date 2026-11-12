'use client';

// Variable Mapping: e -> ns, o -> links, u -> vars, d -> items, h -> interpolateVars, f -> faqItems, m -> listContainerRef

import { useRef, useEffect } from 'react';
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348 // UNRESOLVED: name guessed from usage
import TransitionLink from '@/components/navigation/TransitionLink'; // NOTE: module id: 101836 // UNRESOLVED: name guessed from usage
import MorphingAccordion from '@/components/ui/MorphingAccordion'; // NOTE: module id: 4707 // UNRESOLVED: name guessed from usage
import { FaqSection } from '@/components/shared/faq/FaqSection'; // NOTE: module id: 752362
import { DEFAULT_FAQ_LINKS } from '@/features/pricing-page/utils/v3-faq.config'; // NOTE: module id: 475345

function renderAnswerWithLinks(answerText, linkMap = {}) {
  const matchedKeys = Object.keys(linkMap).filter((key) =>
    answerText.includes(key)
  );
  if (!matchedKeys.length) return answerText;

  const escapedKeys = matchedKeys.map((key) =>
    key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );

  return answerText
    .split(RegExp(`(${escapedKeys.join('|')})`))
    .map((part, partIndex) =>
      linkMap[part] ? (
        <TransitionLink
          key={partIndex}
          href={linkMap[part]}
          className="underline decoration-foreground/40 underline-offset-2 transition-[text-decoration-color] duration-200 hover:decoration-foreground"
        >
          {part}
        </TransitionLink>
      ) : (
        part
      )
    );
}

// NOTE: module id: 475345
export default function V3Faq({
  ns = 'home-v3.faq',
  links = DEFAULT_FAQ_LINKS,
  vars = {},
  items = null,
}) {
  const interpolateVars = (text) =>
    text.replace(/\{(\w+)\}/g, (match, key) =>
      key === 'cap' ? 25 : vars[key] ?? match
    );

  const faqItems = (items ?? t(`${ns}.items`)).map(({ q, a }) => ({
    q: interpolateVars(q),
    a: interpolateVars(a),
  }));

  const listContainerRef = useRef(null);

  useEffect(() => {
    const containerEl = listContainerRef.current;
    if (!containerEl) return;

    const updateMinHeight = () => {
      if (!window.matchMedia('(min-width: 1024px)').matches) {
        containerEl.style.minHeight = '';
        return;
      }
      const listEl = containerEl.querySelector('.macc_list');
      const panels = [...containerEl.querySelectorAll('.macc_panel')];
      if (!listEl || !panels.length) return;

      const baseHeight =
        listEl.offsetHeight -
        panels.reduce((sum, panel) => sum + panel.offsetHeight, 0);
      const maxPanelHeight = Math.max(
        ...panels.map((panel) => panel.scrollHeight)
      );
      containerEl.style.minHeight = `${baseHeight + maxPanelHeight + 32}px`;
    };

    document.fonts?.ready.then(updateMinHeight);
    updateMinHeight();

    const observer = new ResizeObserver(updateMinHeight);
    observer.observe(containerEl);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="v3-faq">
      <FaqSection
        faqs={faqItems}
        theme="dark"
        headline={t(`${ns}.headline`)}
        subtext={t(`${ns}.subtext`)}
        list={
          <div
            ref={listContainerRef}
            onClickCapture={(event) => {
              const triggerEl = event.target.closest('.macc_trigger');
              if (triggerEl?.getAttribute('aria-expanded') === 'false') {
                analytics.track('faq_opened', {
                  question:
                    triggerEl.querySelector('.macc_question')?.textContent,
                });
              }
            }}
          >
            <MorphingAccordion
              items={faqItems.map(({ q, a }, index) => ({
                question: q,
                answer: renderAnswerWithLinks(a, links[index]),
              }))}
              startOpen={null}
            />
          </div>
        }
      />
    </div>
  );
}
