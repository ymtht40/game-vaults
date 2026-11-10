'use client';

// Variable Mapping: e -> roadmap, n -> animations, s -> lastShippedDaysAgo, i -> isAuthenticated, l -> suggestOpen, o -> setSuggestOpen, d -> handleOpenSuggest, c -> sectionsById, u -> counts, h -> initialVotedItemsById, m -> setVotedItemsById, f -> previewImages, t -> itemId, r -> voted, a -> prevVotedItems

import { useCallback, useMemo, useState } from 'react';
import EndCta from '@/features/landing/EndCta'; // NOTE: module id: 482232
import { RoadmapBoard } from '@/features/roadmap/RoadmapBoard'; // NOTE: module id: 626171
import { RoadmapHero } from '@/features/roadmap/RoadmapHero'; // NOTE: module id: 626171
import { SuggestModal } from '@/features/roadmap/SuggestModal'; // NOTE: module id: 626171

// NOTE: module id: 626171
export default function RoadmapPage({ roadmap, animations = [], lastShippedDaysAgo }) {
  const isAuthenticated = !!roadmap?.is_authenticated;
  const [suggestOpen, setSuggestOpen] = useState(false);
  const handleOpenSuggest = useCallback(() => setSuggestOpen(true), []);

  const sectionsById = useMemo(() => {
    const map = {};
    for (const section of roadmap?.sections || []) {
      map[section.id] = section;
    }
    return map;
  }, [roadmap]);

  const counts = useMemo(
    () => ({
      inProgress: sectionsById['in-progress']?.items?.length || 0,
      nextUp: sectionsById['next-up']?.items?.length || 0,
      underConsideration: sectionsById['under-consideration']?.items?.length || 0,
    }),
    [sectionsById]
  );

  const initialVotedItemsById = useMemo(() => {
    const map = {};
    for (const section of roadmap?.sections || []) {
      for (const item of section.items || []) {
        if (item.user_has_voted) {
          map[item.id] = item;
        }
      }
    }
    return map;
  }, [roadmap]);

  const [, setVotedItemsById] = useState(initialVotedItemsById);

  const previewImages = useMemo(
    () => animations.filter((item) => item.preview_image_url).map((item) => item.preview_image_url),
    [animations]
  );

  return (
    <main data-theme={isAuthenticated ? 'dark' : 'light'} className="bg-background text-foreground">
      <div className={isAuthenticated ? undefined : 'flex min-h-screen flex-col'}>
        <RoadmapHero
          counts={counts}
          lastShippedDaysAgo={lastShippedDaysAgo}
          onOpenSuggest={handleOpenSuggest}
          suggestOpen={suggestOpen}
        />
        <RoadmapBoard
          sectionsById={sectionsById}
          isAuthenticated={isAuthenticated}
          onVoteChange={function ({ itemId, voted }) {
            setVotedItemsById((prevVotedItems) => {
              const nextVotedItems = { ...prevVotedItems };
              if (voted) {
                for (const section of roadmap?.sections || []) {
                  const found = (section.items || []).find((item) => item.id === itemId);
                  if (found) {
                    nextVotedItems[itemId] = found;
                    break;
                  }
                }
              } else {
                delete nextVotedItems[itemId];
              }
              return nextVotedItems;
            });
          }}
          onOpenSuggest={handleOpenSuggest}
          suggestOpen={suggestOpen}
        />
      </div>
      {isAuthenticated ? (
        <EndCta
          images={previewImages}
          minimal={true}
          headline="Members shape the queue."
          subtext="Vote on what matters, suggest what's missing - the most-wanted components ship first."
          primaryCta={{ label: 'Browse the library', href: '/animations' }}
          secondaryCta={{ label: 'View your saved', href: '/animations/saved' }}
        />
      ) : (
        <EndCta
          headline="You shape the queue."
          subtext="Vote and suggest, no account needed. The most-wanted components ship first - the library is how you use them."
          primaryCta={{ label: 'Get Annnimate', href: '/pricing' }}
          secondaryCta={{ label: 'Browse the library', href: '/animations' }}
          images={previewImages}
          bleed={true}
        />
      )}
      <SuggestModal
        open={suggestOpen}
        onOpenChange={setSuggestOpen}
        isAuthenticated={isAuthenticated}
      />
    </main>
  );
}
