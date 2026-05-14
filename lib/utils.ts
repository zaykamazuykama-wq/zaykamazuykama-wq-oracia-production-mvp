export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function safeErrorCode(error: unknown, fallback = 'internal_error'): string {
  if (error instanceof Error && /^[a-z0-9_:-]{3,80}$/i.test(error.message)) return error.message.slice(0, 80);
  return fallback;
}

export function noPiiLog(message: string, meta: Record<string, unknown> = {}) {
  console.error(message, meta);
}
