'use client';

import {
  COOKIE_MAX_AGE,
  FTP_COOKIE_NAME,
  parseSessionCookie,
  parseUrlSession,
  SESSION_COOKIE_NAME,
  stringifySessionCookie,
} from '@/libs/analytics/analytics-utils';

const SESSION_KEY = 'anm_ft';

function getUTMParams() {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    utm_source: searchParams.get('utm_source') || null,
    utm_medium: searchParams.get('utm_medium') || null,
    utm_campaign: searchParams.get('utm_campaign') || null,
    utm_term: searchParams.get('utm_term') || null,
    utm_content: searchParams.get('utm_content') || null,
    referrer: (typeof document !== 'undefined' && document.referrer) || null,
    landing_path: window.location.pathname || null,
  };
}

export function trackAttribution() {
  const data = { ...getUTMParams(), at: new Date().toISOString() };

  try {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    }
  } catch {}

  try {
    if (
      typeof document !== 'undefined' &&
      !document.cookie.split('; ').some((c) => c.startsWith(`${FTP_COOKIE_NAME}=`))
    ) {
      const formattedData = stringifySessionCookie(data);
      if (formattedData) {
        document.cookie = `${FTP_COOKIE_NAME}=${formattedData}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
      }
    }
  } catch {}

  try {
    const trackedParam = parseUrlSession({
      getParam: (param) => new URLSearchParams(window.location.search).get(param),
      at: data.at,
    });

    if (trackedParam) {
      const rawCookie = (function (prefix) {
        if (typeof document === 'undefined') return null;
        const cookie = document.cookie.split('; ').find((c) => c.startsWith(`${prefix}=`));
        return cookie ? cookie.slice(prefix.length + 1) : null;
      })(SESSION_COOKIE_NAME);

      const cookieValue = parseSessionCookie(rawCookie);

      const newValue =
        cookieValue &&
        cookieValue.id === trackedParam.id &&
        (cookieValue.campaign || null) === trackedParam.campaign
          ? null
          : stringifySessionCookie(trackedParam);

      if (newValue) {
        document.cookie = `${SESSION_COOKIE_NAME}=${newValue}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
      }
    }
  } catch {}
}

export function getAttributionData() {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return getUTMParams();
}
