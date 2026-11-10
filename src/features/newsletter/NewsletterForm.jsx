'use client';

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner'; // NOTE: module id: 846696
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import NavLink from '@/components/navigation/NavSurface'; // NOTE: module id: 520237
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { useListSize } from '@/providers/ListSizeProvider'; // NOTE: module id: 637161
import ConfirmInbox from '@/features/auth/ConfirmInbox'; // NOTE: module id: 987025
import { parseSessionCookie, parseUrlSession, SESSION_COOKIE_NAME } from '@/libs/analytics/analytics-utils'; // NOTE: module id: 660219

// NOTE: module id: 927627
export const STARTER_PROMPT_DISMISSED_KEY = 'anm_starter_prompt_dismissed_v1';

export function markStarterPromptDismissed() {
  try {
    window.localStorage.setItem(STARTER_PROMPT_DISMISSED_KEY, String(Date.now()));
  } catch {}
}

export function getSessionUserId() {
  if (typeof document === 'undefined') return null;
  const paramUser = parseUrlSession({
    getParam: (param) => new URLSearchParams(window.location.search).get(param),
  })?.id;

  if (paramUser) return paramUser;

  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.slice(SESSION_COOKIE_NAME.length + 1);

  return parseSessionCookie(cookie)?.id || null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STARTER_PACK_SOURCES = new Set([
  'starter-pack',
  'animations-library',
  'animations-detail',
  'animations-list-modal',
  'mobile-detail',
  'paywall-block',
  'kit-reveal-ad',
  'kit-reveal-page',
  'homepage',
  'pricing',
  'alternatives',
  'alternatives-top',
  'compare',
  'compare-top',
  'reference-rail',
]);

function validateForm({ email, acceptedPolicy, consent }) {
  const errors = {};
  const trimmed = email.trim();

  if (!trimmed) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(trimmed)) {
    errors.email = 'Enter a valid email address.';
  }

  if (consent === 'checkbox' && !acceptedPolicy) {
    errors.policy = 'Please accept the privacy policy to continue.';
  }

  return errors;
}

// NOTE: module id: 42242
export function NewsletterEyebrow({ primary = 'Weekly drop', secondary }) {
  const listSize = useListSize();
  const audienceText = secondary ?? (listSize ? `Join ${listSize} developers and designers` : null);

  return (
    <div className="text-mono-sm flex flex-wrap items-center gap-x-12 gap-y-4 text-foreground-muted">
      <span className="text-foreground">{primary}</span>
      {audienceText ? (
        <Fragment>
          <span aria-hidden="true" className="inline-block size-8 bg-brand" />
          <span>{audienceText}</span>
        </Fragment>
      ) : null}
    </div>
  );
}

