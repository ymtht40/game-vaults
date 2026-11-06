'use client';

import React from 'react';
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { SentNotice } from '@/features/common/LibraryShowcaseLayout'; // NOTE: module id: 430550
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348

const SENDER_EMAIL = 'contact@drivexstore.shop';

// NOTE: module id: 987025
export function inboxFor(email) {
  const domain = String(email || '').split('@')[1]?.toLowerCase() || '';

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return {
      provider: 'gmail',
      label: 'Open Gmail',
      href: `https://mail.google.com/mail/u/0/#search/from%3A${encodeURIComponent(SENDER_EMAIL)}+in%3Aanywhere`,
    };
  }

  if (/^(outlook|hotmail|live|msn)\.[a-z.]+$/.test(domain)) {
    return {
      provider: 'outlook',
      label: 'Open Outlook',
      href: 'https://outlook.live.com/mail/0/',
    };
  }

  if (/^(icloud|me|mac)\.com$/.test(domain)) {
    return {
      provider: 'icloud',
      label: 'Open iCloud Mail',
      href: 'https://www.icloud.com/mail/',
    };
  }

  if (/^(yahoo|ymail)\.[a-z.]+$/.test(domain)) {
    return {
      provider: 'yahoo',
      label: 'Open Yahoo Mail',
      href: 'https://mail.yahoo.com/',
    };
  }

  return null;
}

export default function ConfirmInbox({
  email,
  wantsPack = false,
  source = 'unknown',
  onChangeAddress = null,
}) {
  const inbox = inboxFor(email);

  return (
    <div className="flex flex-col gap-12">
      <p className="text-body-sm text-foreground">
        One last step. Open the email from {SENDER_EMAIL} and click confirm.
        {wantsPack ? ' Your Starter Pack lands right after.' : ''}
      </p>

      <SentNotice
        to={email}
        subject={wantsPack ? 'Confirm and grab your Starter Pack' : 'Confirm your GameVault subscription'}
      />

      <div className="flex flex-wrap items-center justify-between gap-12">
        {inbox ? (
          <Button
            href={inbox.href}
            target="_blank"
            rel="noopener noreferrer"
            theme="brand"
            size="sm"
            onClick={() =>
              analytics.track('confirm_inbox_opened', {
                source,
                provider: inbox.provider,
              })
            }
          >
            {inbox.label}
          </Button>
        ) : (
          <span />
        )}

        {onChangeAddress ? (
          <button
            type="button"
            onClick={onChangeAddress}
            className="text-body-sm text-foreground-muted underline underline-offset-4 transition-colors duration-(--duration-quick) hover:text-foreground"
          >
            Wrong address?
          </button>
        ) : null}
      </div>
    </div>
  );
}

