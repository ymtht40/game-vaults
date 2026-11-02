import { NextResponse } from 'next/server';
import { createClient } from '@/libs/supabase/client';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const previewId = searchParams.get('preview');
    const supabase = createClient();

    let query = supabase.from('announcements').select('*');

    if (previewId) {
      query = query.eq('id', previewId).single();
    } else {
      query = query
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    }

    const { data, error } = await query;

    if (error || !data) {
      return NextResponse.json({ announcement: null });
    }

    const announcement = {
      id: data.id,
      delayMs: data.delay_ms || 0,
      preview: !!previewId,
    };

    return NextResponse.json({ announcement });
  } catch (error) {
    return NextResponse.json({ announcement: null });
  }
}

export async function POST(req) {
  try {
    const { id, event } = await req.json();

    if (!id || !event) {
      return NextResponse.json(
        { error: 'Missing id or event' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { error } = await supabase.from('announcement_events').insert({
      announcement_id: id,
      event_type: event,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

