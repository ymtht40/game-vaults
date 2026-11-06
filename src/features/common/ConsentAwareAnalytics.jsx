'use client';

import React, { Fragment, Suspense, useEffect, useState } from 'react';
import Script from 'next/script'; // NOTE: module id: 3303
import { usePathname, useSearchParams } from 'next/navigation'; // NOTE: module id: 618566
import { getConsentState } from '@/libs/config/consent'; // NOTE: module id: 160725
import { createClient } from '@/libs/supabase/client'; // NOTE: module id: 416983
import { pricingConfig } from '@/libs/data/pricing'; // NOTE: module id: 516799
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_PROXY = '/relay-A8q3';
const POSTHOG_HOST = 'https://us.posthog.com';
const SENSITIVE_PARAM_KEYS = ['token_hash', 'token', 'code', 'access_token', 'refresh_token'];

function stripAuthCredentials(searchParams) {
  if (!searchParams || !searchParams.toString()) return '';
  const params = new URLSearchParams(searchParams.toString());
  for (const key of SENSITIVE_PARAM_KEYS) {
    params.delete(key);
  }
  return params.toString();
}

function PageViewTracker() {
  const pathname = usePathname(); // NOTE: module id: 618566
  const searchParams = useSearchParams(); // NOTE: module id: 618566

  useEffect(() => {
    if (!pathname || !window.posthog || typeof window.posthog.capture !== 'function') return;

    const sanitizedParams = stripAuthCredentials(searchParams);
    let fullUrl = window.origin + pathname;
    if (sanitizedParams) {
      fullUrl = `${fullUrl}?${sanitizedParams}`;
    }

    window.posthog.capture('$pageview', {
      $current_url: fullUrl,
      $pathname: pathname,
      $search_params: sanitizedParams,
    });
  }, [pathname, searchParams]);

  return null;
}

