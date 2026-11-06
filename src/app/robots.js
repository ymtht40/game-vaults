const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://app.drivexstore.shop'
).replace(/\/$/, '')

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/account/',
        '/checkout/'
      ]
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  }
}
