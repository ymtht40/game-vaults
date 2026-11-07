'use client';

// Variable Mapping: s -> getCountryName, o -> CountryFlag, F -> usePppNoticeText, w -> PppTooltipBadge, y -> PppBanner, U -> PppCallout

import { useEffect, useRef, useState } from 'react'; // NOTE: module id: 271645
import { usePathname } from 'next/navigation'; // NOTE: module id: 618566
import { InfoIcon } from '@phosphor-icons/react'; // NOTE: module id: 30910
import { TooltipProvider, TooltipRoot as Tooltip, TooltipTrigger, TooltipContent,
} from '@/components/ui/Tooltip'; // NOTE: module id: 672706
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { usePppGeo } from '@/hooks/usePppGeo'; // NOTE: module id: 12895
import { getPppDiscountPercent } from '@/features/marketing/Ppppricing'; // NOTE: module id: 397242

function getCountryName(countryCode) {
  if (!countryCode) return null;
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || null;
  } catch {
    return null;
  }
}

function CountryFlag({ code, size = 20, className = '' }) {
  const normalizedCode =
    typeof code === 'string' && /^[A-Za-z]{2}$/.test(code) ? code.toLowerCase() : null;
  if (!normalizedCode) return null;

  const height = Math.round(size * 0.75);
  const upperCode = normalizedCode.toUpperCase();

  return (
    <img
      src={`https://flagcdn.com/w40/${normalizedCode}.png`}
      srcSet={`https://flagcdn.com/w80/${normalizedCode}.png 2x`}
      width={size}
      height={height}
      alt={getCountryName(upperCode) || upperCode}
      loading="lazy"
      decoding="async"
      style={{ width: size, height }}
      className={`inline-block shrink-0 border border-foreground/10 object-cover align-middle ${className}`}
    />
  );
}

function usePppNoticeText() {
  const pppGeo = usePppGeo();
  if (!pppGeo?.tier) return null;

  const countryName = getCountryName(pppGeo.country);
  return countryName
    ? t('pricing.tiers.pppNotice', { country: countryName })
    : t('pricing.tiers.pppNoticeGeneric');
}

function scrollToPricingSection(pathname) {
  const target = document.querySelector(
    pathname === '/pricing' ? '#pricing-tiers' : '#pricing'
  );
  if (!target) return;

  const offset =
    -(
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--v2-header-h')
      ) || 72
    ) - 24;

  if (window.lenis?.scrollTo) {
    window.lenis.scrollTo(target, { offset });
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// NOTE: module id: 245647
export function PppTooltipBadge({ className = '', tone = 'dark' }) {
  const noticeText = usePppNoticeText();
  const pppGeo = usePppGeo();

  if (!noticeText) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild={true}>
          <button
            type="button"
            className={`text-mono-sm inline-flex items-center gap-6 text-brand ${className}`}
          >
            <CountryFlag code={pppGeo?.country} size={16} />
            {t('pricing.tiers.pppName')}
            <InfoIcon size={13} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={10}
          className={
            tone === 'light'
              ? 'w-[320px] max-w-[90vw] border border-foreground/10 bg-background p-16 text-foreground'
              : 'w-[320px] max-w-[90vw] border-0 bg-foreground p-16 text-background'
          }
        >
          <p
            className={`text-mono-sm m-0 flex items-center gap-8 ${
              tone === 'light' ? 'text-foreground' : 'text-background'
            }`}
          >
            <CountryFlag code={pppGeo?.country} size={16} />
            {getCountryName(pppGeo?.country)
              ? t('pricing.tiers.pppTipTitle', {
                  country: getCountryName(pppGeo.country),
                })
              : t('pricing.tiers.pppName')}
            <span className="ml-auto whitespace-nowrap text-brand">
              {t('pricing.tiers.pppTipPct', {
                pct: getPppDiscountPercent(pppGeo?.tier),
              })}
            </span>
          </p>
          <p
            className={`text-body-sm mt-8 font-sans normal-case leading-relaxed ${
              tone === 'light' ? 'text-foreground-muted' : 'text-background/75'
            }`}
          >
            {noticeText}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function PppBanner() {
  const pppGeo = usePppGeo();
  const pathname = usePathname();
  const bannerRef = useRef(null);
  const [bannerTheme, setBannerTheme] = useState('dark');
  const isVisible = (pathname === '/' || pathname === '/pricing') && !!pppGeo?.tier;

  useEffect(() => {
    if (!isVisible) return;
    const themedSection = document.querySelector('main [data-theme]');
    setBannerTheme(themedSection?.dataset.theme === 'dark' ? 'light' : 'dark');
  }, [isVisible, pathname]);

  useEffect(() => {
    const docElement = document.documentElement;
    const bannerElement = bannerRef.current;
    if (!isVisible || !bannerElement) {
      docElement.style.removeProperty('--anm-ppp-offset');
      return;
    }

    let rafId = 0;
    let bannerHeight = bannerElement.offsetHeight;
    let currentScrollY = window.scrollY || 0;
    let lastOffset = null;

    const updateOffset = () => {
      rafId = 0;
      const visibleOffset = Math.max(0, bannerHeight - currentScrollY);
      if (visibleOffset !== lastOffset) {
        lastOffset = visibleOffset;
        docElement.style.setProperty('--anm-ppp-offset', `${visibleOffset}px`);
      }
    };

    const scheduleUpdate = () => {
      currentScrollY = window.scrollY || 0;
      if (!rafId) {
        rafId = requestAnimationFrame(updateOffset);
      }
    };

    updateOffset();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            bannerHeight = bannerElement.offsetHeight;
            scheduleUpdate();
          })
        : null;

    resizeObserver?.observe(bannerElement);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver?.disconnect();
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      docElement.style.removeProperty('--anm-ppp-offset');
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const countryName = getCountryName(pppGeo.country);
  const discountPercent = getPppDiscountPercent(pppGeo.tier);

  return (
    <div
      ref={bannerRef}
      data-testid="ppp-banner"
      data-theme={bannerTheme}
      className="relative z-[301] w-full bg-background text-foreground"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-4 px-16 py-10 text-center">
        <p className="text-mono-sm m-0 inline-flex items-center gap-10">
          <CountryFlag code={pppGeo.country} size={20} />
          {countryName
            ? t('pricing.tiers.pppBanner', { country: countryName })
            : t('pricing.tiers.pppName')}
        </p>
        <p className="text-body-sm m-0 text-foreground-muted">
          {t('pricing.tiers.pppBannerBody', { pct: discountPercent })}
        </p>
        <button
          type="button"
          onClick={() => scrollToPricingSection(pathname)}
          className="text-mono-sm text-foreground underline underline-offset-4 transition-colors duration-(--duration-quick) hover:text-brand"
        >
          {t('pricing.tiers.pppBannerCta')}
        </button>
      </div>
    </div>
  );
}

export function PppCallout({ className = '', align = 'center' }) {
  const noticeText = usePppNoticeText();
  const pppGeo = usePppGeo();

  if (!noticeText) return null;

  return (
    <aside className={`flex ${align === 'start' ? 'justify-start' : 'justify-center'} ${className}`}>
      <div className="flex max-w-[560px] flex-col gap-8 border border-foreground/10 bg-surface px-20 py-16">
        <p className="text-mono-sm flex items-center gap-8 text-brand">
          <span aria-hidden="true" className="inline-block size-8 bg-brand" />
          {t('pricing.tiers.pppName')}
          <CountryFlag code={pppGeo?.country} size={16} />
        </p>
        <p className="text-body-sm text-foreground-muted">{noticeText}</p>
      </div>
    </aside>
  );
}