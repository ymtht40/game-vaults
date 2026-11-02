'use client';

import React, { useEffect, useState } from 'react';
import { CookiePreferencesModal } from '@/features/common/CookiePreferencesModal'; // NOTE: module id: 42223

// NOTE: module id: 515432
export function CookieConsentProvider() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('annnimate:open-cookie-preferences', handleOpen);
    return () => window.removeEventListener('annnimate:open-cookie-preferences', handleOpen);
  }, []);

  return <CookiePreferencesModal open={isOpen} onOpenChange={setIsOpen} />;
}

