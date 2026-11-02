import { NextResponse } from 'next/server';
import { createClient } from '@/libs/supabase/client';

export async function POST(req) {
  try {
    const { animationId } = await req.json();

    if (!animationId) {
      return NextResponse.json(
        { error: 'Animation ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { error } = await supabase.from('animation_views').insert({
      animation_id: animationId,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to track view' },
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

