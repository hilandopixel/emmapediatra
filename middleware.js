import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Si entran exactamente a la raíz '/', redirige a '/es'
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/es', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Ignora archivos estáticos, carpetas internas (_next) y favicon para evitar el error 500
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};