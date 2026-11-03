'use client';

import { useEffect, useState } from 'react';

import Tabs from '@/features/docs/components/Tabs'; // module id: 512922

export const STORAGE_KEY = 'anm-docs-framework';
export const SYNC_EVENT = 'anm-docs-framework-change';

export default function FrameworkTabs({
  tabs = [],
  ariaLabel = 'Framework',
}) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? null);

  useEffect(() => {
    try {
      const storedId = window.localStorage.getItem(STORAGE_KEY);

      if (storedId && tabs.some((tab) => tab.id === storedId)) {
        setActiveId(storedId);
      }
    } catch {}

    const handleFrameworkChange = (event) => {
      if (tabs.some((tab) => tab.id === event.detail)) {
        setActiveId(event.detail);
      }
    };

    window.addEventListener(SYNC_EVENT, handleFrameworkChange);

    return () => {
      window.removeEventListener(SYNC_EVENT, handleFrameworkChange);
    };
  }, []);

  if (!tabs.length) {
    return null;
  }

  const activeTab = tabs.find((tab) => tab.id === activeId) || tabs[0];

  const handleChange = (frameworkId) => {
    setActiveId(frameworkId);

    try {
      window.localStorage.setItem(STORAGE_KEY, frameworkId);
    } catch {}

    window.dispatchEvent(
      new CustomEvent(SYNC_EVENT, {
        detail: frameworkId,
      }),
    );
  };

  return (
    <div className="flex flex-col gap-20">
      <Tabs
        tabs={tabs.map(({ id, label }) => ({ id, label }))}
        activeId={activeTab.id}
        onChange={handleChange}
        ariaLabel={ariaLabel}
      />

      <div role="tabpanel" className="flex flex-col gap-16">
        {activeTab.children}
      </div>
    </div>
  );
}
