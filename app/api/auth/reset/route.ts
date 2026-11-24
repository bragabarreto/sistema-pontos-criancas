import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, parseProfile, readSession, resetPassword } from '@/lib/auth';

/** Parent only: puts an account back on the temporary password */
export async function POST(request: Request) {
  const session = await readSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (session?.role !== 'parent' || session.mustChange) {
    return NextResponse.json({ error: 'Acesso não permitido' }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const profile = parseProfile(body?.profile);
  if (!profile || profile === 'parent') {
    return NextResponse.json({ error: 'Perfil inválido' }, { status: 400 });
  }
  await resetPassword(profile);
  return NextResponse.json({ ok: true });
}
