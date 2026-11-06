import {
  LegalDocument,
  LegalSection,
  LegalP,
  LegalList,
  LegalLink,
} from '@/features/legal/LegalDocument';
import { LEGAL } from '@/libs/config/legal';

export const metadata = {
  title: 'Cookie Policy',
  description: `What ${LEGAL.productName} stores on your device and how to control it.`,
};

// EXAMPLE CONTENT: list your real cookie names and lifetimes before publishing.
export default function CookiesPage() {
  return (
    <LegalDocument
      title="Cookie Policy"
      intro={`What ${LEGAL.productName} stores on your device and how to control it.`}
      lastUpdated={LEGAL.lastUpdated}
    >
      <LegalSection id="what-are-cookies" title="What cookies are">
        <LegalP>
          Cookies and similar storage (such as localStorage) are small pieces of
          data a website saves in your browser. We use them to keep you signed in,
          remember your choices and, with your consent, understand how the site is
          used.
        </LegalP>
      </LegalSection>

      <LegalSection id="strictly-necessary" title="Strictly necessary">
        <LegalP>These are needed for the site to work and are always on:</LegalP>
        <LegalList
          items={[
            'Authentication session (Supabase): keeps you signed in. [cookie name, lifetime]',
            'Cookie preference: remembers your consent choice. [cookie name, lifetime]',
            'Theme: remembers light/dark mode in localStorage.',
          ]}
        />
      </LegalSection>

      <LegalSection id="analytics" title="Analytics">
        <LegalP>
          Set only if you accept. We use PostHog to see which pages and components
          are used so we can improve the product. [cookie names, lifetime]
        </LegalP>
      </LegalSection>

      <LegalSection id="affiliate" title="Affiliate attribution">
        <LegalP>
          If you arrive through an affiliate link, we may store a referral
          identifier for [number] days so the referrer can be credited.
        </LegalP>
      </LegalSection>

      <LegalSection id="your-choices" title="Your choices">
        <LegalP>
          You can change your consent at any time from the cookie settings in the
          footer, or delete cookies in your browser settings. More about how we
          handle data is in the <LegalLink href="/privacy">Privacy Policy</LegalLink>.
        </LegalP>
      </LegalSection>
    </LegalDocument>
  );
}
