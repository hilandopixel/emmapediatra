import './globals.css';
import Navbar from "@/components/Navbar";
import StickyBar from "@/components/StickyBar";
import Footer from "@/components/Footer";

export default async function LangLayout({ children, params }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "es";
  return (
    <html lang={lang}>
      <body className="min-h-screen antialiased text-secondary-custom">
        
        {/* Aquí usas el componente Navbar pasándole el idioma */}
        <Navbar lang={lang} />

        {/* Aquí se renderiza el contenido de cada página */}
        {children}
        
        <StickyBar />
        <Footer lang={lang} />
      </body>
    </html>
  );
}