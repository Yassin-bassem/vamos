import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const { pathname } = request.nextUrl

  // Check for demo bypass cookie / role selection
  const demoRole = request.cookies.get('vamos_demo_role')?.value

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    // Demo / offline mode: allow access or route to login
    if (!demoRole && !pathname.startsWith('/auth') && pathname !== '/') {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    if (demoRole && pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (pathname.startsWith('/auth')) {
      if (user || demoRole) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return supabaseResponse
    }

    if (!user && !demoRole && !pathname.startsWith('/auth') && pathname !== '/') {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  } catch (e) {
    // Fallback if supabase client fails
    console.error('Supabase middleware error:', e)
  }

  return supabaseResponse
}
