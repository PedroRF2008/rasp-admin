import { NextResponse } from 'next/server';

const publicRoutes = ['/login'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Firebase handles auth state, we just need to handle public routes
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // All other routes are protected by Firebase's client SDK
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logos).*)'],
}; 