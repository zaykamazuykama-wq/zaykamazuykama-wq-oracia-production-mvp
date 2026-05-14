import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { containsCrisisSignal, normalizeEmail, validateBirthDate, MAX_REPORTS_PER_EMAIL_30_DAYS } from '@/lib/safety';

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
  ageAffirmed: z.literal(true),
  agencyAffirmed: z.literal(true),
});

async function readInput(req: NextRequest): Promise<unknown> {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return await req.json();

  const form = await req.formData();
  return {
    email: form.get('email'),
    name: form.get('name') || null,
    birthDate: form.get('birthDate'),
    birthTime: form.get('birthTime') || null,
    birthPlace: form.get('birthPlace') || null,
    ageAffirmed: form.get('ageAffirmed') === 'true',
    agencyAffirmed: form.get('agencyAffirmed') === 'true',
  };
}

function redirectOrJson(req: NextRequest, url: string) {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return NextResponse.json({ checkoutUrl: url });
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_PRICE_ID || !process.env.APP_BASE_URL) throw new Error('checkout_env_missing');
    const parsed = bodySchema.safeParse(await readInput(req));
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    const input = { ...parsed.data, email: normalizeEmail(parsed.data.email) };

    const birthDateError = validateBirthDate(input.birthDate);
    if (birthDateError) return NextResponse.json({ error: birthDateError }, { status: 400 });

    if (containsCrisisSignal([input.name, input.birthPlace])) {
      return NextResponse.json({ error: 'Please pause and visit /help before purchasing.' }, { status: 400 });
    }

    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
    const { count, error: countError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('email', input.email)
      .gte('created_at', since);
    if (countError) throw new Error('rate_limit_check_failed');
    if ((count || 0) >= MAX_REPORTS_PER_EMAIL_30_DAYS) {
      return NextResponse.json({ error: 'Purchase limit reached. Please wait before buying another report.' }, { status: 429 });
    }

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
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    if (!session.url) throw new Error('checkout_url_missing');
    await supabase.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id);
    return redirectOrJson(req, session.url);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
