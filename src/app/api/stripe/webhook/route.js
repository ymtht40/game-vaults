// POST /api/stripe/webhook
// Fulfils purchases after Stripe confirms payment:
//   - Kit (one-time)   -> row in kit_purchases
//   - Plan (recurring) -> access flags on users
// Point a Stripe webhook endpoint at /api/stripe/webhook and subscribe it to:
//   checkout.session.completed, checkout.session.async_payment_succeeded,
//   customer.subscription.updated, customer.subscription.deleted

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key);
}

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase service role configuration');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function fulfilKit(supabase, session) {
  const kitSlug = session.metadata?.kit_slug;
  if (!kitSlug) return;

  const { error } = await supabase.from('kit_purchases').upsert(
    {
      // Guests have no user_id yet; the row is claimed by email when they sign up
      user_id: session.metadata?.user_id || null,
      email: session.customer_details?.email || session.customer_email || null,
      kit_slug: kitSlug,
      stripe_session_id: session.id,
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
      amount_total: session.amount_total ?? null,
      currency: session.currency ?? null,
    },
    // A replayed webhook must never create a second purchase
    { onConflict: 'stripe_session_id' },
  );
  if (error) throw error;
}

async function fulfilPlan(supabase, session) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.warn('[stripe-webhook] plan paid by a guest, no user to update:', session.id);
    return;
  }

  const { error } = await supabase
    .from('users')
    .update({
      has_access: true,
      subscription_status: 'active',
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
    })
    .eq('id', userId);
  if (error) throw error;
}

async function syncSubscription(supabase, subscription) {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  if (!customerId) return;

  const isLive = ['active', 'trialing'].includes(subscription.status);

  const { error } = await supabase
    .from('users')
    .update({ has_access: isLive, subscription_status: subscription.status })
    .eq('stripe_customer_id', customerId);
  if (error) throw error;
}

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });
  }

  // Signature checks need the exact raw body, so never call request.json() here
  const rawBody = await request.text();

  let event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error('[stripe-webhook] bad signature:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const supabase = getAdminSupabase();

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        if (session.payment_status !== 'paid') break; // wait for the async event
        if (session.metadata?.kind === 'kit') await fulfilKit(supabase, session);
        else if (session.metadata?.kind === 'plan') await fulfilPlan(supabase, session);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(supabase, event.data.object);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[stripe-webhook] handler failed:', event.type, err);
    // A 500 makes Stripe retry, which is what we want for a transient DB error
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}

