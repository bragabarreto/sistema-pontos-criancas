import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, changePassword, readSession, sessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await readSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: 'Faça login' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const current = typeof body?.current === 'string' ? body.current : '';
  const next = typeof body?.next === 'string' ? body.next : '';

  const result = await changePassword(session.profile, current, next);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const response = NextResponse.json({ redirect: session.role === 'parent' ? '/' : '/acompanhar' });
  response.cookies.set(sessionCookie(result.token));
  return response;
}
