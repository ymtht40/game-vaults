import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/libs/supabase/server';

async function getUserAndItemId(request) {
  const supabase = await createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const { itemId } = await request.json().catch(() => ({}));
  if (!itemId) return { response: NextResponse.json({ error: 'Bad Request' }, { status: 400 }) };

  return { supabase, user, itemId };
}

export async function POST(request) {
  try {
    const ctx = await getUserAndItemId(request);
    if (ctx.response) return ctx.response;

    const { error } = await ctx.supabase
      .from('roadmap_votes')
      .insert([{ user_id: ctx.user.id, item_id: ctx.itemId }]);

    if (error && error.code !== '23505') {   // ထပ်မဲပေးတာဆို လျစ်လျူရှု
      return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const ctx = await getUserAndItemId(request);
    if (ctx.response) return ctx.response;

    const { error } = await ctx.supabase
      .from('roadmap_votes')
      .delete()
      .eq('user_id', ctx.user.id)
      .eq('item_id', ctx.itemId);

    if (error) return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

