// app/solicitar-consulta/page.js
'use client';

import { use } from 'react';

import FormularioConsulta from "@/components/ConsultaForm";

export default function SolicitarConsultaPage({ params }) {
  // Desempaquetamos la promesa `params` usando `use()`
    const resolvedParams = use(params);
    const lang = resolvedParams.lang;

  return (
    <main className="min-h-screen py-16 px-4 hilando-pixel-section">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-extrabold text-primary-custom sm:text-4xl">
          Solicitar consulta | Contacto
        </h1>
      </div>

      <FormularioConsulta lang={lang} />
    </main>
  );
}