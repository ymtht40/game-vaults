'use client';

import { useEffect, useRef, useState } from 'react';

import {
  STARTER_PROMPT_DISMISSED_KEY,
} from '@/features/newsletter/NewsletterForm';

import { X } from '@phosphor-icons/react'; // module id: 137410
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'; // module id: 753145
import NewsletterForm from '@/features/newsletter/NewsletterForm'; // module id: 42242

const DISMISSAL_TTL_MS = 2_592_000_000;

function hasRecentDismissal(storageKey) {
  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return false;
    }

    const dismissedAt = Number(storedValue);

    if (!Number.isFinite(dismissedAt) || dismissedAt <= 0) {
      return false;
    }

    const elapsed = Date.now() - dismissedAt;
    return elapsed >= 0 && elapsed < DISMISSAL_TTL_MS;
  } catch {
    return false;
  }
}

function shouldSuppressPopup(storageKey) {
  return (
    hasRecentDismissal(STARTER_PROMPT_DISMISSED_KEY)
    || hasRecentDismissal(storageKey)
  );
}

function isStarterPackBandVisible() {
  const band = document.querySelector('[data-starter-pack-band]');

  if (!band) {
    return false;
  }

  const bounds = band.getBoundingClientRect();

  return bounds.bottom > 0 && bounds.top < window.innerHeight;
}

function markPopupDismissed(storageKey) {
  try {
    const timestamp = String(Date.now());

    window.localStorage.setItem(
      STARTER_PROMPT_DISMISSED_KEY,
      timestamp,
    );

    if (storageKey !== STARTER_PROMPT_DISMISSED_KEY) {
      window.localStorage.setItem(storageKey, timestamp);
    }
  } catch {}
}

export default function StarterPackPopup({
  isAuthenticated = false,
  source = 'animations-detail',
  idPrefix = 'animations-detail',
  delayMs = 30000,
  storageKey = STARTER_PROMPT_DISMISSED_KEY,
  eyebrow = 'Free starter pack',
  title = 'Get the Starter Pack: free components, on the house.',
  description = 'Production-grade GSAP for React, Vue, and HTML/CSS/JS. A new free component every week. No attribution, no expiration. Delivered to your inbox the moment you subscribe.',
  buttonLabel = 'Send it to me',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated || shouldSuppressPopup(storageKey)) {
      setIsOpen(false);
      return;
    }

    const attemptOpen = () => {
      if (shouldSuppressPopup(storageKey)) {
        return;
      }

      if (isStarterPackBandVisible()) {
        timeoutRef.current = window.setTimeout(attemptOpen, 15000);
        return;
      }

      setIsOpen(true);
    };

    timeoutRef.current = window.setTimeout(attemptOpen, delayMs);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, delayMs, storageKey]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);

        if (!open) {
          markPopupDismissed(storageKey);
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="!rounded-none !border-foreground/15 !bg-background !p-32 sm:!max-w-[560px] lg:!p-40 max-h-[90vh] overflow-y-auto"
      >
        <DialogClose
          aria-label="Close"
          className="group/close absolute right-16 top-16 inline-flex size-40 items-center justify-center border border-foreground/15 bg-background text-foreground/70 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:border-foreground/40 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          <X className="size-18 transition-transform duration-(--duration-quick) ease-(--ease-back-out) group-hover/close:rotate-90" />
        </DialogClose>

        <div className="flex flex-col gap-12 pr-48">
          <p className="text-mono-sm text-foreground/55">
            {eyebrow}
          </p>

          <DialogTitle className="h3 font-medium leading-tight text-foreground">
            {title}
          </DialogTitle>

          <DialogDescription className="text-body text-foreground-muted">
            {description}
          </DialogDescription>
        </div>

        <div className="mt-24 lg:mt-32">
          <NewsletterForm
            source={source}
            idPrefix={idPrefix}
            buttonLabel={buttonLabel}
            buttonSize="sm"
            inputSize="lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}