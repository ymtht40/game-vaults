'use client';

// Variable Mapping: O -> RoadmapColumn, e -> column, r -> effectiveCount, a -> effectiveVoted, n -> isAuthenticated, s -> onVoteChange, i -> onOpenSuggest, l -> suggestOpen

import FadeIn from '@/animations/FadeIn'; // NOTE: module id: 460391
import { RoadmapCard } from '@/features/roadmap/RoadmapCard'; // NOTE: module id: 626171

// NOTE: module id: 626171
export function RoadmapColumn({
  column,
  effectiveCount,
  effectiveVoted,
  isAuthenticated,
  onVoteChange,
  onOpenSuggest,
  suggestOpen,
}) {
  return (
    <div className="flex flex-col gap-16">
      <header className="flex items-baseline justify-between gap-12 border-b border-foreground/15 pb-12">
        <span className="flex items-baseline gap-8 text-mono-sm text-foreground">
          <span className="text-foreground/45">{column.index}</span>
          <span>{column.label}</span>
        </span>
        <span className="text-accent-xs tabular-nums text-foreground/55">
          {column.count.toString().padStart(2, '0')}
        </span>
      </header>
      <FadeIn as="ul" trigger="scroll" stagger={0.06} y={20} className="flex flex-col gap-12">
        {column.items.map((item) => (
          <li key={item.id} data-flip-id={item.id} className="roadmap-board-card-item">
            <RoadmapCard
              item={{
                ...item,
                vote_count: effectiveCount(item),
                user_has_voted: effectiveVoted(item),
              }}
              variant={column.variant}
              isAuthenticated={isAuthenticated}
              onVoteChange={onVoteChange}
            />
          </li>
        ))}
        {column.items.length === 0 && !column.showSuggestTile && (
          <li>
            <RoadmapCard
              variant="suggest"
              onOpenSuggest={onOpenSuggest}
              suggestOpen={suggestOpen}
            />
          </li>
        )}
        {column.showSuggestTile && (
          <li>
            <RoadmapCard
              variant="suggest"
              onOpenSuggest={onOpenSuggest}
              suggestOpen={suggestOpen}
            />
          </li>
        )}
      </FadeIn>
    </div>
  );
}
