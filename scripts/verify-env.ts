import fs from 'node:fs';
import path from 'node:path';

function loadDotEnvFile(fileName: string) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

loadDotEnvFile('.env.local');
loadDotEnvFile('.env');

const required = [
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
];

const placeholderPatterns = [
  /replace/i,
  /example\.com/i,
  /your_/i,
  /changeme/i,
  /placeholder/i,
  /^pk_test_replace_me$/,
  /^sk_test_replace_me$/,
  /^whsec_replace_me$/,
  /^price_replace_me$/,
];

const errors: string[] = [];

for (const key of required) {
  const value = process.env[key]?.trim();
  if (!value) {
    errors.push(`${key}: missing`);
    continue;
  }
  if (placeholderPatterns.some((pattern) => pattern.test(value))) errors.push(`${key}: placeholder value is not allowed`);
}

const appBase = process.env.APP_BASE_URL;
const publicBase = process.env.NEXT_PUBLIC_APP_BASE_URL;
if (appBase && publicBase && appBase !== publicBase) errors.push('APP_BASE_URL and NEXT_PUBLIC_APP_BASE_URL must match');

const expectedPrice = Number.parseInt(process.env.EXPECTED_PRICE_USD_CENTS || '', 10);
if (!Number.isFinite(expectedPrice) || expectedPrice <= 0) errors.push('EXPECTED_PRICE_USD_CENTS must be a positive integer');

const expectedCurrency = process.env.EXPECTED_CURRENCY?.trim().toLowerCase();
if (!expectedCurrency || !/^[a-z]{3}$/.test(expectedCurrency)) errors.push('EXPECTED_CURRENCY must be a 3-letter lowercase currency code, e.g. usd');

const supportEmail = process.env.SUPPORT_EMAIL?.trim();
if (supportEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(supportEmail)) errors.push('SUPPORT_EMAIL must be a valid email address');

const adminKey = process.env.ADMIN_API_KEY || '';
if (adminKey.length < 24) errors.push('ADMIN_API_KEY must be at least 24 characters');

if (errors.length > 0) {
  console.error('Environment verification failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Environment verification passed: ${required.length} variables checked.`);
