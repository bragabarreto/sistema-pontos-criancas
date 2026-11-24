import { NextResponse } from 'next/server';
import { SESSION_COOKIE, login, parseProfile, sessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  let profile = null;
  let password = '';
  try {
    const body = await request.json();
    profile = parseProfile(body?.profile);
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    // invalid body
  }
  if (!profile) return NextResponse.json({ error: 'Escolha quem está entrando' }, { status: 400 });

  try {
    const result = await login(profile, password);
    if (!result) {
      await new Promise(resolve => setTimeout(resolve, 800)); // slow down guessing
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }
    const response = NextResponse.json({
      mustChange: result.mustChange,
      redirect: result.mustChange ? '/trocar-senha' : profile === 'parent' ? '/' : '/acompanhar',
    });
    response.cookies.set(sessionCookie(result.token));
    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Erro ao entrar, tente novamente' }, { status: 500 });
  }
}

/** Logout */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
