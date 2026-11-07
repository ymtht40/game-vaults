'use client';

/* Variable Mapping:
   c -> DEFAULT_FAQ_LINKS
   e -> ns
   o -> links
   u -> vars
   d -> items
   f -> interpolateVars
   h -> resolvedFaqs
   m -> listWrapRef
*/

import { useRef, useEffect } from 'react';
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348 // UNRESOLVED: name guessed from usage
import TransitionLink from '@/components/navigation/TransitionLink'; // NOTE: module id: 101836 // UNRESOLVED: could be next/link or project Link wrapper
import { FaqSection } from '@/components/faq/FaqSection'; // NOTE: module id: 752362
import { MorphingAccordion } from '@/components/ui/MorphingAccordion'; // NOTE: module id: 4707

const DEFAULT_FAQ_LINKS = [
  { 'Every Annnimate tier': '/pricing' },
  { 'Annnimate Studio': '/pricing' },
  {},
  { '14-day money-back guarantee': '/refund' },
  { 'Next.js App Router': '/nextjs', 'Nuxt ready': '/nuxt' },
  { 'MCP server': '/docs/guides/mcp' },
  { 'free Starter Pack': '/starter-pack', 'live preview': '/animations' },
  { 'Landmark Kit purchase': '/kits' },
];

function renderAnswerWithLinks(answerText, linkMap = {}) {
  const matchedPhrases = Object.keys(linkMap).filter((phrase) => answerText.includes(phrase));
  if (!matchedPhrases.length) return answerText;
  const escapedPhrases = matchedPhrases.map((phrase) =>
    phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  return answerText.split(RegExp(`(${escapedPhrases.join('|')})`)).map((part, partIndex) =>
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
  const interpolateVars = (str) =>
    str.replace(/\{(\w+)\}/g, (match, key) => (key === 'cap' ? 25 : (vars[key] ?? match)));

  const resolvedFaqs = (items ?? t(`${ns}.items`)).map(({ q, a }) => ({
    q: interpolateVars(q),
    a: interpolateVars(a),
  }));

  const listWrapRef = useRef(null);

  useEffect(() => {
    const wrapEl = listWrapRef.current;
    if (!wrapEl) return;

    const syncMinHeight = () => {
      if (!window.matchMedia('(min-width: 1024px)').matches) {
        wrapEl.style.minHeight = '';
        return;
      }
      const listEl = wrapEl.querySelector('.macc_list');
      const panelEls = [...wrapEl.querySelectorAll('.macc_panel')];
      if (!listEl || !panelEls.length) return;
      const closedListHeight =
        listEl.offsetHeight - panelEls.reduce((sum, panel) => sum + panel.offsetHeight, 0);
      const maxPanelHeight = Math.max(...panelEls.map((panel) => panel.scrollHeight));
      wrapEl.style.minHeight = `${closedListHeight + maxPanelHeight + 32}px`;
    };

    document.fonts?.ready.then(syncMinHeight);
    syncMinHeight();

    const resizeObserver = new ResizeObserver(syncMinHeight);
    resizeObserver.observe(wrapEl);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="v3-faq">
      <FaqSection
        faqs={resolvedFaqs}
        theme="dark"
        headline={t(`${ns}.headline`)}
        subtext={t(`${ns}.subtext`)}
        list={
          <div
            ref={listWrapRef}
            onClickCapture={(event) => {
              const triggerEl = event.target.closest('.macc_trigger');
              if (triggerEl?.getAttribute('aria-expanded') === 'false') {
                analytics.track('faq_opened', {
                  question: triggerEl.querySelector('.macc_question')?.textContent,
                });
              }
            }}
          >
            <MorphingAccordion
              items={resolvedFaqs.map(({ q, a }, index) => ({
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
