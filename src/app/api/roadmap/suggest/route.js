import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/libs/supabase/server';

export async function POST(request) {
  try {
    const { idea, referenceUrl, email, website } = await request.json().catch(() => ({}));

    // honeypot: လူသားက မဖြည့်တဲ့ field ကို bot က ဖြည့်ရင် အောင်မြင်သလို ဟန်ဆောင်ပြီး မသိမ်းဘူး
    if (website) return NextResponse.json({ id: null });

    const cleanIdea = typeof idea === 'string' ? idea.trim() : '';
    if (!cleanIdea || cleanIdea.length > 2000) {
      return NextResponse.json({ error: 'Please describe your idea.' }, { status: 400 });
    }
    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'That email looks off.' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('roadmap_suggestions')
      .insert([{
        idea: cleanIdea,
        reference_url: typeof referenceUrl === 'string' ? referenceUrl.trim() || null : null,
        email: cleanEmail || null,
        user_id: user?.id ?? null,
      }])
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: 'Could not save your suggestion.' }, { status: 500 });
    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

