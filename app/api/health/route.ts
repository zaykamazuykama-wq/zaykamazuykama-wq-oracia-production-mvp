import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REQUIRED_ENV = [
  'APP_BASE_URL',
  'NEXT_PUBLIC_APP_BASE_URL',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'REPORT_FROM_EMAIL',
  'ADMIN_API_KEY',
  'EXPECTED_PRICE_USD_CENTS',
  'EXPECTED_CURRENCY',
  'SUPPORT_EMAIL',
] as const;

const PLACEHOLDER_PATTERNS = [
  /replace/i,
  /example\.com/i,
  /yourdomain/i,
  /your_/i,
  /changeme/i,
  /placeholder/i,
  /^pk_test_replace_me$/,
  /^sk_test_replace_me$/,
  /^whsec_replace_me$/,
  /^price_replace_me$/,
];

function statusFor(key: string) {
  const value = process.env[key]?.trim();
  if (!value) return 'missing';
  if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))) return 'placeholder';
  return 'set';
}

function redactUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'invalid_url';
  }
}

export async function GET() {
  const env = Object.fromEntries(REQUIRED_ENV.map((key) => [key, statusFor(key)]));
  const missing = Object.entries(env).filter(([, status]) => status !== 'set');

  const expectedPrice = Number.parseInt(process.env.EXPECTED_PRICE_USD_CENTS || '', 10);
  const expectedCurrency = process.env.EXPECTED_CURRENCY?.trim().toLowerCase();
  const appBase = process.env.APP_BASE_URL;
  const publicBase = process.env.NEXT_PUBLIC_APP_BASE_URL;

  const checks = {
    envReady: missing.length === 0,
    appBaseUrl: redactUrl(appBase),
    publicBaseUrl: redactUrl(publicBase),
    appBaseMatchesPublicBase: Boolean(appBase && publicBase && appBase === publicBase),
    expectedPriceValid: Number.isFinite(expectedPrice) && expectedPrice > 0,
    expectedCurrencyValid: Boolean(expectedCurrency && /^[a-z]{3}$/.test(expectedCurrency)),
    supportEmailValid: Boolean(process.env.SUPPORT_EMAIL && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(process.env.SUPPORT_EMAIL)),
    adminKeyLengthOk: Boolean((process.env.ADMIN_API_KEY || '').length >= 24),
  };

  const ok = missing.length === 0 && Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      ok,
      service: 'oracia-production-mvp',
      checks,
      env,
      missingOrInvalid: missing.map(([key, status]) => ({ key, status })),
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 500 },
  );
}
