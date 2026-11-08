import {
  LegalDocument,
  LegalSection,
  LegalP,
  LegalLink,
} from '@/features/legal/LegalDocument';
import { LEGAL } from '@/libs/config/legal';

export const metadata = {
  title: 'Legal Notice',
  description: `Company details for ${LEGAL.productName}.`,
};

// EXAMPLE CONTENT: fill the values in src/libs/config/legal.js.
export default function LegalNoticePage() {
  return (
    <LegalDocument
      title="Legal Notice"
      intro={`Company details for ${LEGAL.productName}.`}
      lastUpdated={LEGAL.lastUpdated}
    >
      <LegalSection id="operator" title="Operator">
        <LegalP>
          <strong>{LEGAL.companyName}</strong>
          <br />
          {LEGAL.companyAddress}
        </LegalP>
        <LegalP>{LEGAL.registerInfo}</LegalP>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <LegalP>
          Email:{' '}
          <LegalLink href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</LegalLink>
          <br />
          Website: <LegalLink href={LEGAL.siteUrl}>{LEGAL.siteUrl}</LegalLink>
        </LegalP>
      </LegalSection>
    </LegalDocument>
  );
}
