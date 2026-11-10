const nextConfig = {
  allowedDevOrigins: ['3.107.182.159'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },

  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
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
