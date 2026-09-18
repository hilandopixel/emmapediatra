import { NextResponse } from 'next/server.js';

export function middleware(request) {
  // Redirige únicamente la raíz '/' hacia '/es'
  return NextResponse.redirect(new URL('/es', request.url));
}

// Configuración para que el middleware solo actúe en la ruta raíz exacta
export const config = {
  matcher: ['/'],
};