'use client';

import { useRef, useEffect } from 'react';
import { t } from '@/libs/utils/i18n';
import { analytics } from '@/libs/analytics/posthogAnalytics';
import TransitionLink from '@/components/navigation/TransitionLink';
import MorphingAccordion from '@/components/ui/MorphingAccordion';
import AccordionSection from '@/sections/accordion/AccordionSection';
import { DEFAULT_FAQ_LINKS } from '@/features/pricing-page/utils/v3-faq.config';

const ANSWER_LINK_CLASS =
  'underline decoration-foreground/40 underline-offset-2 transition-[text-decoration-color] duration-200 hover:decoration-foreground';

function renderAnswerPart(part, partIndex, linkMap) {
  const href = linkMap[part];
  if (!href) return part;

  return (
    <TransitionLink
      key={partIndex}
      href={href}
      className={ANSWER_LINK_CLASS}
    >
      {part}
    </TransitionLink>
  );
}

function renderAnswerWithLinks(answerText, linkMap = {}) {
  const matchedKeys = Object.keys(linkMap).filter((key) => answerText.includes(key));
  if (!matchedKeys.length) return answerText;

  const escapedKeys = matchedKeys.map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  return answerText
    .split(RegExp(`(${escapedKeys.join('|')})`))
    .map((part, partIndex) => renderAnswerPart(part, partIndex, linkMap));
}

function interpolateVars(text, vars) {
  return text.replace(/\{(\w+)\}/g, (match, key) => (key === 'cap' ? 25 : vars[key] ?? match));
}

function buildFaqItems(rawItems, vars) {
  return rawItems.map(({ q, a }) => ({
    q: interpolateVars(q, vars),
    a: interpolateVars(a, vars),
  }));
}

function buildMorphingItems(faqItems, links) {
  return faqItems.map(({ q, a }, index) => ({
    question: q,
    answer: renderAnswerWithLinks(a, links[index]),
  }));
}

function updateContainerMinHeight(containerEl) {
  if (!window.matchMedia('(min-width: 1024px)').matches) {
    containerEl.style.minHeight = '';
    return;
  }

  const listEl = containerEl.querySelector('.macc_list');
  const panels = [...containerEl.querySelectorAll('.macc_panel')];
  if (!listEl || !panels.length) return;

  const panelsHeight = panels.reduce((sum, panel) => sum + panel.offsetHeight, 0);
  const baseHeight = listEl.offsetHeight - panelsHeight;
  const maxPanelHeight = Math.max(...panels.map((panel) => panel.scrollHeight));
  containerEl.style.minHeight = `${baseHeight + maxPanelHeight + 32}px`;
}

function onListClickCapture(event) {
  const triggerEl = event.target.closest('.macc_trigger');
  if (triggerEl?.getAttribute('aria-expanded') !== 'false') return;

  analytics.track('faq_opened', {
    question: triggerEl.querySelector('.macc_question')?.textContent,
  });
}

function AccordionList({ listContainerRef, morphingItems }) {
  return (
    <div ref={listContainerRef} onClickCapture={onListClickCapture}>
      <MorphingAccordion items={morphingItems} startOpen={null} />
    </div>
  );
}

function Accordion({
  ns = 'home-v3.faq',
  links = DEFAULT_FAQ_LINKS,
  vars = {},
  items = null,
}) {
  const listContainerRef = useRef(null);
  const faqItems = buildFaqItems(items ?? t(`${ns}.items`), vars);
  const morphingItems = buildMorphingItems(faqItems, links);

  useEffect(() => {
    const containerEl = listContainerRef.current;
    if (!containerEl) return;

    function updateMinHeight() {
      updateContainerMinHeight(containerEl);
    }

    document.fonts?.ready.then(updateMinHeight);
    updateMinHeight();

    const observer = new ResizeObserver(updateMinHeight);
    observer.observe(containerEl);

    return function cleanup() {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="v3-faq">
      <AccordionSection
        faqs={faqItems}
        theme="dark"
        headline={t(`${ns}.headline`)}
        subtext={t(`${ns}.subtext`)}
        list={(
          <AccordionList
            listContainerRef={listContainerRef}
            morphingItems={morphingItems}
          />
        )}
      />
    </div>
  );
}

export default Accordion;
