
export const SITE_NAME = 'GameVault';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://example.com'
).replace(/\/+$/, '');
