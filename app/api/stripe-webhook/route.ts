import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { resumeFulfillment } from '@/lib/fulfillment';
import { safeErrorCode } from '@/lib/utils';

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('stripe_secret_key_missing');
  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') return NextResponse.json({ received: true });

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId || session.client_reference_id;
  if (!orderId) return NextResponse.json({ error: 'Missing order' }, { status: 400 });

  await supabase.from('webhook_events').insert({
    stripe_event_id: event.id,
    order_id: orderId,
    event_type: event.type,
    status: 'received',
  });

  const { data: locked, error: lockError } = await supabase.rpc('acquire_webhook_event_lock', { p_stripe_event_id: event.id });
  if (lockError) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  if (!locked) {
    const { data: existing } = await supabase.from('webhook_events').select('status').eq('stripe_event_id', event.id).single();
    if (existing?.status === 'processed' || existing?.status === 'processing') return NextResponse.json({ received: true });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  try {
    const fulfilled = await resumeFulfillment(session, orderId);
    if (fulfilled.status !== 'fulfilled') throw new Error(`fulfillment_incomplete_${fulfilled.status}`);
    await supabase.from('webhook_events').update({
      status: 'processed',
      processed_at: new Date().toISOString(),
      error_code: null,
      error_message_safe: null,
    }).eq('stripe_event_id', event.id);
    return NextResponse.json({ received: true });
  } catch (err) {
    const code = safeErrorCode(err, 'fulfillment_failed');
    await supabase.from('webhook_events').update({ status: 'failed', error_code: code, error_message_safe: code, locked_at: null }).eq('stripe_event_id', event.id);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