export default function NewsletterForm({
  source = 'footer',
  eyebrow,
  buttonLabel = 'Join',
  buttonSize = 'sm',
  inputSize = 'sm',
  emailPlaceholder = 'you@studio.com',
  idPrefix,
  className = '',
  wantedComponent,
  onSuccess,
  compact = false,
  buttonFullWidth = false,
  consent = 'checkbox',
  consentCopy = null,
  askName = true,
  successPanel = null,
  fieldStyle = 'underline',
  fieldLabel = 'Your email address',
}) {
  const [email, setEmail] = useState('');
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmedEmail, setConfirmedEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const emailInputRef = useRef(null);
  const policyInputRef = useRef(null);
  const formRef = useRef(null);
  const websiteHoneypotRef = useRef(null);
  const hasTrackedViewRef = useRef(false);
  const hasTrackedStartRef = useRef(false);

  const getAnalyticsPayload = () => ({
    source: source || 'unknown',
    page_url: window.location.href,
  });

  useEffect(() => {
    const el = formRef.current;
    if (!el || hasTrackedViewRef.current || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasTrackedViewRef.current) {
            hasTrackedViewRef.current = true;
            analytics.track('newsletter_form_viewed', getAnalyticsPayload());
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [source]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isSubscribed) return;

    const validationErrors = validateForm({
      email,
      acceptedPolicy,
      consent,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      analytics.track('newsletter_form_validation_failed', {
        ...getAnalyticsPayload(),
        errors: Object.keys(validationErrors),
      });

      if (validationErrors.email) {
        emailInputRef.current?.focus();
      } else if (validationErrors.policy) {
        policyInputRef.current?.focus();
      }
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source,
          wantedComponent: wantedComponent || undefined,
          website: websiteHoneypotRef.current?.value || undefined,
          metadata: {
            page_url: window.location.href,
            referrer: (typeof document !== 'undefined' && document.referrer) || null,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Could not subscribe');
      }

      analytics.track('newsletter_subscribed', {
        source: source || 'unknown',
        page_url: window.location.href,
      });

      toast.success(
        STARTER_PACK_SOURCES.has(source)
          ? 'Almost there. Open the email from contact@drivexstore.shop and confirm. Your Starter Pack lands right after.'
          : 'Almost there. Open the email from contact@drivexstore.shop and click confirm.'
      );

      markStarterPromptDismissed();
      onSuccess?.(email.trim());
      setConfirmedEmail(email.trim());

      if (askName) {
        analytics.track('newsletter_profile_shown', getAnalyticsPayload());
      } else {
        setIsFinished(true);
      }

      setIsSubscribed(true);
      setEmail('');
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Try again?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (isSavingName) return;

    const trimmed = firstName.trim();
    if (!trimmed) {
      handleSkipName();
      return;
    }

    setIsSavingName(true);
    try {
      await fetch('/api/newsletter/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: confirmedEmail,
          firstName: trimmed,
        }),
      });
      analytics.track('newsletter_profile_completed', getAnalyticsPayload());
    } catch {
    } finally {
      setIsSavingName(false);
      setIsFinished(true);
    }
  };

  const handleSkipName = () => {
    if (!isSavingName) {
      analytics.track('newsletter_profile_skipped', getAnalyticsPayload());
      setIsFinished(true);
    }
  };

  const prefix = idPrefix || source;
  const firstNameId = `${prefix}-newsletter-firstname`;
  const emailId = `${prefix}-newsletter-email`;
  const policyId = `${prefix}-newsletter-policy`;
  const emailErrorId = `${emailId}-error`;
  const policyErrorId = `${policyId}-error`;

  const isBoxed = fieldStyle === 'boxed';

  const inputSizeClasses = `${
    inputSize === 'lg'
      ? isBoxed
        ? 'text-body-lg py-14'
        : 'text-body-lg pt-10 pb-20'
      : isBoxed
      ? 'text-body-sm py-10'
      : 'text-body-sm pt-8 pb-16'
  } flex-1 min-w-0 rounded-none bg-transparent px-0 text-foreground placeholder:text-foreground-muted/60 focus:outline-none disabled:opacity-50 transition-colors duration-(--duration-quick) ease-(--ease-expo-out)`;

  const inputBorderClasses = isBoxed
    ? errors.email
      ? 'border border-brand bg-surface px-16'
      : 'border border-foreground/25 bg-surface px-16 focus:border-foreground'
    : errors.email
    ? 'border-b border-brand'
    : 'border-b border-foreground/20 focus:border-foreground';

  return (
    <form
      ref={formRef}
      onSubmit={isSubscribed ? handleNameSubmit : handleSubmit}
      noValidate
      className={`flex flex-col gap-16 ${className}`}
    >
      {eyebrow || null}

      {isSubscribed ? (
        isFinished ? (
          successPanel || (
            <ConfirmInbox
              email={confirmedEmail}
              wantsPack={STARTER_PACK_SOURCES.has(source)}
              source={source || 'unknown'}
              onChangeAddress={() => {
                setEmail(confirmedEmail);
                setIsSubscribed(false);
                setIsFinished(false);
              }}
            />
          )
        ) : (
          <Fragment>
            <div className="flex flex-col gap-6">
              <p className="text-body-sm text-foreground">
                {STARTER_PACK_SOURCES.has(source)
                  ? 'Almost there - open the email from contact@drivexstore.shop and confirm. Your Starter Pack lands right after.'
                  : 'Almost there - open the email from contact@drivexstore.shop and click confirm.'}
              </p>
              <p className="text-body-sm text-foreground/70">
                One quick thing: what should we call you?
              </p>
            </div>

            <div className="relative flex flex-col">
              <label htmlFor={firstNameId} className="sr-only">
                First name
              </label>
              <input
                id={firstNameId}
                type="text"
                autoComplete="given-name"
                placeholder="First name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSavingName}
                autoFocus
                className={`${inputSizeClasses} border-b border-foreground/20 focus:border-foreground`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-16">
              <button
                type="button"
                onClick={handleSkipName}
                disabled={isSavingName}
                className="text-mono-sm text-foreground-muted transition-colors hover:text-foreground disabled:opacity-50"
              >
                Skip
              </button>
              <Button
                type="submit"
                theme="brand"
                size={buttonSize}
                loading={isSavingName}
                disabled={!firstName.trim()}
              >
                Save
              </Button>
            </div>
          </Fragment>
        )
      ) : (
        <Fragment>
          <div className="relative flex flex-col">
            <label
              htmlFor={emailId}
              className={isBoxed ? 'text-mono-sm mb-8 text-foreground' : 'sr-only'}
            >
              {isBoxed ? fieldLabel : 'Your email'}
            </label>
            {errors.email ? (
              <p
                id={emailErrorId}
                role="alert"
                className={
                  isBoxed
                    ? 'text-mono-sm order-last mt-6 text-brand'
                    : 'text-mono-sm absolute bottom-full left-0 right-0 mb-6 text-brand'
                }
              >
                {errors.email}
              </p>
            ) : null}
            <input
              ref={emailInputRef}
              id={emailId}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (!hasTrackedStartRef.current) {
                  hasTrackedStartRef.current = true;
                  analytics.track('newsletter_form_started', getAnalyticsPayload());
                }
                if (errors.email) {
                  setErrors(({ email: _, ...rest }) => rest);
                }
              }}
              disabled={isSubmitting}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? emailErrorId : undefined}
              className={`${inputSizeClasses} ${inputBorderClasses}`}
            />
          </div>

          <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
            <label htmlFor={`${prefix}-newsletter-website`}>Website</label>
            <input
              ref={websiteHoneypotRef}
              id={`${prefix}-newsletter-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="relative">
            <div
              className={
                compact
                  ? 'flex flex-col gap-12'
                  : 'flex flex-wrap items-start justify-between gap-16'
              }
            >
              {consent === 'notice' ? (
                <p className="text-mono-sm m-0 max-w-[36ch] self-center text-foreground-muted">
                  {consentCopy?.before || 'By signing up you agree to the'}{' '}
                  <NavLink href="/privacy" className="text-foreground">
                    {consentCopy?.link || 'privacy policy'}
                  </NavLink>
                  {consentCopy?.after || '.'}
                </p>
              ) : (
                <label
                  htmlFor={policyId}
                  className={`flex cursor-pointer items-center gap-8 self-start text-foreground-muted ${
                    compact ? 'text-body-sm' : 'text-mono-sm'
                  }`}
                >
                  <input
                    ref={policyInputRef}
                    id={policyId}
                    type="checkbox"
                    checked={acceptedPolicy}
                    onChange={(e) => {
                      setAcceptedPolicy(e.target.checked);
                      if (errors.policy && e.target.checked) {
                        setErrors(({ policy: _, ...rest }) => rest);
                      }
                    }}
                    disabled={isSubmitting}
                    aria-invalid={errors.policy ? 'true' : 'false'}
                    aria-describedby={errors.policy ? policyErrorId : undefined}
                    className={`size-18 cursor-pointer appearance-none bg-transparent transition-colors checked:border-brand checked:bg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 ${
                      errors.policy ? 'border border-brand' : 'border border-foreground/30'
                    }`}
                  />
                  <span className="inline-flex flex-wrap items-center gap-x-6">
                    <span>I agree to the</span>
                    <NavLink href="/privacy" className="text-foreground">
                      privacy policy
                    </NavLink>
                  </span>
                </label>
              )}

              <Button
                type="submit"
                theme="brand"
                size={buttonSize}
                loading={isSubmitting}
                className={buttonFullWidth ? 'w-full' : compact ? 'self-end' : undefined}
              >
                {buttonLabel}
              </Button>
            </div>

            {errors.policy ? (
              <p
                id={policyErrorId}
                role="alert"
                className="text-mono-sm absolute left-0 right-0 top-full mt-8 text-brand"
              >
                {errors.policy}
              </p>
            ) : null}
          </div>
        </Fragment>
      )}
    </form>
  );
}


// Read counterpart of markStarterPromptDismissed, safe for SSR and blocked storage
export function hasDismissedStarterPrompt() {
  if (typeof window === 'undefined') return false;
  try {
    return !!window.localStorage.getItem(STARTER_PROMPT_DISMISSED_KEY);
  } catch {
    return false;
  }
}
