export const HELP_PATH = '/help';
export const MAX_REPORTS_PER_EMAIL_30_DAYS = 3;

const CRISIS_TERMS = [
  'suicide',
  'kill myself',
  'end my life',
  'self harm',
  'self-harm',
  'hurt myself',
  'want to die',
  'no reason to live',
  'амиа хорло',
  'амиа хорлох',
  'үхмээр',
  'өөрийгөө гэмтээ',
  'өөрийгөө алах',
];

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function containsCrisisSignal(values: Array<string | null | undefined>): boolean {
  const text = values.filter(Boolean).join(' ').toLowerCase();
  return CRISIS_TERMS.some((term) => text.includes(term));
}

export function validateBirthDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'invalid_birth_date_format';

  const [year, month, day] = value.split('-').map(Number);
  if (year < 1900) return 'birth_date_too_old';

  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isRealDate) return 'invalid_birth_date';

  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (date.getTime() > todayUtc) return 'birth_date_in_future';

  return null;
}

export const SELF_REFLECTION_DISCLAIMER =
  'ORACIA is for entertainment and self-reflection only. It is not medical, psychological, legal, financial, relationship, career, or crisis advice. Do not use it as the basis for major life decisions.';

export const AGENCY_FRAME =
  'You remain the decision-maker. Treat every section as a journaling prompt, not an instruction, prediction, diagnosis, or command.';

export const HELP_MESSAGE =
  'If you feel at risk of harming yourself or someone else, pause this purchase and contact local emergency services or a crisis hotline. ORACIA is not crisis support.';
