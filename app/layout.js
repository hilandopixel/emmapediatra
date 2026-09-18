import './globals.css';
import Navbar from "@/components/Navbar";

export default async function LangLayout({ children, params }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "es";

  return (
    <html lang={lang}>
      <body className="bg-gray-50 antialiased">
        
        {/* Aquí usas el componente Navbar pasándole el idioma */}
        <Navbar lang={lang} />

        {/* Aquí se renderiza el contenido de cada página */}
        {children}
        
      </body>
    </html>
  );
}