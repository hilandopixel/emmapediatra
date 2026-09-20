import { NextResponse } from 'next/server';

// Idiomas que soporta tu web
const locales = ['es', 'en', 'it'];
const defaultLocale = 'es';

function getLocale(request) {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return defaultLocale;

  // Analiza las preferencias del navegador (ej: "it-IT,it;q=0.9,en-US;q=0.8")
  const preferredLang = acceptLanguage
    .split(',')[0]
    .split('-')[0]
    .toLowerCase();

  return locales.includes(preferredLang) ? preferredLang : defaultLocale;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Comprueba si la ruta ya incluye un idioma válido (ej: /es/sobre-mi, /en/contacto)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Si el usuario entra a la raíz pura ("/") sin idioma, detectamos y redirigimos
  const locale = getLocale(request);
  
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Excluye archivos internos, imágenes, assets y llamadas a API para que no sufran redirecciones
    '/((?!api|_next/static|_next/image|assets|favicon.ico).*)',
  ],
};