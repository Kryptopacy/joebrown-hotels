import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with cross-browser cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login' && request.nextUrl.pathname !== '/admin/pending') {
    if (!user) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    // Check staff status using admin client to bypass RLS quirks in Edge
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminSupabase = supabaseServiceKey 
      ? createClient(supabaseUrl, supabaseServiceKey) 
      : supabase; // Fallback to anon client if missing

    const { data: staffData } = await adminSupabase
      .from('staff_users')
      .select('status')
      .eq('email', user.email)
      .maybeSingle();

    if (!staffData || staffData.status !== 'approved') {
      if (!staffData) {
        // If they don't exist in staff_users, insert them as pending
        await adminSupabase.from('staff_users').insert({
          email: user.email,
          role: 'receptionist', // Default role for new requests
          status: 'pending'
        });
      }
      const url = request.nextUrl.clone()
      url.pathname = '/admin/pending'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
