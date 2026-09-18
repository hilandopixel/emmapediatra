import { NextResponse } from 'next/server';

export function middleware(request) {
  return NextResponse.redirect(new URL('/es', request.url));
}

// Esto obliga a que el middleware SOLO se ejecute cuando entren a la raíz exacta, 
// evitando que afecte a cualquier otra página, archivo estático o imagen.
export const config = {
  matcher: ['/'],
};