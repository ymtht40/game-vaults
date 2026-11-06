'use client';

/* Variable Mapping:
 * k -> PLATFORM_COLUMN
 * j -> KITS_COLUMN
 * N -> SOCIAL_LINKS
 * S -> LEGAL_LINKS
 * E -> FooterAccordionColumn (e -> label, i -> links, o -> isOpen, s -> setIsOpen, l -> contentRef, a -> iconRef, c -> verticalLineRef, h -> timelineRef)
 * L -> StudioClock (e -> time, i -> setTime)
 * T -> LatestAnimationStatus (e -> latest, r -> relativeTime, n -> title, o -> slug)
 * default -> Footer (e -> latestAnimation, i -> categories, n -> columns)
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '@/libs/utils/vendor'; // NOTE: module id: 989970
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { XLogo } from '@phosphor-icons/react';
import { LinkedinLogo } from '@phosphor-icons/react';
import { InstagramLogo } from '@phosphor-icons/react';
import { GithubLogo } from '@phosphor-icons/react';
import LogoIcon from '@/assets/logos/LogoIcon'; // NOTE: module id: 843028 // UNRESOLVED: export name guessed from usage
import TransitionLink from '@/components/navigation/TransitionLink'; // NOTE: module id: 101836
import AskAiBar from '@/components/ui/AskAiBar'; // NOTE: module id: 297428
import { AnimatedStrokeIcon } from '@/assets/icons/AnimatedStrokeIcon'; // NOTE: module id: 503433 // UNRESOLVED: export name guessed from usage
import Button from '@/components/ui/Button'; // NOTE: module id: 520237
import Divider from '@/components/ui/Divider'; // NOTE: module id: 297428
import { PingIndicator } from '@/features/common/PingIndicator'; // NOTE: module id: 400545 // UNRESOLVED: export name guessed from usage
import NewsletterForm, { NewsletterEyebrow } from '@/features/newsletter/NewsletterForm'; // NOTE: module id: 42242
import { useCategories } from '@/contexts/CategoryProvider'; // NOTE: module id: 87207

const PLATFORM_COLUMN = {
  label: t('common.footer.columns.platform'),
  links: [
    {
      label: t('common.footer.platformLinks.howItWorks'),
      href: '/platform',
    },
    {
      label: t('common.footer.platformLinks.documentation'),
      href: '/docs',
    },
    {
      label: t('common.footer.platformLinks.mcpServer'),
      href: '/docs/guides/mcp',
    },
    {
      label: t('common.footer.platformLinks.learnGsap'),
      href: '/learn',
    },
    {
      label: t('common.footer.platformLinks.freeTools'),
      href: '/tools',
    },
    {
      label: t('common.footer.platformLinks.compare'),
      href: '/compare',
    },
    {
      label: t('common.footer.platformLinks.stateOfWebAnimation'),
      href: '/state-of-web-animation',
    },
    {
      label: t('common.footer.platformLinks.changelog'),
      href: '/changelog',
    },
    {
      label: t('common.footer.platformLinks.roadmap'),
      href: '/roadmap',
    },
    {
      label: t('common.footer.platformLinks.pricing'),
      href: '/pricing',
    },
    {
      label: t('common.footer.platformLinks.faqs'),
      href: '/faq',
    },
    {
      label: t('common.footer.platformLinks.affiliates'),
      href: '/affiliate',
    },
  ],
};

const KITS_COLUMN = {
  label: t('common.footer.columns.kits'),
  links: [
    {
      label: t('common.footer.kitsLinks.seeTheKits'),
      href: '/kits',
    },
    {
      label: t('common.footer.kitsLinks.whatAKitIs'),
      href: '/kits',
    },
    {
      label: t('common.footer.kitsLinks.kitVsLibrary'),
      href: '/kits',
    },
  ],
};

const SOCIAL_LINKS = [
  {
    label: 'X',
    href: 'https://x.com/juli_fella',
    Icon: XLogo,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/julianfella/',
    Icon: LinkedinLogo,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/goodfelladesign/',
    Icon: InstagramLogo,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/GoodFellaStudio',
    Icon: GithubLogo,
  },
];

const LEGAL_LINKS = [
  {
    label: t('common.footer.legalLinks.privacy'),
    href: '/privacy',
  },
  {
    label: t('common.footer.legalLinks.terms'),
    href: '/terms',
  },
  {
    label: t('common.footer.legalLinks.cookies'),
    href: '/cookies',
  },
  {
    label: t('common.footer.legalLinks.refund'),
    href: '/refund',
  },
];

function FooterAccordionColumn({ label, links }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const iconRef = useRef(null);
  const verticalLineRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    gsap.set(contentEl, {
      height: 0,
      overflow: 'hidden',
      force3D: true,
    });

    const tl = gsap.timeline({
      paused: true,
      defaults: {
        duration: 0.5,
        ease: 'expo.inOut',
      },
    });

    tl.to(contentEl, { height: 'auto' }, 0);

    if (iconRef.current) {
      tl.to(iconRef.current, { rotation: -180 }, 0);
    }

    if (verticalLineRef.current) {
      tl.to(
        verticalLineRef.current,
        {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.inOut',
        },
        0.1
      );
    }

    timelineRef.current = tl;
    return () => tl.kill();
  }, []);

  useEffect(() => {
    if (timelineRef.current) {
      if (isOpen) {
        timelineRef.current.play();
      } else {
        timelineRef.current.reverse();
      }
    }
  }, [isOpen]);

  return (
    <div className="border-b border-foreground/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-16 py-20 text-left text-foreground transition-colors duration-300"
      >
        <span className="text-mono-sm">{label}</span>
        <svg
          ref={iconRef}
          className="h-12 w-12 shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            ref={verticalLineRef}
            d="M8 1V15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
          <path
            d="M1 8H15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>
      </button>
      <div ref={contentRef}>
        <ul className="flex flex-col pb-20">
          {links.map((link) => (
            <li key={link.label}>
              <Button
                href={link.href}
                variant="nav"
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-body-sm -mx-12 text-foreground"
              >
                {link.label}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StudioClock() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Vienna',
    });

    const updateTime = () => setTime(formatter.format(new Date()));
    updateTime();

    const intervalId = setInterval(updateTime, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <span className="text-mono-sm text-foreground-muted">
      {time ? t('common.footer.studioClock', { time }) : ''}
    </span>
  );
}

function LatestAnimationStatus({ latest }) {
  const relativeTime = (function getRelativeTime(publishedAt) {
    if (!publishedAt) return null;
    const timestamp = new Date(publishedAt).getTime();
    if (Number.isNaN(timestamp)) return null;

    const daysDiff = Math.floor((Date.now() - timestamp) / 86400000);
    if (daysDiff <= 0) return t('common.footer.relativeTime.today');
    if (daysDiff === 1) return t('common.footer.relativeTime.yesterday');
    if (daysDiff < 7) {
      return t('common.footer.relativeTime.daysAgo', { n: daysDiff });
    }
    if (daysDiff < 30) {
      const weeksDiff = Math.floor(daysDiff / 7);
      return weeksDiff === 1
        ? t('common.footer.relativeTime.weekAgo')
        : t('common.footer.relativeTime.weeksAgo', { n: weeksDiff });
    }

    const monthsDiff = Math.floor(daysDiff / 30);
    return monthsDiff === 1
      ? t('common.footer.relativeTime.monthAgo')
      : t('common.footer.relativeTime.monthsAgo', { n: monthsDiff });
  })(latest?.published_at);

  const title = latest?.title;
  const slug = latest?.slug;

  return (
    <div className="text-mono-sm flex flex-wrap items-center gap-x-12 gap-y-4 text-foreground-muted">
      <PingIndicator className="size-12" />
      {title && slug ? (
        <>
          <span>{t('common.footer.status.justShipped')}</span>
          <Button
            href={`/animations/${slug}`}
            variant="nav"
            className="text-mono-sm -mx-12 -my-6 text-foreground"
          >
            {title}
          </Button>
          {relativeTime ? (
            <>
              <span className="opacity-40">·</span>
              <span>{relativeTime}</span>
            </>
          ) : null}
        </>
      ) : (
        <span>{t('common.footer.status.default')}</span>
      )}
    </div>
  );
}

// NOTE: module id: 297428
export default function Footer({ latestAnimation }) {
  const categories = useCategories();

  const columns = useMemo(
    () => [
      PLATFORM_COLUMN,
      {
        label: t('common.footer.columns.library'),
        links: [
          {
            label: t('common.footer.libraryLinks.allComponents'),
            href: '/animations',
          },
          ...categories.map((category) => ({
            label: category.name,
            href: `/animations?category=${category.slug}`,
          })),
          {
            label: t('common.footer.libraryLinks.showcase'),
            href: '/showcase',
          },
        ],
      },
      KITS_COLUMN,
    ],
    [categories]
  );

  return (
    <footer
      data-theme="dark"
      className="annnimate-footer relative bg-background px-8 pb-8 lg:px-32 lg:pb-32"
    >
      <div
        data-theme="light"
        className="relative z-[20] px-16 py-24 lg:p-48 overflow-hidden bg-background text-foreground"
      >
        <div className="w-full max-w-[calc(var(--v2-max,1920px)-64px)] mx-auto py-24">
          <div className="grid grid-cols-12 items-center gap-16">
            <div className="col-span-12 md:col-span-7">
              <LatestAnimationStatus latest={latestAnimation} />
            </div>
            <div className="col-span-12 md:col-span-5 md:justify-self-end">
              <div className="flex flex-wrap items-center gap-x-24 gap-y-12">
                <AskAiBar />
                <span className="hidden md:inline">
                  <StudioClock />
                </span>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        <div className="w-full max-w-[calc(var(--v2-max,1920px)-64px)] mx-auto py-32 lg:py-64">
          <div className="grid grid-cols-12 gap-16 gap-y-64">
            <div className="col-span-12 flex flex-col gap-32 lg:col-span-5">
              <TransitionLink
                href="/"
                aria-label="GameVault home"
                className="inline-block w-fit"
              >
                <LogoIcon height={20} className="text-foreground" />
              </TransitionLink>

              <NewsletterForm
                source="footer"
                idPrefix="footer"
                eyebrow={<NewsletterEyebrow />}
                inputSize="lg"
              />

              <div className="flex flex-wrap items-center gap-x-12 gap-y-16">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-40 items-center justify-center text-foreground transition-colors lg:size-32 duration-(--duration-fast) ease-(--ease-expo-out) hover:text-foreground-muted"
                  >
                    <Icon className="size-20" aria-hidden="true" />
                  </a>
                ))}
                <Button
                  href="/contact"
                  variant="nav"
                  className="text-mono-sm text-foreground"
                >
                  {t('common.footer.contact')}
                </Button>
              </div>

              <AnimatedStrokeIcon
                fit="width"
                tone="muted"
                playOnView={true}
                aria-hidden="true"
                className="mt-auto w-1/2 pt-32 lg:w-full"
              />
            </div>

            <div className="col-span-12 flex flex-col lg:hidden">
              {columns.map((column) => (
                <FooterAccordionColumn
                  key={column.label}
                  label={column.label}
                  links={column.links}
                />
              ))}
            </div>

            {columns.map((column, index) => (
              <nav
                key={column.label}
                aria-label={column.label}
                className={`hidden lg:col-span-2 lg:block ${
                  index === 0 ? 'lg:col-start-7' : ''
                }`}
              >
                <p className="text-mono-sm mb-24 text-foreground-muted">
                  {column.label}
                </p>
                <ul className="flex flex-col">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Button
                        href={link.href}
                        variant="nav"
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="text-body-sm -mx-12 text-foreground"
                      >
                        {link.label}
                      </Button>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <Divider />

        <div className="w-full max-w-[calc(var(--v2-max,1920px)-64px)] mx-auto pt-24">
          <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-center">
            <div className="text-mono-sm flex flex-wrap items-center gap-x-8 gap-y-4 text-foreground-muted">
              <span>
                {t('common.footer.copyright', {
                  year: new Date().getFullYear(),
                })}
              </span>
              <span className="opacity-40">·</span>
              <span>{t('common.footer.builtBy')}</span>
              <Button
                href="https://good-fella.com"
                variant="nav"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mono-sm -mx-12 -my-6 text-foreground"
              >
                {t('common.footer.builtByName')}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-32 gap-y-12">
              {LEGAL_LINKS.map((link) => (
                <Button
                  key={link.href}
                  href={link.href}
                  variant="nav"
                  className="text-mono-sm -mx-12 -my-6 text-foreground"
                >
                  {link.label}
                </Button>
              ))}
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('gamevault:open-cookie-preferences')
                  )
                }
                className="text-mono-sm inline-flex items-center text-foreground-muted transition-colors duration-300 ease-out hover:text-foreground"
              >
                {t('common.footer.cookiePreferences')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

