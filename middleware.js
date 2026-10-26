import { NextResponse } from 'next/server';

// Idiomas que soporta tu web
const locales = ['es', 'en', 'it'];
const defaultLocale = 'es';

function getLocale(request) {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return defaultLocale;

  // Analiza las preferencias del navegador
  const preferredLang = acceptLanguage
    .split(',')[0]
    .split('-')[0]
    .toLowerCase();

  return locales.includes(preferredLang) ? preferredLang : defaultLocale;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // IMPORTANTE: Evita intervenir si es un archivo o script (rutas con extensión .js, .png, etc.)
  // que no estén cazadas en el matcher.
  if (pathname.includes('.') || pathname.startsWith('/_next')) {
    return;
  }

  // Comprueba si la ruta ya incluye un idioma válido
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
    // Excluye archivos internos, imágenes, assets, favicon y API
    '/((?!api|_next/static|_next/image|assets|favicon.ico).*)',
  ],
};