import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, readSession } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/profiles', '/api/health'];
const CHANGE_PASSWORD_PATHS = ['/trocar-senha', '/api/auth/password', '/api/auth/me', '/api/auth/login'];
// What a child may read; anything else (and every write) is parent-only
const CHILD_READ_API = ['/api/children', '/api/activities', '/api/expenses', '/api/custom-activities', '/api/settings'];
const CHILD_SCOPED_API = ['/api/activities', '/api/expenses', '/api/custom-activities'];

const matches = (path: string, list: string[]) => list.some(p => path === p || path.startsWith(p + '/'));

function deny(request: NextRequest, isApi: boolean, status: number, redirectTo: string) {
  if (isApi) {
    return NextResponse.json({ error: status === 401 ? 'Faça login' : 'Acesso não permitido' }, { status });
  }
  const url = new URL(redirectTo, request.url);
  if (redirectTo === '/login') url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');

  if (matches(pathname, PUBLIC_PATHS)) return NextResponse.next();

  let session;
  try {
    session = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  } catch (error) {
    // Database unavailable (e.g. cold start): fail closed
    console.error('Auth check failed:', error);
    return isApi
      ? NextResponse.json({ error: 'Serviço indisponível, tente novamente' }, { status: 503 })
      : new NextResponse('Serviço indisponível, recarregue a página em instantes.', { status: 503 });
  }

  if (!session) return deny(request, isApi, 401, '/login');

  if (session.mustChange && !matches(pathname, CHANGE_PASSWORD_PATHS)) {
    return deny(request, isApi, 403, '/trocar-senha');
  }

  if (session.role === 'parent') return NextResponse.next();

  // Child: only the read-only page and its reads
  if (!isApi) {
    return pathname === '/acompanhar' || pathname === '/trocar-senha'
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/acompanhar', request.url));
  }
  if (matches(pathname, CHANGE_PASSWORD_PATHS)) return NextResponse.next();
  if (request.method !== 'GET' || !matches(pathname, CHILD_READ_API)) {
    return deny(request, true, 403, '/acompanhar');
  }
  if (pathname === '/api/settings' && searchParams.get('key') !== 'multipliers') {
    return deny(request, true, 403, '/acompanhar');
  }
  // A child only sees their own records
  if (matches(pathname, CHILD_SCOPED_API) && searchParams.get('childId') !== String(session.childId)) {
    return deny(request, true, 403, '/acompanhar');
  }
  if (pathname.startsWith('/api/children/') && pathname !== `/api/children/${session.childId}`) {
    return deny(request, true, 403, '/acompanhar');
  }
  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs',
  // Everything except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)'],
};
