import Provider from '@/app/provider';
import localFont from 'next/font/local';
import Script from 'next/script';
import { getLatestAnimation, getCategories } from '@/libs/supabase/latestAnimation';
import '@/styles/style.css';

export const metadata = {
  metadataBase: new URL("https://app.drivexstore.shop"),
  title: {
    default: "DriveX Gaming | Your Trusted MLBB & Game Accounts Marketplace",
    template: "%s | DriveX Gaming",
  },
  description:
    "Your Trusted MLBB Marketplace. Safe, fast, and verified Mobile Legends & game account trades with high quality accounts and lifetime warranty.",
  keywords: [
    "DriveX Gaming",
    "DriveX Store",
    "MLBB Accounts",
    "Mobile Legends Account",
    "Game Accounts",
    "Buy MLBB Account",
    "MLBB Marketplace",
  ],
  authors: [{ name: "DriveX Gaming" }],
  creator: "DriveX Gaming",
  openGraph: {
    title: "DriveX Gaming | Your Trusted MLBB & Game Accounts Marketplace",
    description:
      "Safe, fast, and verified MLBB & game account trades. High quality accounts with lifetime warranty at DriveX Store.",
    url: "https://app.drivexstore.shop",
    siteName: "DriveX Gaming",
    images: [
      {
        url: "/imgs/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DriveX Gaming - Your Trusted MLBB Marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DriveX Gaming | Your Trusted MLBB & Game Accounts Marketplace",
    description:
      "Safe, fast, and verified MLBB & game account trades. High quality accounts with lifetime warranty at DriveX Store.",
    images: ["/imgs/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const geistSans = localFont({
  src: '../../public/fonts/Geist-Variable.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: '../../public/fonts/GeistMono-Variable.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
  preload: false,
});

const aktivGrotesk = localFont({
  src: [
    { path: '../../public/fonts/AktivGroteskCorp-Light.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/AktivGroteskCorp-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/AktivGroteskCorp-Italic.woff2', weight: '400', style: 'italic' },
    { path: '../../public/fonts/AktivGroteskCorp-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/AktivGroteskCorp-MediumItalic.woff2', weight: '500', style: 'italic' },
    { path: '../../public/fonts/AktivGroteskCorp-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/AktivGroteskCorp-BoldItalic.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-aktiv',
});

const shadowsIntoLight = localFont({
  src: '../../public/fonts/ShadowsIntoLight_Regular.woff2',
  variable: '--font-handwritten',
  weight: '400',
});

const themeScript = `
(function(){try{const theme=localStorage.getItem('theme')||'dark';const systemTheme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';const resolvedTheme=theme==='system'?systemTheme:theme;if(resolvedTheme==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`;

export default async function RootLayout({ children }) {
  const [latestAnimation, categories] = await Promise.all([
    getLatestAnimation(),
    getCategories(),
  ]);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DriveX Gaming",
    alternateName: "DriveX Store",
    url: "https://drivexstore.shop/",
    description: "Your Trusted MLBB Marketplace. Safe, fast, and verified game account trades.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://app.drivexstore.shop/animations?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DriveX Gaming",
    url: "https://drivexstore.shop/",
    logo: "https://app.drivexstore.shop/imgs/logo.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bangkok",
      addressCountry: "TH",
    },
    sameAs: [
      "https://www.facebook.com/",
    ],
  };

  const navigationSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "SiteNavigationElement",
        position: 1,
        name: "Accounts Marketplace",
        url: "https://app.drivexstore.shop/animations",
      },
      {
        "@type": "SiteNavigationElement",
        position: 2,
        name: "Guides & FAQ",
        url: "https://app.drivexstore.shop/docs",
      },
      {
        "@type": "SiteNavigationElement",
        position: 3,
        name: "Roadmap",
        url: "https://app.drivexstore.shop/roadmap",
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`
        ${aktivGrotesk.variable}
        ${geistSans.variable}
        ${geistMono.variable}
        ${shadowsIntoLight.variable}
      `}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="navigation-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationSchema) }}
        />
      </head>
      <body className="bg-background text-foreground font-sans">
        <Provider categories={categories}>
          {children}
        </Provider>
      </body>
    </html>
  );
}
