// /api/checkout/lead
// POST { email } -> remembers the visitor's email for this checkout
// GET            -> tells the page whether a lead was already captured
//
// Both handlers always answer 2xx for expected cases. The shared axios client
// toasts on any error and redirects to login on 401, which must never happen
// for a guest who is simply mid-checkout.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const LEAD_COOKIE = 'anm_checkout_lead';
const LEAD_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(request) {
  const raw = request.cookies.get(LEAD_COOKIE)?.value;
  return NextResponse.json(
    { hasLead: Boolean(raw) },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'That email looks off.' }, { status: 400 });
    }

    // Saving the lead must never block someone from paying, so DB errors are logged only
    const supabase = getAdminSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('checkout_leads')
        .upsert({ email, last_seen_at: new Date().toISOString() }, { onConflict: 'email' });
      if (error) console.error('[checkout/lead] upsert failed:', error.message);
    }

    const response = NextResponse.json({ ok: true }, { status: 200 });
    // The email rides in the cookie so create-checkout can prefill Stripe for guests
    response.cookies.set(LEAD_COOKIE, encodeURIComponent(email), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: LEAD_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error('[checkout/lead]', error);
    return NextResponse.json({ error: 'Could not save your email' }, { status: 500 });
  }
}

