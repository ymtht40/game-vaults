'use client';

import RevealHeading from '@/components/motion/RevealHeading';
import AnimatedText from '@/components/motion/AnimatedText';
import FadeIn from '@/components/motion/FadeIn';
import { testimonials } from '@/libs/data/testimonials';

const ITEM_STAGGER = 0.12;
const CAPTION_DELAY = 0.3;

const textRevealProps = {
  type: 'lines',
  mask: 'lines',
  duration: 0.6,
  stagger: 0.03,
  ease: 'power2.out',
  animationProps: { yPercent: 100 },
};

function resolveQuotes(names, quotes) {
  if (!names) return quotes;

  return names
    .map((name) => testimonials.find((item) => item.name === name))
    .filter(Boolean);
}

export default function TestimonialsSection({
  headline,
  names,
  quotes = [],
}) {
  const resolvedQuotes = resolveQuotes(names, quotes);

  return (
    <section
      data-theme="light"
      className="bg-background py-64 text-foreground lg:py-160"
    >
      <div className="v2-container flex flex-col gap-48 lg:gap-80">
        <RevealHeading
          as="h2"
          sizeClass="text-h2"
          className="max-w-[20ch] font-medium text-balance"
          trigger="scroll"
        >
          {headline}
        </RevealHeading>

        <div className="grid grid-cols-12 gap-y-64 lg:gap-x-24">
          {resolvedQuotes.map((quote, index) => (
            <figure
              key={quote.name}
              className="col-span-12 flex flex-col gap-32 lg:col-span-6 lg:pr-48"
            >
              <AnimatedText
                tag="blockquote"
                className="text-h4 !font-normal"
                {...textRevealProps}
                triggerMode="scroll"
                delay={ITEM_STAGGER * index}
              >
                {quote.body}
              </AnimatedText>

              <FadeIn
                as="figcaption"
                trigger="scroll"
                delay={CAPTION_DELAY + ITEM_STAGGER * index}
                className="flex items-center gap-16"
              >
                {quote.avatarSrc ? (
                  <div className="relative size-56 shrink-0 overflow-hidden">
                    <img
                      src={quote.avatarSrc}
                      alt=""
                      className="absolute inset-0 object-cover"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  <span className="text-body-sm font-medium">{quote.name}</span>
                  <span className="text-body-sm text-foreground-muted">
                    {quote.role}
                  </span>
                </div>
              </FadeIn>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
