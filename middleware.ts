import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { guestRegex, isDevelopmentEnvironment } from './lib/constants';

export async function middleware(request: NextRequest) {
  const { pathname, search, origin: requestOrigin } = request.nextUrl;

  // Determine the base URL for redirects.
  // 1. Use AUTH_URL if set (recommended for proxied environments).
  // 2. Fallback to x-forwarded-host/proto headers if AUTH_URL is not set.
  // 3. As a last resort, use the origin from the request (which might be localhost).
  let baseOrigin: string;
  const authUrlEnv = process.env.AUTH_URL;

  if (authUrlEnv) {
    baseOrigin = new URL(authUrlEnv).origin;
  } else {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    if (forwardedHost && forwardedProto) {
      baseOrigin = `${forwardedProto}://${forwardedHost}`;
    } else {
      baseOrigin = requestOrigin;
      if (!isDevelopmentEnvironment) {
        console.warn(
          `AUTH_URL is not set and x-forwarded-* headers are not present. ` +
          `Falling back to request origin: ${baseOrigin}. ` +
          `Redirects may be incorrect if behind a reverse proxy.`,
        );
      }
    }
  }

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  if (pathname.startsWith('/api/auth')) {
    // next-auth handles its own routes; let them pass through.
    // It should use AUTH_URL internally if set.
    return NextResponse.next();
  }

  const authUrlString = process.env.AUTH_URL;
  // Determine if AUTH_URL is configured for HTTPS.
  const authUrlIsHttps = authUrlString ? new URL(authUrlString).protocol === 'https:' : false;

  // Determine the cookie name. For next-auth v5, it's 'authjs.session-token'.
  // It's prefixed with '__Secure-' if AUTH_URL is HTTPS and not localhost.
  let cookieNameToUse = "authjs.session-token";
  if (authUrlIsHttps && authUrlString && new URL(authUrlString).hostname !== 'localhost') {
    cookieNameToUse = `__Secure-${cookieNameToUse}`;
  }
  
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    // Explicitly set secureCookie based on AUTH_URL's protocol.
    // If AUTH_URL is HTTPS, next-auth's core handlers will set a Secure cookie.
    // getToken must therefore expect a Secure cookie, regardless of the incoming request's protocol (which might be HTTP if behind a proxy).
    secureCookie: authUrlIsHttps,
    // Explicitly set the cookie name, including the __Secure- prefix if applicable.
    cookieName: cookieNameToUse,
  });

  if (!token) {
    // User is not authenticated, redirect to guest login.
    // Construct the intended URL using the determined baseOrigin.
    const intendedUrl = new URL(pathname + search, baseOrigin).toString();
    const encodedIntendedUrl = encodeURIComponent(intendedUrl);
    
    // Construct the guest login URL using the baseOrigin.
    const guestLoginUrl = new URL(
      `/api/auth/guest?redirectUrl=${encodedIntendedUrl}`,
      baseOrigin,
    );
    return NextResponse.redirect(guestLoginUrl);
  }

  const isGuest = guestRegex.test(token?.email ?? '');

  if (token && !isGuest && ['/login', '/register'].includes(pathname)) {
    // Authenticated non-guest users trying to access login/register should be redirected to home.
    // Construct the home URL using the baseOrigin.
    return NextResponse.redirect(new URL('/', baseOrigin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/api/:path*',
    '/login',
    '/register',

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
