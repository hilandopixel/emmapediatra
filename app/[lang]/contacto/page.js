// app/solicitar-consulta/page.js
'use client';

import { use } from 'react';

import FormularioConsulta from "@/components/ConsultaForm";

export default function SolicitarConsultaPage({ params }) {
  // Desempaquetamos la promesa `params` usando `use()`
    const resolvedParams = use(params);
    const lang = resolvedParams.lang;

  return (
    <main className="max-w-7xl mx-auto px-6 py-28 space-y-0 text-secondary-custom">
      <div className="relative w-full">
          <img className="relative w-full align-bottom" src="/assets/dra-emma-lopez-contacto.png" alt="Banner" />
          <div 
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              style={{ background: "linear-gradient(135deg, rgba(255,152,186,0.75) 26%, rgba(192,192,192,0.75) 52%, rgba(255,254,255,0.75) 100%)" }}
          />
      </div>
      <section id="contacto"className="hilando-pixel-section">
        <div class="max-w-2xl mx-auto text-center space-y-8 relative z-10">
          <div class="space-y-4">
            <h2 class="text-3xl sm:text-5xl font-extrabold tracking-tight">Contacto</h2>
          </div>
        </div>
        <FormularioConsulta lang={lang} />

      </section>

    </main>
  );
}



