'use client';

// Variable Mapping: $ -> RoadmapBoard, e -> sectionsById, a -> isAuthenticated, n -> onVoteChange, s -> onOpenSuggest, i -> suggestOpen, l -> voteOverrides, o -> setVoteOverrides, d -> flipStateRef, c -> getEffectiveCount, u -> getEffectiveVoted, h -> columns, g -> handleVoteChange

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { RoadmapColumn } from '@/features/roadmap/RoadmapColumn'; // NOTE: module id: 626171
import { BOARD_COLUMNS } from '@/features/roadmap/roadmap.config'; // NOTE: module id: 626171

gsap.registerPlugin(Flip);

// NOTE: module id: 626171
export function RoadmapBoard({
  sectionsById = {},
  isAuthenticated,
  onVoteChange,
  onOpenSuggest,
  suggestOpen = false,
}) {
  const [voteOverrides, setVoteOverrides] = useState({});
  const flipStateRef = useRef(null);

  function getEffectiveCount(item) {
    return voteOverrides[item.id]?.count ?? item.vote_count ?? 0;
  }

  function getEffectiveVoted(item) {
    return voteOverrides[item.id]?.voted ?? item.user_has_voted ?? false;
  }

  const columns = useMemo(
    () =>
      BOARD_COLUMNS.map((columnConfig) => {
        const section = sectionsById[columnConfig.id];
        const items = section?.items ? [...section.items] : [];
        if (columnConfig.sortByVotes) {
          items.sort((first, second) => getEffectiveCount(second) - getEffectiveCount(first));
        }
        return {
          ...columnConfig,
          items,
          count: items.length,
        };
      }),
    [sectionsById, voteOverrides]
  );

  function handleVoteChange({ itemId, voted, count }) {
    if (Flip) {
      flipStateRef.current = Flip.getState('.roadmap-board-card-item');
    }
    setVoteOverrides((prev) => ({
      ...prev,
      [itemId]: { voted, count },
    }));
    onVoteChange?.({ itemId, voted, count });
  }

  useLayoutEffect(() => {
    if (flipStateRef.current) {
      Flip.from(flipStateRef.current, {
        duration: 0.6,
        ease: 'expo.inOut',
        nested: true,
      });
      flipStateRef.current = null;
    }
  }, [voteOverrides]);

  return (
    <section id="board" className="roadmap-board relative flex-1 bg-background text-foreground">
      <div className="v2-container pt-24 pb-64 lg:pt-32 lg:pb-96">
        <header className="mb-20 flex flex-wrap items-end justify-between gap-x-32 gap-y-12 lg:mb-32">
          <p className="text-mono-sm text-foreground/55">The board</p>
        </header>
        <div className="grid grid-cols-1 gap-24 lg:grid-cols-3 lg:gap-24">
          {columns.map((column) => (
            <RoadmapColumn
              key={column.id}
              column={column}
              effectiveCount={getEffectiveCount}
              effectiveVoted={getEffectiveVoted}
              isAuthenticated={isAuthenticated}
              onVoteChange={handleVoteChange}
              onOpenSuggest={onOpenSuggest}
              suggestOpen={suggestOpen}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
