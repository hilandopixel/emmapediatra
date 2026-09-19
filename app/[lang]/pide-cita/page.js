import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

const pageId = "pideCita";
const staticDocs = {
  seo:{
        es:{
              title: "Dudas frecuentes | Dra. EMMA LÓPEZ RUBIO Pediatra gastroenteróloga en Córdoba | Especialista en digestivo y trastornos de la conducta alimentaria",
              description: "Soy la Dra. Emma López Rubio, pediatra especializada en gastroenterología, hepatología y nutrición infantil en Córdoba.",
              keywords: "digestivo infantil, pediatria, conducta alimentaria, gastroenteróloga"
            },
        en:{
              title: "Children's Digestive Health FAQ | Reflux, Constipation, Allergies & Celiac Disease",
              description: "Answers to the most common questions about children's digestive health: reflux, constipation, abdominal pain, food allergies, celiac disease, and cow's milk protein allergy (CMPA).",
              keywords: "child reflux FAQ, childhood constipation questions, celiac disease children FAQ, CMPA baby symptoms"
        },
        it: {
              title: "Prenota una Videovisita | Gastroenterologia Pediatrica – Dott.ssa Emma López Rubio",
              description: "Richiedi una videovisita per i sintomi digestivi di tuo figlio — reflusso, stitichezza, allergie, celiachia — da qualsiasi parte del mondo. Visite in presenza disponibili anche a Cordova, Spagna.",
              keywords: "prenota videovisita pediatrica, televisita pediatrica gastroenterologia, appuntamento online gastroenterologo bambini"
        }
      },
      content: {
        image:"/assets/dra-emma-lopez-cita.png",
        es: {  
            sections:{
              citaCordoba: 
              { 
                order: 1,
                title: "Si resides en Córdoba​",
                text: "La consulta de gastroenterología y digestivo infantil en Córdoba se encuentra en el centro de especialidades pediátricas de IHP, en Avenida Cañito Bazán número 2. Puedes pedir cita presencial llamando al 954 61 00 22, desde la app de IHP Pediatría o a través del botón «Agenda tu cita presencial» Si tienes seguro médico privado, puedes consultar fácilmente si existe convenio con tu aseguradora en el apartado «Nuestras aseguradoras»",
                buttonLink: "https://ihppediatria.com/",
                buttonText: "AGENDA TU CITA PRESENCIAL",
              },
              videoConsulta: 
              { 
                order: 2,
                title: "Si no resides en Córdoba",
                text: "Si no resides en Córdoba capital, también es posible valorar tu caso mediante videoconsulta rellenando el formulario del apartado «Solicita tu videoconsulta». En cada situación revisaremos primero el motivo de consulta (dolor abdominal, reflujo, estreñimiento, alergias, celiaquía, etc.) y confirmaremos si la valoración puede hacerse online o es imprescindible la exploración presencial.",
                buttonLink: "/es/contacto",
                buttonText: "SOLICITA TU VIDEOCONSULTA",
              }
            }
            },
        en:{
            sections:{
              intro: 
              { 
                order: 0,
                text: "Wherever you live, you can request a video consultation to have your child's digestive symptoms assessed. In-person visits are also available for families based in Córdoba, Spain.",
              },
              onlineVideoConsulation: 
              { 
                order: 1,
                title: "Online Video Consultation",
                text: "You can have your child's case assessed from anywhere in the world through a secure video consultation, by filling in the form in the “Request Your Video Consultation” section.<br>In every case, we'll first review the reason for the consultation (abdominal pain, reflux, constipation, allergies, celiac disease, etc.) and confirm together whether the assessment can be carried out online or whether an in-person examination is required.",
                buttonLink: "/en/contacto",
                buttonText: "REQUEST YOUR VIDEO CONSULTATION",
              },
              visiteCordoba: 
              { 
                order: 2,
                title: "In-Person Visits in Córdoba, Spain",
                text: "For patients based in or near Córdoba, in-person pediatric gastroenterology visits are available at the IHP pediatric specialty center, Avenida Cañito Bazán 2, Córdoba.<br>In-person appointments can be booked by phone (+34 954 61 00 22), through the IHP Pediatría app, or via the “Book Your In-Person Appointment” button.<br>If you have private health insurance, you can check whether your provider has an agreement with the clinic in the “Our Insurance Providers” section.",
                buttonLink: "https://ihppediatria.com/",
                buttonText: "BOOK YOUR IN-PERSON APPOINTMENT",
              }
            }
            },
            it:{
              sections:{
              intro: 
              { 
                order: 0,
                text: "Ovunque tu viva, puoi prenotare una videovisita per far valutare i sintomi digestivi di tuo figlio. Le visite in presenza sono disponibili anche per le famiglie che si trovano a Cordova, in Spagna.",
              },
              videovisitaOnline: 
              { 
                order: 1,
                title: "Videovisita Online",
                text: "Puoi far valutare il caso di tuo figlio da qualsiasi parte del mondo tramite una videovisita sicura, compilando il modulo nella sezione «Richiedi la tua videovisita».<br>In ogni caso, valuteremo prima il motivo della visita (dolore addominale, reflusso, stitichezza, allergie, celiachia, ecc.) e confermeremo insieme se la valutazione può essere effettuata online oppure se è necessaria una visita in presenza.",
                buttonLink: "/it/contacto",
                buttonText: "RICHIEDI LA TUA VIDEOVISITA",
              },
              visiteCordoba: 
              { 
                order: 2,
                title: "Visite in Presenza a Cordova, Spagna",
                text: "Per i pazienti che si trovano a Cordova o nei dintorni, sono disponibili visite di gastroenterologia pediatrica in presenza presso il centro specialistico pediatrico IHP, Avenida Cañito Bazán 2, Cordova.<br>Gli appuntamenti in presenza possono essere prenotati telefonicamente (+34 954 61 00 22), tramite l'app IHP Pediatría, oppure tramite il pulsante «Prenota il tuo appuntamento in presenza».<br>Se disponi di un'assicurazione sanitaria privata, puoi verificare se il tuo assicuratore ha una convenzione con la clinica nella sezione «Le nostre assicurazioni».",
                buttonLink: "https://ihppediatria.com/",
                buttonText: "PRENOTA IL TUO APPUNTAMENTO IN PRESENZA",
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
export default async function DudasFrecuentesPage({ params }) {
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