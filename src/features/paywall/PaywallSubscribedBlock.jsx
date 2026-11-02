'use client';

// Variable Mapping: s -> PaywallSubscribedBlock, l -> OnTheListBadge, e -> title, r -> isInStarterPack, o -> count, c -> checkoutBlock, d -> onResend, u -> status, m -> setStatus, f -> handleResend

import { useState } from 'react';
import { toast } from 'sonner'; // NOTE: module id: 846696
import { Check } from '@phosphor-icons/react'; // NOTE: module id: 499839
import { FreeBadge, PaywallQuote } from '@/features/paywall/PaywallBlock'; // NOTE: module id: 993603

// NOTE: module id: 928862
export default function PaywallSubscribedBlock({
  title = 'this component',
  isInStarterPack = false,
  count = '100+',
  checkoutBlock = null,
  onResend = null
}) {
  const [status, setStatus] = useState('idle');

  async function handleResend() {
    setStatus('loading');
    try {
      const response = onResend
        ? await onResend()
        : await fetch('/api/starter-pack/resend', {
            method: 'POST'
          }).then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw Error(data.error || 'Could not resend');
            return data;
          });
      toast.success(response?.message || 'Sent.');
      setStatus('done');
    } catch (error) {
      toast.error(
        error.message || 'Could not resend. Reply to any of our emails and we sort it.'
      );
      setStatus('idle');
    }
  }

  return (
    <div className="flex w-full max-w-[26rem] flex-col gap-20">
      <div className="flex flex-col items-center gap-10 text-center">
        {isInStarterPack ? <FreeBadge /> : <OnTheListBadge />}
        <p className="text-body font-medium text-foreground">
          {isInStarterPack
            ? `${title} is already yours.`
            : `The full code for ${title} is locked.`}
        </p>
        <p className="text-body-sm text-foreground-muted">
          {isInStarterPack
            ? `It came with your Starter Pack, in React, Vue and HTML. The other ${count} components come with the library.`
            : `You already get every free drop by email. This one and the other ${count} come with the library.`}
        </p>
      </div>
      {checkoutBlock && (
        <div className="flex flex-col items-center gap-10">
          {checkoutBlock}
          <PaywallQuote />
        </div>
      )}
      {isInStarterPack && (
        <p className="text-body-sm text-center text-foreground-muted">
          {status === 'done' ? (
            'Sent, check your inbox.'
          ) : (
            <>
              Can&apos;t find the pack?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={status === 'loading'}
                className="text-foreground underline underline-offset-4 transition-opacity duration-(--duration-quick) disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending' : 'Resend it'}
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}

function OnTheListBadge() {
  return (
    <span className="text-accent-xs inline-flex h-24 items-center gap-6 border border-foreground/15 bg-background px-8 text-foreground-muted">
      <Check size={12} />
      On the list
    </span>
  );
}

