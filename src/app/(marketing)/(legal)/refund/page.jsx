import {
  LegalDocument,
  LegalSection,
  LegalP,
  LegalList,
  LegalLink,
} from '@/features/legal/LegalDocument';
import { LEGAL } from '@/libs/config/legal';

export const metadata = {
  title: 'Refund Policy',
  description: `When and how you can get a refund for ${LEGAL.productName}.`,
};

// EXAMPLE CONTENT: replace with your real refund terms.
export default function RefundPage() {
  return (
    <LegalDocument
      title="Refund Policy"
      intro={`When and how you can get a refund for ${LEGAL.productName}.`}
      lastUpdated={LEGAL.lastUpdated}
    >
      <LegalSection id="refund-window" title="Refund window">
        <LegalP>
          If you are not satisfied, ask for a refund within {LEGAL.refundWindowDays}{' '}
          days of your first payment and we will return the full amount.
        </LegalP>
      </LegalSection>

      <LegalSection id="renewals" title="Renewals">
        <LegalP>
          Renewal payments are not refundable once the new period has started.
          Cancel before the renewal date from your account to avoid being charged.
        </LegalP>
      </LegalSection>

      <LegalSection id="exceptions" title="Exceptions">
        <LegalList
          items={[
            'Accounts closed for breaching the Terms of Service.',
            'Requests made after the refund window.',
          ]}
        />
      </LegalSection>

      <LegalSection id="how-to-request" title="How to request a refund">
        <LegalP>
          Email{' '}
          <LegalLink href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</LegalLink>{' '}
          from your account email address. Refunds go back to the original payment
          method and usually arrive within 5 to 10 business days.
        </LegalP>
      </LegalSection>
    </LegalDocument>
  );
}
