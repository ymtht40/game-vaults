'use client';

// Variable Mapping: a -> DEFAULT_STORAGE_KEY, l -> isRecentlyDismissed, u -> shouldSuppressModal, e -> isAuthenticated, o -> source, c -> delayMs, d -> storageKey, h -> eyebrow, f -> title, p -> description, m -> buttonLabel, C -> isOpen, g -> setIsOpen, v -> timerRef

import { useEffect, useRef, useState } from 'react'; // NOTE: module id: 271645
import {
  STARTER_PROMPT_DISMISSED_KEY,
  markStarterPromptDismissed,
} from '@/features/newsletter/NewsletterForm'; // NOTE: module id: 927627
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/Dialog'; // NOTE: module id: 753145
import { CloseIcon } from '@/assets/icons'; // NOTE: module id: 137410
import NewsletterForm from '@/features/newsletter/NewsletterForm'; // NOTE: module id: 42242

const DEFAULT_STORAGE_KEY = STARTER_PROMPT_DISMISSED_KEY;

function isRecentlyDismissed(key) {
  try {
    const rawTimestamp = window.localStorage.getItem(key);
    if (!rawTimestamp) return false;
    const timestamp = parseInt(rawTimestamp, 10);
    if (Number.isNaN(timestamp)) return false;
    return Date.now() - timestamp < 2592000000;
  } catch {
    return false;
  }
}

function shouldSuppressModal(storageKey) {
  return (
    isRecentlyDismissed(DEFAULT_STORAGE_KEY) ||
    isRecentlyDismissed(storageKey) ||
    !!markStarterPromptDismissed()
  );
}

// NOTE: module id: 573564
export function StarterPackModal({
  isAuthenticated = false,
  source = 'animations-detail',
  idPrefix = 'animations-detail',
  delayMs = 30000,
  storageKey = DEFAULT_STORAGE_KEY,
  eyebrow = 'Free starter pack',
  title = 'Get the Starter Pack: free components, on the house.',
  description = 'Production-grade GSAP for React, Vue, and HTML/CSS/JS. A new free component every week. No attribution, no expiration. Delivered to your inbox the moment you subscribe.',
  buttonLabel = 'Send it to me',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated || shouldSuppressModal(storageKey)) return;

    const checkAndOpen = () => {
      if (!shouldSuppressModal(storageKey)) {
        const isStarterPackBandVisible = (() => {
          const bandEl = document.querySelector('[data-starter-pack-band]');
          if (!bandEl) return false;
          const rect = bandEl.getBoundingClientRect();
          return rect.bottom > 0 && rect.top < window.innerHeight;
        })();

        if (isStarterPackBandVisible) {
          timerRef.current = window.setTimeout(checkAndOpen, 15000);
          return;
        }

        setIsOpen(true);
      }
    };

    timerRef.current = window.setTimeout(checkAndOpen, delayMs);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isAuthenticated, delayMs, storageKey]);

  if (isAuthenticated) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        setIsOpen(nextOpen);
        if (!nextOpen) {
          ((key) => {
            try {
              const now = String(Date.now());
              window.localStorage.setItem(DEFAULT_STORAGE_KEY, now);
              if (key !== DEFAULT_STORAGE_KEY) {
                window.localStorage.setItem(key, now);
              }
            } catch {}
          })(storageKey);
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
          <CloseIcon className="size-18 transition-transform duration-(--duration-quick) ease-(--ease-back-out) group-hover/close:rotate-90" />
        </DialogClose>
        <div className="flex flex-col gap-12 pr-48">
          <p className="text-mono-sm text-foreground/55">{eyebrow}</p>
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

export default StarterPackModal;