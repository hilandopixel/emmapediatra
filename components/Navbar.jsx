// components/Navbar.jsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ lang: propLang }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Detectamos el idioma actual directamente de la URL (ej: /en/sobre-mi -> 'en')
  // Si falla, usa el prop que le pasamos desde el layout o 'es' por defecto.
  const lang = pathname?.split('/')[1] || propLang || 'es';

  // Función para cambiar de idioma manteniendo la ruta actual
  const getSwitchLanguageUrl = (targetLang) => {
    if (!pathname) return `/${targetLang}`;
    const segments = pathname.split('/');
    segments[1] = targetLang; // Reemplaza el segmento del idioma
    return segments.join('/');
  };

  // Listado completo de idiomas con sus SVGs originales
  const languages = [
    {
      code: 'es',
      label: 'ES',
      svg: (
        <svg className="w-4 h-3.5 rounded-xs shadow-xs object-cover" viewBox="0 0 640 480">
          <path fill="#c12a21" d="M0 0h640v480H0z"/>
          <path fill="#f3a812" d="M0 120h640v240H0z"/>
        </svg>
      ),
      svgMobile: (
        <svg className="w-5 h-4 rounded-xs shadow-xs object-cover" viewBox="0 0 640 480">
          <path fill="#c12a21" d="M0 0h640v480H0z"/>
          <path fill="#f3a812" d="M0 120h640v240H0z"/>
        </svg>
      )
    },
    {
      code: 'en',
      label: 'EN',
      svg: (
        <svg className="w-4 h-3.5 rounded-xs shadow-xs object-cover" viewBox="0 0 640 480">
          <path fill="#012169" d="M0 0h640v480H0z"/>
          <path fill="#fff" d="m75 0 245 180L565 0h75v55L395 240l245 185v55h-75L320 300 75 480H0v-55l245-185L0 55V0z"/>
          <path fill="#C8102E" d="m425 300 215 160v20L380 280zM215 180 0 20V0l260 200zM640 0v20L380 200l260-180zM0 480v-20l260-180L0 460z"/>
          <path fill="#fff" d="M240 0h160v480H240zM0 160h640v160H0z"/>
          <path fill="#C8102E" d="M280 0h80v480h-80zM0 200h640v80H0z"/>
        </svg>
      ),
      svgMobile: (
        <svg className="w-5 h-4 rounded-xs shadow-xs object-cover" viewBox="0 0 640 480">
          <path fill="#012169" d="M0 0h640v480H0z"/>
          <path fill="#fff" d="m75 0 245 180L565 0h75v55L395 240l245 185v55h-75L320 300 75 480H0v-55l245-185L0 55V0z"/>
          <path fill="#C8102E" d="m425 300 215 160v20L380 280zM215 180 0 20V0l260 200zM640 0v20L380 200l260-180zM0 480v-20l260-180L0 460z"/>
          <path fill="#fff" d="M240 0h160v480H240zM0 160h640v160H0z"/>
          <path fill="#C8102E" d="M280 0h80v480h-80zM0 200h640v80H0z"/>
        </svg>
      )
    },
    {
      code: 'it',
      label: 'IT',
      svg: (
        <svg className="w-4 h-3.5 rounded-xs shadow-xs object-cover" viewBox="0 0 640 480">
          <path fill="#009246" d="M0 0h213.3v480H0z"/>
          <path fill="#fff" d="M213.3 0h213.4v480H213.3z"/>
          <path fill="#ce2b37" d="M426.7 0H640v480H426.7z"/>
        </svg>
      ),
      svgMobile: (
        <svg className="w-4 h-3.5 rounded-xs shadow-xs object-cover" viewBox="0 0 640 480">
          <path fill="#009246" d="M0 0h213.3v480H0z"/>
          <path fill="#fff" d="M213.3 0h213.4v480H213.3z"/>
          <path fill="#ce2b37" d="M426.7 0H640v480H426.7z"/>
        </svg>
      )
    }
  ];

  // Filtramos para mostrar únicamente los idiomas que NO son el actual
  const availableLanguages = languages.filter((item) => item.code !== lang);

  // Textos traducidos para los enlaces del menú según el idioma actual
  const navText = {
    es: { sobreMi: "Sobre mí", pideCita: "Pide cita", dudas: "Dudas frecuentes", contacto: "Contacto", blog: "Blog", recursos: "Área privada" },
    en: { sobreMi: "About me", pideCita: "Book an appointment", dudas: "FAQs", contacto: "Contact", blog: "Blog", recursos: "Private area" },
    it: { sobreMi: "Chi sono", pideCita: "Prenota appuntamento", dudas: "Domande Frequenti ", contacto: "Contatti", blog: "Blog", recursos: "Area privata" }
  };

  const t = navText[lang] || navText.es;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md shadow-xs w-full text-white bg-[linear-gradient(135deg,_rgba(255,152,186,0.75)_26%,_rgba(192,192,192,0.75)_52%,_rgba(255,254,255,0.75)_100%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center">
          <img src="/assets/logo.png" alt="Emma Pediatra Gastroenteróloga Córdoba" className="h-8 w-auto object-contain" />
        </Link>

        {/* Menú Escritorio */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href={`/${lang}/sobre-mi`} className="hover:text-pink-600 transition">{t.sobreMi}</Link>
          <Link href={`/${lang}/pide-cita`} className="hover:text-pink-600 transition">{t.pideCita}</Link>
          <Link href={`/${lang}/dudas-frecuentes`} className="hover:text-pink-600 transition">{t.dudas}</Link>
          <Link href={`/${lang}/contacto`} className="hover:text-pink-600 transition">{t.contacto}</Link>
          <Link href={`/${lang}/blog`} className="hover:text-pink-600 transition">{t.blog}</Link>
          <Link href={`/${lang}/area-privada`} className="hover:text-pink-600 transition">{t.recursos}</Link>
          
          <div className="flex items-center space-x-3 text-xs font-bold pl-4 border-l border-slate-200">
            {availableLanguages.map((item, index) => (
              <div key={item.code} className="flex items-center space-x-3">
                {index > 0 && <span className="text-pink-300">|</span>}
                <Link 
                  href={getSwitchLanguageUrl(item.code)} 
                  className="hover:text-pink-600 cursor-pointer flex items-center gap-1.5 transition"
                >
                  {item.svg}
                  <span>{item.label}</span>
                </Link>
              </div>
            ))}

            <span className="text-pink-300">|</span>

            <a 
              href="https://www.linkedin.com/in/emmal%C3%B3pezpediatrac%C3%B3rdoba" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Visita mi perfil de LinkedIn"
              className="w-10 h-10 hover:bg-[#006097] text-white flex items-center justify-center transition transform hover:scale-110 rounded-full"
            >
              <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path>
              </svg>
            </a>
          </div>
        </nav>

        {/* Botón Menú Móvil */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          id="menu-btn" 
          className="bg-primary-custom text-white md:hidden focus:outline-none p-2 rounded-lg hover:bg-opacity-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden flex flex-col text-primary-custom bg-secondary-custom py-4 px-6 space-y-3 shadow-lg">
          <Link href={`/${lang}/sobre-mi`} onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-pink-600 transition">{t.sobreMi}</Link>
          <Link href={`/${lang}/pide-cita`} onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-pink-600 transition">{t.pideCita}</Link>
          <Link href={`/${lang}/dudas-frecuentes`} onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-pink-600 transition">{t.dudas}</Link>
          <Link href={`/${lang}/contacto`} onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-pink-600 transition">{t.contacto}</Link>
          <Link href={`/${lang}/blog`} onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-pink-600 transition">{t.blog}</Link>
          <Link href={`/${lang}/area-privada`} onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-pink-600 transition">{t.recursos}</Link>
          
          <div className="flex items-center space-x-6 pt-4 border-t border-pink-800 text-xs font-bold ">
            {availableLanguages.map((item) => (
              <Link 
                key={item.code}
                href={getSwitchLanguageUrl(item.code)}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 cursor-pointer py-1 text-primary-custom bg-secondary-custom hover:text-pink-300 transition"
              >
                {item.svgMobile}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}