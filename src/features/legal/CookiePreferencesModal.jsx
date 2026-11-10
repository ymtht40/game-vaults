'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // NOTE: module id: 522016
import { XIcon } from '@phosphor-icons/react'; // NOTE: module id: 137410
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from '@/components/ui/Dialog'; // NOTE: module id: 753145
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { Switch } from '@/components/ui/Switch'; // NOTE: module id: 870777
import { getConsentState, saveConsent, defaultConsent, notifyConsentChange } from '@/libs/config/consent'; // NOTE: module id: 160725

const COOKIE_CATEGORIES = [
  {
    id: 'essential',
    name: 'Essential',
    description: 'Authentication, payments, and your own preferences. Always on.',
    cookies: 'Supabase Auth · Stripe · gamevault_consent',
    required: true,
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Off: anonymous pageviews only (no cookies, no recording). On: persistent visitor ID, session recording with inputs masked, click and form capture.',
    cookies: 'PostHog (US)',
    required: false,
  },
  {
    id: 'functional',
    name: 'Functional',
    description: 'Live chat support so you can ask a question without leaving the page.',
    cookies: 'Crisp',
    required: false,
  },
];

// NOTE: module id: 42223
export function CookiePreferencesModal({ open, onOpenChange }) {
  const [preferences, setPreferences] = useState(() => getConsentState() || defaultConsent); // NOTE: module id: 160725

  useEffect(() => {
    if (open) {
      setPreferences(getConsentState() || defaultConsent); // NOTE: module id: 160725
    }
  }, [open]);

  const handleSave = (values) => {
    saveConsent({ ...values, essential: true, method: 'explicit' }); // NOTE: module id: 160725
    notifyConsentChange(); // NOTE: module id: 160725
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!rounded-none !border-foreground/15 !bg-background !p-32 sm:!max-w-[560px] lg:!p-40"
      >
        <DialogClose
          aria-label="Close"
          className="group/close absolute right-16 top-16 inline-flex size-40 items-center justify-center border border-foreground/15 text-foreground/70 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:border-foreground/40 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          <XIcon className="size-18 transition-transform duration-(--duration-quick) ease-(--ease-back-out) group-hover/close:rotate-90" />
        </DialogClose>

        <div className="flex flex-col gap-12">
          <p className="text-mono-sm text-foreground/55">Cookie preferences</p>
          <DialogTitle className="text-h3 font-medium leading-tight text-foreground">
            What you let us store.
          </DialogTitle>
          <DialogDescription className="text-body text-foreground-muted">
            Nothing non-essential is stored on your device until you toggle it on here. Read the{' '}
            <Link
              href="/cookies"
              className="underline decoration-foreground/30 underline-offset-4 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:decoration-foreground hover:text-foreground"
            >
              cookie policy
            </Link>{' '}
            for the full breakdown.
          </DialogDescription>
        </div>

        <ul className="mt-24 flex flex-col divide-y divide-foreground/10 border-y border-foreground/10">
          {COOKIE_CATEGORIES.map((category) => (
            <li key={category.id} className="flex items-start gap-24 py-20">
              <div className="flex flex-1 flex-col gap-6">
                <div className="flex items-baseline gap-12">
                  <span className="text-accent-xs text-foreground">{category.name}</span>
                  {category.required && (
                    <span className="text-accent-xs text-foreground/45">Required</span>
                  )}
                </div>
                <p className="text-body-sm text-foreground-muted">{category.description}</p>
                <p className="text-accent-xs text-foreground/45">{category.cookies}</p>
              </div>
              <Switch
                checked={Boolean(preferences[category.id])}
                disabled={category.required}
                onChange={(checked) => {
                  setPreferences((prev) => ({ ...prev, [category.id]: checked }));
                }}
                label={`Toggle ${category.name}`}
              />
            </li>
          ))}
        </ul>

        <div className="mt-24 flex flex-col gap-8">
          <div className="flex gap-8">
            <Button
              type="button"
              theme="light"
              size="xs"
              onClick={() => handleSave({ essential: true, analytics: true, functional: true, marketing: false })}
              className="flex-1"
            >
              Accept all
            </Button>
            <Button
              type="button"
              theme="surface"
              size="xs"
              onClick={() => handleSave({ essential: true, analytics: false, functional: false, marketing: false })}
              className="flex-1"
            >
              Decline all
            </Button>
          </div>
          <Button
            type="button"
            theme="brand"
            size="xs"
            onClick={() => handleSave(preferences)}
            className="w-full"
          >
            Save preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

