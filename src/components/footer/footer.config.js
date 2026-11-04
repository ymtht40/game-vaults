import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682
import { XIcon } from '@/assets/icons/BoldIcons'; // NOTE: module id: 656049
import { LinkedInIcon } from '@/assets/icons'; // NOTE: module id: 564383
import { InstagramIcon } from '@/assets/icons'; // NOTE: module id: 775183
import { GitHubIcon } from '@/assets/icons'; // NOTE: module id: 260189

// Variable Mapping:
// k -> PLATFORM_LINKS
// j -> KITS_LINKS
// N -> SOCIAL_LINKS
// S -> LEGAL_LINKS

// NOTE: module id: 297428
export const PLATFORM_LINKS = {
  label: t('common.footer.columns.platform'),
  links: [
    {
      label: t('common.footer.platformLinks.howItWorks'),
      href: '/platform',
    },
    {
      label: t('common.footer.platformLinks.documentation'),
      href: '/docs',
    },
    {
      label: t('common.footer.platformLinks.mcpServer'),
      href: '/docs/guides/mcp',
    },
    {
      label: t('common.footer.platformLinks.learnGsap'),
      href: '/learn',
    },
    {
      label: t('common.footer.platformLinks.freeTools'),
      href: '/tools',
    },
    {
      label: t('common.footer.platformLinks.compare'),
      href: '/compare',
    },
    {
      label: t('common.footer.platformLinks.stateOfWebAnimation'),
      href: '/state-of-web-animation',
    },
    {
      label: t('common.footer.platformLinks.changelog'),
      href: '/changelog',
    },
    {
      label: t('common.footer.platformLinks.roadmap'),
      href: '/roadmap',
    },
    {
      label: t('common.footer.platformLinks.pricing'),
      href: '/pricing',
    },
    {
      label: t('common.footer.platformLinks.faqs'),
      href: '/faq',
    },
    {
      label: t('common.footer.platformLinks.affiliates'),
      href: '/affiliate',
    },
  ],
};

// NOTE: module id: 297428
export const KITS_LINKS = {
  label: t('common.footer.columns.kits'),
  links: [
    {
      label: t('common.footer.kitsLinks.seeTheKits'),
      href: '/kits',
    },
    {
      label: t('common.footer.kitsLinks.whatAKitIs'),
      href: '/kits',
    },
    {
      label: t('common.footer.kitsLinks.kitVsLibrary'),
      href: '/kits',
    },
  ],
};

// NOTE: module id: 297428
export const SOCIAL_LINKS = [
  {
    label: 'X',
    href: 'https://x.com/juli_fella',
    Icon: XIcon,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/julianfella/',
    Icon: LinkedInIcon,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/goodfelladesign/',
    Icon: InstagramIcon,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/GoodFellaStudio',
    Icon: GitHubIcon,
  },
];

// NOTE: module id: 297428
export const LEGAL_LINKS = [
  {
    label: t('common.footer.legalLinks.privacy'),
    href: '/privacy',
  },
  {
    label: t('common.footer.legalLinks.terms'),
    href: '/terms',
  },
  {
    label: t('common.footer.legalLinks.cookies'),
    href: '/cookies',
  },
  {
    label: t('common.footer.legalLinks.refund'),
    href: '/refund',
  },
];
