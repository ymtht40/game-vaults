/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },

  // Required so PostHog's trailing-slash endpoints (e.g. /e/) are not redirected
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      // Static assets must be matched before the generic API rule
      {
        source: '/relay-A8q3/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/relay-A8q3/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
};

export default nextConfig;
