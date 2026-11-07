
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://app.drivexstore.shop'
).replace(/\/+$/, '');

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      return json(
        { error: 'Content-Type must be application/json' },
        415
      );
    }

    const body = await request.json();

    if (
      !body ||
      typeof body.email !== 'string' ||
      body.email.length > 254
    ) {
      return json({ error: 'Invalid email address' }, 400);
    }

    const email = body.email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
      return json({ error: 'Invalid email address' }, 400);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase Auth configuration missing');

      return json(
        { error: 'Authentication service unavailable' },
        503
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${SITE_URL}/login`,
      },
    });

    if (error) {
      if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
        return json(
          { error: 'Too many requests. Please try again later.' },
          429
        );
      }

      console.error('OTP request failed:', error.code || error.status);

      return json(
        { error: 'Unable to send sign-in code. Please try again.' },
        503
      );
    }

    return json({
      success: true,
      email,
      redirectTo: '/animations',
      message: 'If the account is eligible, a sign-in code will be sent.',
    });
  } catch {
    return json(
      { error: 'Invalid request or internal server error' },
      400
    );
  }
}
