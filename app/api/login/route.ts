import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, adminToken, getAdminPassword, safeEqual } from '@/lib/auth';

export async function POST(request: Request) {
  const password = getAdminPassword();
  if (!password) {
    return NextResponse.json({ ok: true, protected: false });
  }

  let attempt = '';
  try {
    const body = await request.json();
    attempt = typeof body?.password === 'string' ? body.password : '';
  } catch {
    // invalid body: treated as wrong password
  }

  if (!safeEqual(attempt, password)) {
    // Small delay to slow down guessing
    await new Promise(resolve => setTimeout(resolve, 800));
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await adminToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return response;
}

/** Logout */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
