import './globals.css';
import Navbar from "@/components/Navbar";
import StickyBar from "@/components/StickyBar";
import Footer from "@/components/Footer";

export default async function LangLayout({ children, params }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "es";
  return (
    <html lang={lang}>
      <head>
        <script src="https://www.googletagmanager.com/gtag/js?id=G-5PY5WPDGE2" strategy="afterInteractive" />
        <script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5PY5WPDGE2');
          `}
        </script>
      </head>
      <body className="min-h-screen antialiased text-secondary-custom">
        <Navbar lang={lang} />
        {children}
        <StickyBar />
        <Footer lang={lang} />
      </body>
    </html>
  );
}