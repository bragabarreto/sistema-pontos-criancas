import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, adminToken, getAdminPassword, safeEqual } from '@/lib/auth';

// Pages and endpoints anyone can open (the kids' read-only view)
const PUBLIC_PAGES = ['/acompanhar', '/login'];
const PUBLIC_API = ['/api/login', '/api/health'];
// Read-only data the kids' page needs (GET only)
const PUBLIC_READ_API = [
  '/api/children',
  '/api/activities',
  '/api/expenses',
  '/api/custom-activities',
  '/api/settings',
];

const matches = (path: string, prefixes: string[]) =>
  prefixes.some(p => path === p || path.startsWith(p + '/'));

export async function middleware(request: NextRequest) {
  const password = getAdminPassword();
  if (!password) return NextResponse.next(); // protection disabled

  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');

  if (matches(pathname, PUBLIC_PAGES) || matches(pathname, PUBLIC_API)) {
    return NextResponse.next();
  }
  if (isApi && request.method === 'GET' && matches(pathname, PUBLIC_READ_API)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(ADMIN_COOKIE)?.value ?? '';
  if (cookie && safeEqual(cookie, await adminToken(password))) {
    return NextResponse.next();
  }

  if (isApi) {
    return NextResponse.json({ error: 'Acesso restrito ao responsável' }, { status: 401 });
  }
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Everything except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)'],
};
