/**
 * Next.js Middleware
 * 
 * Handles authentication and redirects
 * 
 * Note: Next.js 16 shows a deprecation warning for middleware.ts in favor of proxy.ts.
 * This is intentional - we're keeping middleware.ts for now as it works correctly.
 * The warning is harmless and doesn't affect functionality.
 * To migrate in the future: rename file to proxy.ts and change function name to proxy.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip middleware for auth callback routes to avoid consuming OAuth flow state
  if (request.nextUrl.pathname.startsWith('/api/auth/callback')) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect_to', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Note: Database checks (onboarding, user profile) are handled in API routes
    // Middleware runs on Edge Runtime which doesn't support Prisma
    // API routes will redirect to onboarding if user profile is missing
  }

  // Allow onboarding access for authenticated users
  if (request.nextUrl.pathname.startsWith('/onboarding') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from login
  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

