import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  const demoRole = request.cookies.get('vamos_demo_role')?.value

  // Static files or api routes pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // images, logo, favicon, etc.
  ) {
    return NextResponse.next()
  }

  // Root redirect
  if (pathname === '/') {
    if (demoRole) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If user is accessing dashboard but has no session, redirect to login
  if (pathname.startsWith('/dashboard') && !demoRole) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If user is already logged in and hits /auth/login, send to dashboard
  if (pathname.startsWith('/auth') && demoRole) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}
