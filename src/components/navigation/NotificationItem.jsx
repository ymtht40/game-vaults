'use client';

/* Variable Mapping:
 * O -> NOTIFICATION_TYPE_CONFIG, I -> NotificationItem, e -> item,
 * a -> isUnread, r -> onNavigate, n -> typeMeta, l -> hasThumbnail
 */

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge'; // NOTE: module id: 583246

const NOTIFICATION_TYPE_CONFIG = {
  animation: { label: 'Animation', variant: 'info' },
  blog: { label: 'Blog', variant: 'default' },
  feature: { label: 'Feature', variant: 'success' },
};

// NOTE: module id: 583246
export function NotificationItem({ item, isUnread, onNavigate }) {
  const typeMeta = NOTIFICATION_TYPE_CONFIG[item.type] || NOTIFICATION_TYPE_CONFIG.feature;
  const hasThumbnail = !!item.thumbnail;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="group relative flex gap-12 rounded-md p-12 microinteraction hover:bg-secondary"
    >
      {isUnread && (
        <span
          aria-hidden="true"
          className="absolute left-4 top-20 h-6 w-6 rounded-full bg-brand"
        />
      )}
      {hasThumbnail && (
        <div className="relative h-56 w-80 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
          <Image
            src={item.thumbnail}
            alt=""
            fill={true}
            sizes="80px"
            className="object-cover"
            unoptimized={true}
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-8">
          <Badge variant={typeMeta.variant} className="px-8 py-0 text-[10px]">
            {typeMeta.label}
          </Badge>
          <span className="text-xs color-faded tabular-nums">
            {(function (dateStr) {
              if (!dateStr) return '';
              const date = new Date(dateStr);
              const minutes = Math.round((Date.now() - date.getTime()) / 60000);
              if (minutes < 1) return 'just now';
              if (minutes < 60) return `${minutes}m`;
              const hours = Math.round(minutes / 60);
              if (hours < 24) return `${hours}h`;
              const days = Math.round(hours / 24);
              if (days < 7) return `${days}d`;
              const weeks = Math.round(days / 7);
              return weeks < 5
                ? `${weeks}w`
                : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            })(item.date)}
          </span>
        </div>
        <h4 className="h6 mt-6 font-medium leading-snug line-clamp-2 group-hover:opacity-80">
          {item.title}
        </h4>
        {item.description && (
          <p className="mt-4 text-xs color-faded line-clamp-2">{item.description}</p>
        )}
      </div>
    </Link>
  );
}