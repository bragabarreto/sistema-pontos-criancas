/**
 * Parent (admin) authentication.
 *
 * When the ADMIN_PASSWORD environment variable is set, the main app and every
 * write operation require a session cookie; the kids' read-only page
 * (/acompanhar) and the read-only GET endpoints it uses stay public.
 * When ADMIN_PASSWORD is not set, the app stays fully open (previous behavior).
 *
 * Uses only Web Crypto so it runs both in middleware (edge) and route handlers.
 */

export const ADMIN_COOKIE = 'pontos_admin';
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function getAdminPassword(): string | undefined {
  const value = process.env.ADMIN_PASSWORD;
  return value && value.length > 0 ? value : undefined;
}

/** Token stored in the cookie: a hash of the password, never the password itself */
export async function adminToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`sistema-pontos-criancas:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Constant-time string comparison */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
