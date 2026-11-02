export const FTP_COOKIE_NAME = 'anm_ftp';
export const COOKIE_MAX_AGE = 34560000;
export const SESSION_COOKIE_NAME = 'anm_kit';

export function parseUrlSession({ getParam, at = null }) {
  const sid = getParam('sid');
  const subscriberId = sid && /^[0-9a-f]{16}$/.test(sid) ? sid : getParam('ck_subscriber_id');

  return subscriberId && /^(\d{1,20}|[0-9a-f]{16})$/.test(subscriberId)
    ? {
        id: subscriberId,
        campaign: getParam('utm_campaign') || null,
        at: at || null,
      }
    : null;
}

export function parseSessionCookie(rawCookie) {
  if (!rawCookie || typeof rawCookie !== 'string') return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(rawCookie));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function stringifySessionCookie(payload) {
  try {
    const encoded = encodeURIComponent(JSON.stringify(payload));
    return encoded.length <= 800 ? encoded : null;
  } catch {
    return null;
  }
}
