import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "es";
  
  try {
    const docRef = doc(db, "pages", "sobre-mi");
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return { title: "Sobre mí" };
    
    const data = docSnap.data();
    const seo = data?.seo?.[lang] || data?.seo?.["es"] || { title: "Sobre mí" };

    return {
      title: seo.title,
      description: seo.description || "",
    };
  } catch (error) {
    console.error("Error al cargar SEO desde Firebase:", error);
    return { title: "Sobre mí" };
  }
}

export default async function SobreMiPage({ params }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "es";

  let pageData = null;
  let fetchError = null;

  try {
    const docRef = doc(db, "pages", "sobre-mi");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      pageData = docSnap.data();
    } else {
      fetchError = "El documento 'sobre-mi' no existe en la colección 'pages' de Firestore.";
    }
  } catch (error) {
    console.error("Error al conectar con Firebase Firestore:", error);
    fetchError = error.message;
  }

  // Extraer contenido de forma segura
  const content = pageData?.content?.[lang] || pageData?.content?.["es"];
  return (
<main className="max-w-7xl mx-auto px-6 py-28 space-y-36 text-secondary-custom ">
        <section id="sobre-mi" className="hilando-pixel-section">
            <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
                <img src={pageData?.content?.image}
                alt={content?.imageAlt || "Emma Pediatra"}
                className="relative w-full h-[480px] object-contain"/>

                <h2><div className="text-lg font-light leading-relaxed" dangerouslySetInnerHTML={{__html: content.text}} /></h2>
                <div className="pt-2">
                    <a href="/contacto" target="_blank" className="inline-block px-10 py-4 bg-primary-custom hover:bg-[#266360] text-white font-bold rounded-xl transition transform hover:scale-115" data-i18n="sobre_mi_button_text">
                        Contactar conmigo
                    </a>
                </div>
            </div>
        </section>
    </main>
  );
}