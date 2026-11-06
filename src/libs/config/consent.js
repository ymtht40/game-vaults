export const ASCII_CHARS =
  ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';
  
const COOKIE_NAME = 'gamevault_consent';

export const defaultConsent = {
  version: 1,
  timestamp: null,
  essential: true,
  analytics: false,
  functional: false,
  marketing: false,
  method: null,
};

export function saveConsent(consent) {
  if (typeof document === 'undefined') return;

  const serialized = btoa(
    JSON.stringify({
      ...consent,
      version: 1,
      timestamp: new Date().toISOString(),
      essential: true,
    })
  );

  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + 365);

  let cookieString = `${COOKIE_NAME}=${encodeURIComponent(serialized)}; path=/; expires=${expiresDate.toUTCString()}; SameSite=Lax`;
  if (window.location.protocol === 'https:') {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

export function notifyConsentChange() {
  window.dispatchEvent(new CustomEvent('gamevault:consent-changed'));
}

export function acceptAllConsent() {
  saveConsent({
    essential: true,
    analytics: true,
    functional: true,
    marketing: false,
    method: 'explicit',
  });
  notifyConsentChange();
}

export function getConsentState() {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return null;

  try {
    const rawValue = cookie.split('=')[1];
    const decoded = atob(decodeURIComponent(rawValue));
    const parsed = JSON.parse(decoded);
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export {
  acceptAllConsent as b,
  defaultConsent as x,
  notifyConsentChange as q,
  getConsentState as u,
  saveConsent as I,
};

