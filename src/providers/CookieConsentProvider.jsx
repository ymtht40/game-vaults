'use client';

import React, { useEffect, useState } from 'react';
import { CookiePreferencesModal } from '@/features/legal/CookiePreferencesModal';
import CookieBanner from '@/features/legal/CookieBanner';

export function CookieConsentProvider() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('gamevault:open-cookie-preferences', handleOpen);
    return () => window.removeEventListener('gamevault:open-cookie-preferences', handleOpen);
  }, []);

  return (
    <>
      <CookieBanner onOpenPreferences={() => setIsOpen(true)} />
      <CookiePreferencesModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
