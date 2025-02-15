// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/', '/auth/login', '/auth/google/callback']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Allow public paths
  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }
  
  // Check for the user_session cookie specifically
  const session = request.cookies.get('user_session')
  
  if (!session) {
    // Redirect to login if no session
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}