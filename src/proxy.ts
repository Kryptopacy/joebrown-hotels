import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

import { NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  // If the user lands on the root with a code (e.g. from Supabase OAuth redirect)
  if (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.has('code')) {
    const code = request.nextUrl.searchParams.get('code');
    const redirectUrl = new URL('/auth/callback', request.url);
    redirectUrl.searchParams.set('code', code!);
    redirectUrl.searchParams.set('next', '/admin');
    return NextResponse.redirect(redirectUrl);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|llms-full.txt|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
