import {
  LegalDocument,
  LegalSection,
  LegalSubsection,
  LegalP,
  LegalList,
  LegalLink,
} from '@/features/legal/LegalDocument';
import { LEGAL } from '@/libs/config/legal';

export const metadata = {
  title: 'Privacy Policy',
  description: `How ${LEGAL.companyName} collects, uses, shares and protects personal data when you use ${LEGAL.productName}.`,
};

// EXAMPLE CONTENT: replace with text reviewed for your own business and jurisdiction.
export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      intro={`How ${LEGAL.companyName} collects, uses, shares and protects personal data when you use ${LEGAL.productName}.`}
      lastUpdated={LEGAL.lastUpdated}
    >
      <LegalSection id="who-we-are" title="Who we are">
        <LegalP>
          The controller of your personal data is <strong>{LEGAL.companyName}</strong>,
          the company operating {LEGAL.productName}. Our registered details are in
          the <LegalLink href="/legal-notice">Legal Notice</LegalLink>.
        </LegalP>
        <LegalP>
          For all privacy matters, contact{' '}
          <LegalLink href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</LegalLink>.
        </LegalP>
      </LegalSection>

      <LegalSection id="personal-data-we-collect" title="Personal data we collect">
        <LegalSubsection id="data-you-give-us" title="Data you give us">
          <LegalList
            items={[
              'Account: email address (required for sign-in), name (optional), preferred framework (React / Vue / HTML).',
              'Billing: payments are processed by Stripe. We receive a Stripe customer ID, the plan you bought, the last 4 digits of the card and the billing country. We never see your full card number.',
              'Support: when you email us, we keep your message and our reply.',
              'Newsletter: if you subscribe, your email address, signup time and the consent text you saw.',
            ]}
          />
        </LegalSubsection>
        <LegalSubsection id="data-we-collect-automatically" title="Data we collect automatically">
          <LegalList
            items={[
              'Usage analytics (only after you accept analytics cookies): pages viewed, components previewed or saved, and approximate country.',
              'Technical data: IP address, browser type and error logs, used to keep the service secure and working.',
            ]}
          />
        </LegalSubsection>
      </LegalSection>

      <LegalSection id="how-we-use-data" title="How we use your data">
        <LegalList
          items={[
            'To provide your account, saved components and paid access (performance of a contract).',
            'To send receipts and service emails (performance of a contract).',
            'To send marketing emails you asked for (consent, withdrawable at any time).',
            'To measure and improve the product (consent, for analytics cookies).',
            'To prevent abuse and keep the service secure (legitimate interest).',
          ]}
        />
      </LegalSection>

      <LegalSection id="who-we-share-with" title="Who we share data with">
        <LegalP>
          We use a small number of service providers (processors) that handle data
          only on our instructions:
        </LegalP>
        <LegalList
          items={[
            'Supabase: authentication and database.',
            'Stripe: payments and invoicing.',
            'Resend: transactional and newsletter email.',
            'PostHog: product analytics (only with your consent).',
            'Vercel: hosting.',
          ]}
        />
        <LegalP>We do not sell your personal data.</LegalP>
      </LegalSection>

      <LegalSection id="retention" title="How long we keep data">
        <LegalP>
          We keep account data while your account is active. Billing records are
          kept as long as tax law requires. Support emails are deleted after
          [retention period]. You can ask us to delete your account at any time.
        </LegalP>
      </LegalSection>

      <LegalSection id="your-rights" title="Your rights">
        <LegalP>
          Depending on where you live, you can ask us to access, correct, delete,
          export or restrict the use of your data, and to object to processing or
          withdraw consent. Email{' '}
          <LegalLink href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</LegalLink>{' '}
          and we will reply within one month. You can also complain to your local
          data protection authority.
        </LegalP>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies">
        <LegalP>
          What we store on your device, and how to change your choice, is
          explained in the <LegalLink href="/cookies">Cookie Policy</LegalLink>.
        </LegalP>
      </LegalSection>

      <LegalSection id="changes" title="Changes to this policy">
        <LegalP>
          If we make material changes we will update the date above and, where
          required, tell you by email or in the product.
        </LegalP>
      </LegalSection>
    </LegalDocument>
  );
}
