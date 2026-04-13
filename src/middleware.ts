import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle auth callback
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.includes('/dashboard')) {
    const { user, supabaseResponse } = await updateSession(request);

    if (!user) {
      const loginUrl = new URL('/en/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  }

  // Apply i18n middleware for public routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|fr)/:path*', '/dashboard/:path*', '/auth/:path*'],
};
