// app/solicitar-consulta/page.js
"use client";

import FormularioConsulta from "@/components/ConsultaForm";

export default function SolicitarConsultaPage({ params }) {
  // En caso de que uses enrutamiento por idioma (ej. [lang]/solicitar-consulta)
  const lang = params?.lang || "es";

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