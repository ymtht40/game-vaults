import { cache } from 'react';
import { createServerSupabase, getViewerContext } from '@/libs/supabase/server';

const SECTION_IDS = ['in-progress', 'next-up', 'under-consideration'];
const ITEM_FIELDS =
  'id, title, description, category, priority, status, started_at, target_window, vote_count';

export const getRoadmap = cache(async () => {
  const empty = {
    is_authenticated: false,
    sections: SECTION_IDS.map((id) => ({ id, items: [] })),
  };

  try {
    const [supabase, viewer] = await Promise.all([
      createServerSupabase(),
      getViewerContext(),
    ]);

    const { data, error } = await supabase
      .from('roadmap_items')               // ← table အမည်ကို ကိုယ့် DB နဲ့ ညှိပါ
      .select(ITEM_FIELDS)
      .in('status', SECTION_IDS);
    if (error) throw error;

    let votedIds = new Set();
    if (viewer.user) {
      const { data: votes } = await supabase
        .from('roadmap_votes')             // ← ဒါလည်း ညှိပါ
        .select('item_id')
        .eq('user_id', viewer.user.id);
      votedIds = new Set((votes ?? []).map((v) => v.item_id));
    }

    return {
      is_authenticated: Boolean(viewer.user),
      sections: SECTION_IDS.map((id) => ({
        id,
        items: (data ?? [])
          .filter((row) => row.status === id)
          .map((row) => ({
            ...row,
            vote_count: Number(row.vote_count) || 0,
            user_has_voted: votedIds.has(row.id),
          })),
      })),
    };
  } catch {
    console.error('Unable to load the roadmap.');
    return empty;
  }
});

