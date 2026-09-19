import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

const pageId = "areaPrivada";
const staticDocs = {
  seo:{
        es:{
              title: "Área Privada | Dra. EMMA LÓPEZ RUBIO Pediatra gastroenteróloga en Córdoba | Especialista en digestivo y trastornos de la conducta alimentaria",
              description: "",
              keywords: ""
            },
        en:{
              title: "Your private area",
              description: "",
              keywords: ""
        },
        it: {
              title: "[IT] Área Privada",
              description: "",
              keywords: ""
        }
      },
      content: {
        es: {  
            sections:{
                areaPrivada: 
                { 
                  order: 0,
                  title: "Tu área Privada",
                  text: "En construcción.",
                }
              }
            },
        en:{
              sections:{
                areaPrivada: 
                { 
                  order: 0,
                  title: "Your private area",
                  text: "Under construction.",
                }
              }
            },
            it:{
              sections:{
                areaPrivada: 
                { 
                  order: 0,
                  title: "La tua area privata",
                  text: "In costruzione.",
                }
              }
            },
          }
      };


export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "es";
  let seo = staticDocs?.seo?.[lang];

  try {
    const docRef = doc(db, "pages", pageId);
    const docSnap = await getDoc(docRef);    
    const data = docSnap?.data();
    seo = data?.seo?.[lang] || seo;
  } catch (error) {
    console.error("Error:", error);
  }
  return {
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords
    };
}


export default async function AreaPrivadaPage({ params }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "es";

  let pageData = null;
  let fetchError = null;
  try {
    const docRef = doc(db, "pages", pageId);
    const docSnap = getDoc(docRef);
    
    if ((await docSnap).exists()) {
      pageData = (await docSnap).data();
    } else {
      fetchError = "Error";
    }
  } catch (error) {
    console.error("Error", error);
    fetchError = error.message;
  }

  const contentTranslation = pageData?.content?.[lang] || staticDocs?.content[lang] || pageData?.content?.["es"];
  const pageSettings =  pageData?.content || staticDocs?.content;
  const sectionsArray = contentTranslation?.sections 
    ? Object.entries(contentTranslation?.sections)
        .map(([key, section]) => ({ id: key, ...section }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  return (
    <main className="max-w-7xl mx-auto px-6 py-28 space-y-0 text-secondary-custom">
        {/* Imagen: Solo se pinta si tiene contenido válido */}
        {pageSettings?.image && pageSettings?.image.trim() !== "" && (
          <div className="relative w-full">
              <img 
              className="relative w-full align-bottom"  
              src={pageSettings?.image} 
              />
              <div 
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  style={{
                      background: "linear-gradient(135deg, rgba(255,152,186,0.75) 26%, rgba(192,192,192,0.75) 52%, rgba(255,254,255,0.75) 100%)"
                  }}
              />
          </div>
        )}

      {sectionsArray.map((section) => {
        // Validación opcional: Si toda la sección no tiene contenido útil o 'order' falta, puedes omitirla
        if (!section) return null;

        return (
          <section key={section.id} id={section.id} className="hilando-pixel-section">
             <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
                
                {/* Imagen: Solo se pinta si tiene contenido válido */}
                {section.image && section.image.trim() !== "" && (
                  <img 
                  className="relative w-full h-[480px] object-contain"  
                  src={section.image} 
                    alt={section.imageAlt && section.imageAlt.trim() !== "" ? section.imageAlt : "Imagen descriptiva"} 
                  />
                )}

                {/* Título: Solo se pinta si no es nulo, vacío o espacios en blanco */}
                {section.title && section.title.trim() !== "" && (
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight" dangerouslySetInnerHTML={{ __html: section.title }} />
                )}

                {/* Texto descriptivo: Omitido si está vacío o es nulo */}
                {section.text && section.text.trim() !== "" && (
                  <p className="text-lg font-light leading-relaxed" dangerouslySetInnerHTML={{ __html: section.text }} />
                )}

                {/* Botón: Solo se muestra si ambos (enlace y texto) tienen valores válidos */}
                {section.buttonLink && section.buttonLink.trim() !== "" && 
                section.buttonText && section.buttonText.trim() !== "" && (
                  <a href={section.buttonLink} className="button-link inline-block px-10 py-4 bg-primary-custom hover:bg-[#266360] text-white font-bold rounded-xl  transition transform hover:scale-115">
                    {section.buttonText}
                  </a>
                )}

                {/* Contenido incrustado (YouTube, etc.): Omitido si está vacío */}
                {section.htmlEmbbeded && section.htmlEmbbeded.trim() !== "" && (
                  <div dangerouslySetInnerHTML={{ __html: section.htmlEmbbeded }} />
                )}
                
            </div>

          </section>
        );
      })}
    </main>
  );
}