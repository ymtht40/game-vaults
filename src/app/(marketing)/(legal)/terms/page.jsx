import {
  LegalDocument,
  LegalSection,
  LegalP,
  LegalList,
  LegalLink,
} from '@/features/legal/LegalDocument';
import { LEGAL } from '@/libs/config/legal';

export const metadata = {
  title: 'Terms of Service',
  description: `The terms that apply when you use ${LEGAL.productName}.`,
};

// EXAMPLE CONTENT: replace with text reviewed for your own business and jurisdiction.
export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      intro={`The terms that apply when you use ${LEGAL.productName}, operated by ${LEGAL.companyName}.`}
      lastUpdated={LEGAL.lastUpdated}
    >
      <LegalSection id="agreement" title="Agreement">
        <LegalP>
          By creating an account or using {LEGAL.productName} you agree to these
          terms and to our <LegalLink href="/privacy">Privacy Policy</LegalLink>.
          If you do not agree, do not use the service.
        </LegalP>
      </LegalSection>

      <LegalSection id="your-account" title="Your account">
        <LegalList
          items={[
            'You must give accurate information and keep your sign-in details safe.',
            'You are responsible for activity under your account.',
            'One account per person. Do not share paid access.',
          ]}
        />
      </LegalSection>

      <LegalSection id="license" title="License to use components">
        <LegalP>
          With an active paid plan you receive a non-exclusive, non-transferable
          license to use the components in projects you build for yourself or your
          clients. You may not resell, redistribute or republish the components or
          the library itself, alone or as part of a competing product.
        </LegalP>
      </LegalSection>

      <LegalSection id="payments" title="Payments and renewals">
        <LegalP>
          Paid plans are billed through Stripe at the price shown at checkout.
          Subscriptions renew automatically until cancelled. Refunds are covered
          in the <LegalLink href="/refund">Refund Policy</LegalLink>.
        </LegalP>
      </LegalSection>

      <LegalSection id="acceptable-use" title="Acceptable use">
        <LegalList
          items={[
            'No scraping, bulk downloading or attempts to bypass paywalls.',
            'No unlawful, abusive or infringing use of the service.',
            'No interfering with the security or availability of the service.',
          ]}
        />
      </LegalSection>

      <LegalSection id="liability" title="Liability">
        <LegalP>
          The service is provided “as is”. To the extent allowed by law, our
          total liability is limited to the amount you paid in the 12 months
          before the claim. These terms are governed by the law of{' '}
          {LEGAL.governingLaw}.
        </LegalP>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <LegalP>
          Questions about these terms:{' '}
          <LegalLink href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</LegalLink>.
        </LegalP>
      </LegalSection>
    </LegalDocument>
  );
}
