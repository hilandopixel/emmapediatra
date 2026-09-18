// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/es', request.url));
  }
}

export const config = {
  matcher: ['/'],
};