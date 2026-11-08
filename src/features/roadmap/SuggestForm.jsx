'use client';

// Variable Mapping: L -> SuggestForm, e -> open, a -> isAuthenticated, n -> onSuccess, s -> idea, l -> setIdea, o -> referenceUrl, d -> setReferenceUrl, c -> email, h -> setEmail, g -> website, m -> setWebsite, f -> errors, p -> setErrors, x -> isSubmitting, b -> setIsSubmitting, v -> isSubmitted, j -> setIsSubmitted, w -> ideaInputRef, N -> handleSubmit

import { useEffect, useRef, useState } from 'react';
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348 // UNRESOLVED: name guessed from usage
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { toast } from 'sonner'; // NOTE: module id: 846696
import { SuggestFormField } from '@/features/roadmap/SuggestFormField'; // NOTE: module id: 626171

// NOTE: module id: 626171
export function SuggestForm({ open, isAuthenticated, onSuccess }) {
  const [idea, setIdea] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const ideaInputRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || isSubmitted) return;

    const validationErrors = (function ({ idea: ideaVal, email: emailVal }) {
      const nextErrors = {};
      if (ideaVal.trim()) {
        if (ideaVal.trim().length > 500) {
          nextErrors.idea = 'Keep it under 500 characters.';
        }
      } else {
        nextErrors.idea = 'Tell us the idea.';
      }
      if (emailVal.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal.trim())) {
        nextErrors.email = 'That email looks off.';
      }
      return nextErrors;
    })({ idea, email });

    setErrors(validationErrors);
    if (validationErrors.idea) {
      ideaInputRef.current?.focus();
      return;
    }

    if (!validationErrors.email) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/roadmap/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idea,
            referenceUrl,
            email,
            website,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw Error(payload?.error || `HTTP ${response.status}`);
        }

        const payload = await response.json().catch(() => ({}));
        analytics.features.submitted(payload?.id || null, idea.trim().slice(0, 80), 'suggestion');
        setIsSubmitted(true);
        setIdea('');
        setReferenceUrl('');
        setEmail('');
        toast('Suggestion received. Thanks.');
        onSuccess?.();
      } catch (error) {
        console.error('[SuggestForm] submit failed:', error);
        toast(error.message || 'Could not send. Try again in a moment.');
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  useEffect(() => {
    if (open) {
      setErrors({});
    } else {
      setIsSubmitted(false);
    }
  }, [open]);

  return (
    <form
      noValidate={true}
      onSubmit={handleSubmit}
      className="mt-24 flex flex-col gap-24"
      aria-label="Suggest a component"
    >
      <SuggestFormField
        id="suggest-idea"
        label="Your idea"
        error={errors.idea}
        required={true}
        counter={`${idea.length} / 500`}
        counterWarn={idea.length > 450}
      >
        <textarea
          id="suggest-idea"
          ref={ideaInputRef}
          value={idea}
          onChange={(event) => {
            setIdea(event.target.value);
            if (errors.idea) {
              setErrors((prev) => ({ ...prev, idea: undefined }));
            }
          }}
          rows={3}
          maxLength={500}
          placeholder="A magnetic cursor that snaps to focusable elements..."
          aria-invalid={!!errors.idea}
          aria-describedby={errors.idea ? 'suggest-idea-error' : undefined}
          className={cn(
            'w-full resize-none bg-transparent border-b px-0 py-12 text-body text-foreground placeholder:text-foreground/30 focus:outline-none transition-colors duration-(--duration-quick) ease-(--ease-expo-out)',
            errors.idea ? 'border-brand' : 'border-foreground/20 focus:border-foreground/55'
          )}
        />
      </SuggestFormField>

      <SuggestFormField id="suggest-ref" label="Reference link (optional)">
        <input
          id="suggest-ref"
          type="url"
          value={referenceUrl}
          onChange={(event) => setReferenceUrl(event.target.value)}
          maxLength={500}
          placeholder="https://"
          className="w-full bg-transparent border-b border-foreground/20 px-0 py-12 text-body text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground/55 transition-colors duration-(--duration-quick) ease-(--ease-expo-out)"
        />
      </SuggestFormField>

      {!isAuthenticated && (
        <SuggestFormField
          id="suggest-email"
          label="Email (optional, so we can reply)"
          error={errors.email}
        >
          <input
            id="suggest-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            maxLength={200}
            placeholder="you@studio.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'suggest-email-error' : undefined}
            className={cn(
              'w-full bg-transparent border-b px-0 py-12 text-body text-foreground placeholder:text-foreground/30 focus:outline-none transition-colors duration-(--duration-quick) ease-(--ease-expo-out)',
              errors.email ? 'border-brand' : 'border-foreground/20 focus:border-foreground/55'
            )}
          />
        </SuggestFormField>
      )}

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="suggest-website">Website</label>
        <input
          id="suggest-website"
          type="text"
          name="website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-24 gap-y-12">
        <Button
          type="submit"
          theme="brand"
          size="sm"
          loading={isSubmitting}
          disabled={isSubmitted}
        >
          {isSubmitted ? 'Sent' : 'Send suggestion'}
        </Button>
      </div>
    </form>
  );
}
