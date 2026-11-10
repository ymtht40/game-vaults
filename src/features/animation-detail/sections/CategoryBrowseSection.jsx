'use client';

// Variable Mapping: q -> CategoryBrowseSection, e -> currentCategory, s -> slug, a -> categories / categoryItem, r -> isActive, F.useCategories -> useCategories, f.default -> Link, n.H -> analytics, B.f -> cn

import Link from 'next/link'; // NOTE: module id: 101836
import { analytics } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348
import { useCategories } from '@/providers/CategoryProvider'; // NOTE: module id: 87207
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

// NOTE: module id: 521041
export default function CategoryBrowseSection({ currentCategory, slug }) {
  const categories = useCategories();

  if (!categories || categories.length === 0) return null;

  return (
    <section
      data-theme="dark"
      className="v2-container border-t border-foreground/10 py-32"
    >
      <div className="flex flex-wrap items-center gap-x-24 gap-y-16">
        <span className="text-accent-xs text-foreground-muted">Browse by category</span>
        <ul className="flex flex-wrap gap-8">
          {categories.map((categoryItem) => {
            const isActive = categoryItem.slug === currentCategory;

            return (
              <li key={categoryItem.slug}>
                <Link
                  href={`/animations?category=${categoryItem.slug}`}
                  onClick={() =>
                    analytics.track(
                      'detail_browse_used',
                      {
                        action: 'category',
                        from_slug: slug,
                        category: categoryItem.slug,
                      },
                      {
                        transport: 'sendBeacon',
                      }
                    )
                  }
                  className={cn(
                    'text-accent-xs flex items-center gap-8 bg-foreground/[0.06] px-12 py-8 text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10'
                  )}
                >
                  {isActive && <span aria-hidden="true" className="size-8 bg-brand" />}
                  <span>{categoryItem.name}</span>
                  <span className="text-foreground-muted">{categoryItem.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
