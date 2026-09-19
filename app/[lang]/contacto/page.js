import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

const pageId = "contacto";
const staticDocs = {
  seo:{
        es:{
              title: "Contacto | Dra. EMMA LÓPEZ RUBIO Pediatra gastroenteróloga en Córdoba | Especialista en digestivo y trastornos de la conducta alimentaria",
              description: "Soy la Dra. Emma López Rubio, pediatra especializada en gastroenterología, hepatología y nutrición infantil en Córdoba.",
              keywords: "digestivo infantil, pediatria, conducta alimentaria, gastroenteróloga"
            },
        en:{
              title: "Contact | Dr. Emma López Rubio, Pediatric Gastroenterologist",
              description: "Get in touch to request a video consultation, ask about courses and seminars, or send a message to Dr. Emma López Rubio's pediatric digestive health practice.",
              keywords: "contact pediatric gastroenterologist, request video consultation online"
        },
        it: {
              title: "Contatti | Dott.ssa Emma López Rubio, Gastroenterologa Pediatrica",
              description: "Contattaci per richiedere una videovisita, chiedere informazioni su corsi e seminari o inviare un messaggio allo studio di gastroenterologia pediatrica della Dott.ssa Emma López Rubio.",
              keywords: "contatta gastroenterologo pediatrico, prenota videovisita online"
        }
      },
      content: {
        image:"/assets/dra-emma-lopez-contacto.png",
        es: {  
            sections:{
              contacto:{
                order: 3,
                title: "Contacto",
                htmlEmbbeded: "<iframe loading='lazy' src='https://docs.google.com/forms/d/e/1FAIpQLSfxM_IzTLc6uwlwELg1G7ktqmn2Qny-Gmwg23WB1NBBUEiaGw/viewform?embedded=true' width='100%' height='1800' frameborder='0' marginheight='0' marginwidth='0'>Cargando…</iframe>",
              }
              }
            },
        en:{
              sections:{
              contact:{
                order: 3,
                title: "Contact",
                htmlEmbbeded: "<iframe loading='lazy' src='https://docs.google.com/forms/d/e/1FAIpQLSfxM_IzTLc6uwlwELg1G7ktqmn2Qny-Gmwg23WB1NBBUEiaGw/viewform?embedded=true' width='100%' height='1800' frameborder='0' marginheight='0' marginwidth='0'>Cargando…</iframe>",
              }
            }
            },
            it:{
              sections:{
              contact:{
                order: 3,
                title: "Contatti",
                htmlEmbbeded: "<iframe loading='lazy' src='https://docs.google.com/forms/d/e/1FAIpQLSfxM_IzTLc6uwlwELg1G7ktqmn2Qny-Gmwg23WB1NBBUEiaGw/viewform?embedded=true' width='100%' height='1800' frameborder='0' marginheight='0' marginwidth='0'>Cargando…</iframe>",
              }
            }
            },
          }
      };


export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "es";

  try {
    const docRef = doc(db, "pages", pageId);
    const docSnap = await getDoc(docRef);    
    const data = docSnap?.data();
    const seo = data?.seo?.[lang] || staticDocs?.seo?.[lang] || data?.seo?.["es"] || { title: pageId };
    return {
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords
    };
  } catch (error) {
    console.error("Error al cargar SEO desde Firebase:", error);
    return { title: "Sobre mí" };
  }
}

export default async function ContactoPage({ params }) {
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
      fetchError = "Error al recuperar los datos desde la base de datos.";
    }
  } catch (error) {
    console.error("Error al conectar con base de datos:", error);
    fetchError = error.message;
  }

  const contentTranslation = pageData?.content?.[lang] || staticDocs?.content[lang] || pageData?.content?.["es"];
  const pageSettings =  pageData?.content || staticDocs?.content;
  const sectionsArray = contentTranslation?.sections 
    ? Object.entries(contentTranslation?.sections)
        .map(([key, section]) => ({ id: key, ...section }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // Orden ascendente por 'order'
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