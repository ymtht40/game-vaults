import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabase } from '@/libs/supabase/server';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key, {
    apiVersion: '2023-10-16',
  });
}

export async function POST(req) {
  try {
    const { returnUrl } = await req.json();

    // Server route: must use the cookie-aware server client so the logged-in user is identified.
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    const customerId = profile?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json({ error: 'Stripe customer ID not found' }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('[create-portal]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
