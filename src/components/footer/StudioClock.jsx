'use client';

import { useEffect, useState } from 'react';
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682

// Variable Mapping:
// L -> StudioClock
// e -> time
// i -> setTime

// NOTE: module id: 297428
export function StudioClock() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Vienna',
    });

    const updateTime = () => setTime(formatter.format(new Date()));
    updateTime();

    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-mono-sm text-foreground-muted">
      {time ? t('common.footer.studioClock', { time }) : ''}
    </span>
  );
}

export default StudioClock;
