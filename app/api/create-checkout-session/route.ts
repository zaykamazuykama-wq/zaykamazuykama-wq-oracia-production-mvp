import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('stripe_secret_key_missing');
  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

const bodySchema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional().nullable(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().optional().nullable(),
  birthPlace: z.string().max(160).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_PRICE_ID || !process.env.APP_BASE_URL) throw new Error('checkout_env_missing');
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    const input = parsed.data;

    const { data: order, error } = await supabase.from('orders').insert({
      email: input.email,
      name: input.name || null,
      birth_date: input.birthDate,
      birth_time: input.birthTime || null,
      birth_place: input.birthPlace || null,
      status: 'pending_payment',
    }).select('id').single();

    if (error || !order) throw new Error('order_create_failed');

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: input.email,
      success_url: `${process.env.APP_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL}/cancel`,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
    });

    await supabase.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id);
    return NextResponse.json({ checkoutUrl: session.url });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
