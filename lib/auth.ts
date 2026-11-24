/**
 * Authentication for the parent and each child.
 *
 * Accounts live in the `settings` table under the key "auth" (no schema
 * change). Every account starts with the temporary password and must change
 * it on first login. Sessions are HMAC-signed cookies that carry the
 * account's version, so changing or resetting a password logs out the old
 * sessions.
 *
 * Runs on the Node.js runtime (route handlers and middleware).
 */
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { asc, eq } from 'drizzle-orm';
import { db } from './db';
import { settings, children } from './schema';

export const SESSION_COOKIE = 'pontos_sessao';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
export const AUTH_SETTINGS_KEY = 'auth';
export const TEMP_PASSWORD = process.env.TEMP_PASSWORD || 'pontos2026';
export const MIN_PASSWORD_LENGTH = 4;

export type Profile = 'parent' | `child:${number}`;

interface Account {
  hash: string | null; // null = still on the temporary password
  salt: string | null;
  mustChange: boolean;
  v: number; // bumped on every change/reset to revoke old sessions
}

interface AuthConfig {
  secret: string;
  accounts: Record<string, Account>;
}

export interface Session {
  profile: Profile;
  role: 'parent' | 'child';
  childId: number | null;
  mustChange: boolean;
}

const DEFAULT_ACCOUNT: Account = { hash: null, salt: null, mustChange: true, v: 0 };

// Small per-instance cache so the middleware does not hit the database on
// every request. Password changes made on this instance update it at once.
const CACHE_TTL_MS = 5_000;
let cache: { config: AuthConfig; at: number } | null = null;

export async function getAuthConfig(): Promise<AuthConfig> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.config;

  let [row] = await db.select().from(settings).where(eq(settings.key, AUTH_SETTINGS_KEY));
  if (!row) {
    const initial: AuthConfig = { secret: randomBytes(32).toString('hex'), accounts: {} };
    // If two requests race, the unique key keeps the first one
    await db.insert(settings).values({ key: AUTH_SETTINGS_KEY, value: initial }).onConflictDoNothing();
    [row] = await db.select().from(settings).where(eq(settings.key, AUTH_SETTINGS_KEY));
  }
  const config = row.value as AuthConfig;
  cache = { config, at: Date.now() };
  return config;
}

async function saveAuthConfig(config: AuthConfig) {
  await db.update(settings)
    .set({ value: config, updatedAt: new Date() })
    .where(eq(settings.key, AUTH_SETTINGS_KEY));
  cache = { config, at: Date.now() };
}

export function parseProfile(value: unknown): Profile | null {
  if (value === 'parent') return 'parent';
  if (typeof value === 'string' && /^child:\d+$/.test(value)) return value as Profile;
  return null;
}

/** Login choices: the parent plus every child */
export async function listProfiles() {
  const kids = await db.select({ id: children.id, name: children.name }).from(children).orderBy(asc(children.id));
  return [
    { profile: 'parent' as Profile, label: 'Pai / Mãe' },
    ...kids.map(k => ({ profile: `child:${k.id}` as Profile, label: k.name })),
  ];
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 32).toString('hex');
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function passwordMatches(account: Account, password: string) {
  if (!account.hash || !account.salt) return safeEqual(password, TEMP_PASSWORD);
  return safeEqual(hashPassword(password, account.salt), account.hash);
}

// --- Session tokens -------------------------------------------------------

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function createToken(config: AuthConfig, profile: Profile) {
  const account = config.accounts[profile] ?? DEFAULT_ACCOUNT;
  const payload = Buffer.from(JSON.stringify({ p: profile, v: account.v })).toString('base64url');
  return `${payload}.${sign(payload, config.secret)}`;
}

/** Validates the cookie against the current account version */
export async function readSession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  let config = await getAuthConfig();
  if (!safeEqual(sign(payload, config.secret), signature)) return null;

  let data: { p?: unknown; v?: unknown };
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return null;
  }
  const profile = parseProfile(data.p);
  if (!profile) return null;
  let account = config.accounts[profile] ?? DEFAULT_ACCOUNT;
  if (data.v !== account.v) {
    // The password may have just changed on another instance (or in the
    // route handlers, which keep their own cache): re-read once before refusing
    cache = null;
    config = await getAuthConfig();
    account = config.accounts[profile] ?? DEFAULT_ACCOUNT;
    if (data.v !== account.v) return null;
  }

  return {
    profile,
    role: profile === 'parent' ? 'parent' : 'child',
    childId: profile === 'parent' ? null : Number(profile.slice(6)),
    mustChange: account.mustChange,
  };
}

export const sessionCookie = (token: string) => ({
  name: SESSION_COOKIE,
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE,
});

// --- Account operations ---------------------------------------------------

/** Returns a session token, or null if the password is wrong */
export async function login(profile: Profile, password: string) {
  const config = await getAuthConfig();
  const account = config.accounts[profile] ?? DEFAULT_ACCOUNT;
  if (!passwordMatches(account, password)) return null;
  return { token: createToken(config, profile), mustChange: account.mustChange };
}

export async function changePassword(profile: Profile, current: string, next: string) {
  if (next.length < MIN_PASSWORD_LENGTH) {
    return { error: `A nova senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres` };
  }
  if (safeEqual(next, TEMP_PASSWORD)) {
    return { error: 'Escolha uma senha diferente da provisória' };
  }
  cache = null; // read the latest before writing
  const config = await getAuthConfig();
  const account = config.accounts[profile] ?? DEFAULT_ACCOUNT;
  if (!passwordMatches(account, current)) return { error: 'Senha atual incorreta' };

  const salt = randomBytes(16).toString('hex');
  config.accounts[profile] = { hash: hashPassword(next, salt), salt, mustChange: false, v: account.v + 1 };
  await saveAuthConfig(config);
  return { token: createToken(config, profile) };
}

/** Parent action: puts an account back on the temporary password */
export async function resetPassword(profile: Profile) {
  cache = null;
  const config = await getAuthConfig();
  const account = config.accounts[profile] ?? DEFAULT_ACCOUNT;
  config.accounts[profile] = { hash: null, salt: null, mustChange: true, v: account.v + 1 };
  await saveAuthConfig(config);
}
