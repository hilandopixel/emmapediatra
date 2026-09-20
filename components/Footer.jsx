"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import staticFooter from "@/app/footer.json";

export default function Footer({ lang: propLang }) {
  const pathname = usePathname();
  
  // Detecta el idioma actual desde la URL (ej: /it/dudas-frecuentes -> 'it')
  const lang = pathname?.split('/')[1] || propLang || 'es';

  // Selecciona el contenido del JSON según el idioma detectado (con fallback a 'es')
  const content = staticFooter?.[lang] || staticFooter?.["es"] || {};

  return (
    <footer className="bg-primary-custom text-white py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto text-center text-sm text-white/70">
        <p>
          © {new Date().getFullYear()} {content.text || "Dra. Emma López Rubio"} | Designed by{" "}
          <a href="https://hilandopixel.com" target="_blank" rel="noopener noreferrer" className="underline">
            HilandoPixel
          </a>
        </p>
      </div>
    </footer>
  );
}