function PostHogConsentSync() {
  useEffect(() => {
    const handleConsentChange = () => {
      const ph = window.posthog;
      if (!ph || typeof ph.set_config !== 'function') return;

      let isAllowed = false;
      try {
        const match = document.cookie.match(/(?:^|; )gamevault_consent=([^;]+)/);
        if (match) {
          const consent = JSON.parse(atob(decodeURIComponent(match[1])));
          isAllowed = Boolean(consent && consent.analytics === true);
        }
      } catch {
        isAllowed = false;
      }

      if (isAllowed) {
        ph.set_config({
          persistence: 'localStorage+cookie',
          autocapture: true,
          disable_session_recording: false,
        });
        if (typeof ph.startSessionRecording === 'function') {
          ph.startSessionRecording();
        }
      } else {
        if (typeof ph.stopSessionRecording === 'function') {
          ph.stopSessionRecording();
        }
        ph.set_config({
          persistence: 'memory',
          autocapture: false,
          disable_session_recording: true,
        });
        document.cookie.split('; ').forEach((cookieStr) => {
          const key = cookieStr.split('=')[0];
          if (key.startsWith('ph_')) {
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            document.cookie = `${key}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          }
        });
      }
    };

    window.addEventListener('gamevault:consent-changed', handleConsentChange);
    return () => window.removeEventListener('gamevault:consent-changed', handleConsentChange);
  }, []);

  return null;
}

function PostHogSnippet() {
  if (!POSTHOG_KEY || POSTHOG_KEY.includes('YOUR_PROJECT_API_KEY')) {
    return null;
  }

  return (
    <Fragment>
      <Script
        id="posthog-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group setPersonProperties setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags startSessionRecording stopSessionRecording captureException".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

            // Pick the init config based on the user's current consent cookie.
            // No cookie or analytics:false -> cookieless minimal mode. ePrivacy
            // 5(3) isn't triggered because nothing is stored on the device.
            (function () {
              var allowed = false;
              try {
                var match = document.cookie.match(/(?:^|; )gamevault_consent=([^;]+)/);
                if (match) {
                  var data = JSON.parse(atob(decodeURIComponent(match[1])));
                  allowed = data && data.analytics === true;
                }
              } catch (_) { allowed = false; }

              // Strip auth credentials (magic-link token hashes, OAuth codes)
              // from every URL-shaped property. The pageview tracker scrubs its
              // own capture, but autocapture/pageleave/referrer build URLs
              // internally - this catches those in both modes.
              var SENSITIVE_RE = /([?&])(token_hash|token|code|access_token|refresh_token)=[^&#]*/g;
              var sanitize = function (props) {
                for (var k in props) {
                  if (typeof props[k] === 'string' && props[k].indexOf('=') !== -1) {
                    props[k] = props[k].replace(SENSITIVE_RE, '$1$2=REDACTED');
                  }
                }
                return props;
              };

              // Auxiliary modules are EXPLICITLY OFF. Each one loads a separate
              // script (e.g. dead-clicks-autocapture.js, surveys.js, heatmaps.js)
              // which uBlock matches on the filename pattern even through the
              // proxy. We don't use these features in any dashboard tile, and
              // leaving them on produces a wall of net::ERR_BLOCKED_BY_CLIENT
              // console errors for every ad-blocker user. Re-enable individually
              // only if a dashboard tile depends on the event.
              // disable_scroll_properties: PostHog's scroll manager read the
              // page height on every scroll event (a forced layout per frame,
              // 2026-10-13); MarketingTracking already records scroll depth.
              var cookieless = {
                api_host: '${POSTHOG_PROXY}',
                ui_host: '${POSTHOG_HOST}',
                sanitize_properties: sanitize,
                persistence: 'memory',
                person_profiles: 'identified_only',
                capture_pageview: false,
                capture_pageleave: false,
                autocapture: false,
                capture_dead_clicks: false,
                capture_heatmaps: false,
                disable_scroll_properties: true,
                disable_surveys: true,
                disable_session_recording: true,
                disable_web_experiments: true
              };

              var full = {
                api_host: '${POSTHOG_PROXY}',
                ui_host: '${POSTHOG_HOST}',
                sanitize_properties: sanitize,
                persistence: 'localStorage+cookie',
                person_profiles: 'identified_only',
                capture_pageview: false,
                capture_pageleave: true,
                autocapture: true,
                capture_dead_clicks: false,
                capture_heatmaps: false,
                disable_scroll_properties: true,
                disable_surveys: true,
                disable_session_recording: false,
                disable_web_experiments: true,
                session_recording: { maskAllInputs: true, maskTextContent: false }
              };

              posthog.init('${POSTHOG_KEY}', allowed ? full : cookieless);
            })();
          `,
        }}
      />
      <PostHogConsentSync />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </Fragment>
  );
}

function CrispChat() {
  const pathname = usePathname(); // NOTE: module id: 618566
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient(); // NOTE: module id: 416983
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    })();
  }, []);

  useEffect(() => {
    if (userId && window.$crisp) {
      window.$crisp.push(['set', 'session:data', [[['userId', userId]]]]);
    }
  }, [userId]);

  useEffect(() => {
    if (!pricingConfig.crisp?.id) return; // NOTE: module id: 516799
    const timer = setTimeout(() => {
      if (window.$crisp && pricingConfig.crisp.onlyShowOnRoutes && !pricingConfig.crisp.onlyShowOnRoutes.includes(pathname)) {
        window.$crisp.push(['do', 'chat:hide']);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!pricingConfig.crisp?.id) return null; // NOTE: module id: 516799

  return (
    <Fragment>
      <Script
        id="crisp-stub"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.$crisp=[];window.CRISP_WEBSITE_ID="${pricingConfig.crisp.id}";
          `,
        }}
      />
      <Script
        id="crisp-loader"
        strategy="afterInteractive"
        type="text/partytown"
        src="https://client.crisp.chat/l.js"
        async
      />
    </Fragment>
  );
}

function GlobalErrorCapture() {
  useEffect(() => {
    let count = 0;
    const seenErrors = new Set();

    const report = (source, err, metadata) => {
      const message = err?.message || String(err ?? '');
      if (!message || count >= 25) return;

      const dedupeKey = `${source}|${message.slice(0, 200)}`;
      if (!seenErrors.has(dedupeKey)) {
        seenErrors.add(dedupeKey);
        count += 1;
        try {
          analytics.error.exception(err instanceof Error ? err : Error(message), { // NOTE: module id: 943348
            source,
            ...metadata,
          });
        } catch {}
      }
    };

    const handleError = (event) => {
      report('uncaught_error', event?.error || Error(event?.message || ''), {
        file: event?.filename,
        line: event?.lineno,
        path: window.location?.pathname,
      });
    };

    const handleUnhandledRejection = (event) => {
      const reason = event?.reason;
      report('unhandled_rejection', reason instanceof Error ? reason : Error(String(reason ?? '')), {
        path: window.location?.pathname,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}

// NOTE: module id: 837558
export function ConsentAwareAnalytics() {
  const [consent, setConsent] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(getConsentState()); // NOTE: module id: 160725

    const handleConsentChange = () => setConsent(getConsentState()); // NOTE: module id: 160725
    window.addEventListener('gamevault:consent-changed', handleConsentChange);
    return () => window.removeEventListener('gamevault:consent-changed', handleConsentChange);
  }, []);

  if (!mounted) return null;

  return (
    <Fragment>
      <PostHogSnippet />
      <GlobalErrorCapture />
      {consent?.functional && <CrispChat />}
    </Fragment>
  );
}

