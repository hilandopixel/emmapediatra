import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

const pageId = "inicio";
const staticDocs = {
      seo:{
        es:{
              title: "Dra. EMMA LÓPEZ RUBIO Pediatra gastroenteróloga en Córdoba | Especialista en digestivo y trastornos de la conducta alimentaria",
              description: "Soy la Dra. Emma López Rubio, pediatra especializada en gastroenterología, hepatología y nutrición infantil en Córdoba.",
              keywords: "digestivo infantil, pediatria, conducta alimentaria, gastroenteróloga"
            },
        en:{
              title: "Pediatric Gastroenterologist Online | Video Consultations for Children – Dr. Emma López Rubio",
              description: "Board-certified pediatric gastroenterologist offering secure video consultations worldwide for children with reflux, constipation, food allergies, celiac disease and more. Book online today.",
              keywords: "pediatric gastroenterologist online, online consultation for child digestive problems, video consultation pediatrician"
        },
        it: {
              title: "Gastroenterologo Pediatrico Online | Videovisite per Bambini – Dott.ssa Emma López Rubio",
              description: "Gastroenterologa pediatrica specializzata offre videovisite sicure per bambini con reflusso, stitichezza, allergie alimentari, celiachia e altro. Prenota subito online.",
              keywords: "gastroenterologo pediatrico online, videovisita pediatrica, pediatra online bambini, televisita pediatrica"
        }
      },
      content: {
        image:"/assets/dra-emma-lopez-portada.png",
        es: {
              herotext: "Dra. Emma López Rubio<br>Pediatra gastroenteróloga en Córdoba<br>Especialista en digestivo y trastornos de la conducta alimentaria.",
              herobuttonLink: "/es/sobre-mi",
              herobuttonText: "SOBRE MÍ",
              sections: {
                sobre_mi: 
                { 
                  order: 1,
                  text: "Soy la Dra. Emma López Rubio, <strong>pediatra especializada en gastroenterología, hepatología y nutrición infantil en Córdoba</strong>, donde acompaño a niños y adolescentes con dolor abdominal, reflujo, estreñimiento, alergias, intolerancias, enfermedad celíaca y otros problemas digestivos. Mi forma de trabajar combina rigor científico, una comunicación clara con las familias y una visión integral del niño, teniendo en cuenta su crecimiento, alimentación y bienestar emocional",
                  buttonLink: "/es/sobre-mi",
                  buttonText: "Leer más sobre mí",
                  image:"/assets/dra-emma-lopez-rubio-pediatra-gastroenterologa.png",
                  imageAlt:"Emma Pediatra Córdoba",
                },
                buscas_pediatra: 
                { 
                  order: 2,
                  title: "¿Buscas pediatra especialista en digestivo infantil en Córdoba para tu hijo o hija?",
                  text:"Puedes pedir cita para una valoración de digestivo infantil en consulta presencial en Córdoba o mediante videoconsulta si vives en otra ciudad (dolor abdominal, reflujo gastroesofágico, estreñimiento, alergias alimentarias, enfermedad celíaca).​</br>Existe un convenio con varias aseguradoras de salud y también es posible la atención privada, y durante la visita revisaremos vuestro caso con detalle y decidiremos el tipo de tratamiento más adecuado.",
                  buttonLink: "/es/pide-cita",
                  buttonText: "Pide cita",
                  htmlEmbbeded: "<iframe loading='lazy' title='#AprendeConTuPediatra: Dra. Emma López Rubio - Reflujo en lactantes' width='100%' height='500px' src='https://www.youtube.com/embed/2vMZP4ZdH6U?feature=oembed' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;compute-pressure; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>",
                },
                dudas_frecuentes: 
                { 
                  order: 3,
                  title: "¿Te preocupa si los síntomas digestivos de tu hijo o hija son normales?",
                  text:"He preparado un resumen con las dudas que más se repiten en la consulta de digestivo infantil —reflujo, vómitos, gases, estreñimiento, cambios en el color de las heces, dolor abdominal, alergias alimentarias, celiaquía y alergia a la proteína de leche de vaca (APLV)— basándome en años de experiencia en hospitales de referencia en España atendiendo a niños y adolescentes con estas patologías.",
                  buttonLink: "/es/dudas-frecuentes",
                  buttonText: "Consultas las dudas más frecuentes sobre el aparato digestivo infantil",
                },
                contacto:{
                  order: 4,
                  title: "Contacto",
                  htmlEmbbeded: "<iframe loading='lazy' src='https://docs.google.com/forms/d/e/1FAIpQLSfxM_IzTLc6uwlwELg1G7ktqmn2Qny-Gmwg23WB1NBBUEiaGw/viewform?embedded=true' width='100%' height='1800' frameborder='0' marginheight='0' marginwidth='0'>Cargando…</iframe>",
                }
              }
            },
        en:{
              herotext: "Dr. Emma López Rubio<br>Pediatric Gastroenterologist — Online Video Consultations<br>Specialist in Pediatric Digestive Health and Eating Disorders",
              herobuttonLink: "#aboutMe",
              herobuttonText: "Read more bout me",
              sections: {
              aboutMe: 
              { 
                order: 0,
                text: "I'm Dr. Emma López Rubio, <strong>a pediatrician specializing in gastroenterology, hepatology, and pediatric nutrition</strong>. Through secure online video consultations, I help children and teenagers around the world with abdominal pain, reflux, constipation, food allergies and intolerances, celiac disease, and other digestive concerns. My approach combines scientific rigor, clear communication with families, and a whole-child perspective — taking into account growth, diet, and emotional wellbeing.",
                buttonLink: "/en/sobre-mi",
                buttonText: "Read more about me",
                image:"/assets/dra-emma-lopez-rubio-pediatra-gastroenterologa.png",
                imageAlt:"Emma Pediatrics Córdoba",
              },
              lookingPediatric: 
              { 
                order: 1,
                title: "Looking for a pediatric digestive health specialist for your child?",
                text:"You can request a video consultation from wherever you live to have your child's digestive symptoms assessed — abdominal pain, gastroesophageal reflux, constipation, food allergies, celiac disease. In-person visits are also available for families based in Córdoba, Spain. During the consultation, we'll review your child's case in detail together and agree on the most suitable next steps.",
                buttonLink: "/en/pide-cita",
                buttonText: "Book an appointment",
                htmlEmbbeded: "<iframe loading='lazy' title='#AprendeConTuPediatra: Dra. Emma López Rubio - Reflujo en lactantes' width='100%' height='500px' src='https://www.youtube.com/embed/2vMZP4ZdH6U?feature=oembed' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; compute-pressure; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>"
              },
              frequentlyAskedQuestions: 
              { 
                order: 2,
                title: "Wondering whether your child's digestive symptoms are normal?",
                text:"I've put together answers to the questions families ask most often in pediatric digestive consultations — reflux, vomiting, gas, constipation, changes in stool color, abdominal pain, food allergies, celiac disease, and cow's milk protein allergy (CMPA) — based on years of experience in leading hospitals in Spain, caring for children and teenagers with these conditions.",
                buttonLink: "/en/dudas-frecuentes",
                buttonText: "Browse frequently asked questions about children's digestive health",
              },
              contact:{
                order: 3,
                title: "Contact",
                htmlEmbbeded: "<iframe loading='lazy' src='https://docs.google.com/forms/d/e/1FAIpQLSfxM_IzTLc6uwlwELg1G7ktqmn2Qny-Gmwg23WB1NBBUEiaGw/viewform?embedded=true' width='100%' height='1800' frameborder='0' marginheight='0' marginwidth='0'>Cargando…</iframe>",
              }
            }
          },
          it:{
            herotext: "Gastroenterologa Pediatrica — Videovisite in Tutto il Mondo<h2>Specialista in Gastroenterologia Pediatrica e Disturbi del Comportamento Alimentare</h2>",
              herobuttonLink: "#piuSuDiMe",
              herobuttonText: "Leggi di più su di me",
              sections: {
              piuSuDiMe: 
              { 
                order: 0,
                text: "Sono la Dott.ssa Emma López Rubio, pediatra specializzata in gastroenterologia, epatologia e nutrizione pediatrica. Attraverso videovisite sicure, aiuto bambini e adolescenti di tutto il mondo con dolore addominale, reflusso, stitichezza, allergie e intolleranze alimentari, malattia celiaca e altri disturbi digestivi. Il mio approccio unisce rigore scientifico, comunicazione chiara con le famiglie e una visione globale del bambino, tenendo conto della crescita, dell'alimentazione e del benessere emotivo.",
                buttonLink: "/it/sobre-mi",
                buttonText: "Leggi di più su di me",
                image:"/assets/dra-emma-lopez-rubio-pediatra-gastroenterologa.png",
                imageAlt:"Emma Pediatrics Córdoba",
              },
              lookingPediatric: 
              { 
                order: 1,
                title: "Cerchi uno specialista in gastroenterologia pediatrica per tuo figlio o tua figlia?",
                text:"Puoi prenotare una videovisita da qualsiasi parte del mondo per far valutare i sintomi digestivi di tuo figlio — dolore addominale, reflusso gastroesofageo, stitichezza, allergie alimentari, malattia celiaca. Le visite in presenza sono disponibili anche per le famiglie che si trovano a Cordova, in Spagna. Durante la visita valuteremo insieme il caso nel dettaglio e concorderemo i passi successivi più adatti.",
                buttonLink: "/it/pide-cita",
                buttonText: "Prenota un appuntamento",
                htmlEmbbeded: "<iframe loading='lazy' title='#AprendeConTuPediatra: Dra. Emma López Rubio - Reflujo en lactantes' width='100%' height='500px' src='https://www.youtube.com/embed/2vMZP4ZdH6U?feature=oembed' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; compute-pressure; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>"
              },
              frequentlyAskedQuestions: 
              { 
                order: 2,
                title: "Ti chiedi se i sintomi digestivi di tuo figlio siano normali?",
                text:"Ho raccolto le risposte alle domande che le famiglie pongono più spesso nelle visite di gastroenterologia pediatrica — reflusso, vomito, gas intestinali, stitichezza, cambiamenti nel colore delle feci, dolore addominale, allergie alimentari, celiachia e allergia alle proteine del latte vaccino (APLV) — basandomi su anni di esperienza in ospedali di riferimento in Spagna, nella cura di bambini e adolescenti con queste patologie.",
                buttonLink: "/it/dudas-frecuentes",
                buttonText: "Consulta le domande frequenti sulla salute digestiva dei bambini",
              },
              contact:{
                order: 3,
                title: "Contatti",
                htmlEmbbeded: "<iframe loading='lazy' src='https://docs.google.com/forms/d/e/1FAIpQLSfxM_IzTLc6uwlwELg1G7ktqmn2Qny-Gmwg23WB1NBBUEiaGw/viewform?embedded=true' width='100%' height='1800' frameborder='0' marginheight='0' marginwidth='0'>Cargando…</iframe>",
              }
            }
          }
        }
      };

export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }, { lang: 'it' } ]; 
}

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

export default async function InicioPage({ params }) {
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
          <div>
          <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                  <div className="sticky top-0 h-screen w-full bg-cover bg-center bg-no-repeat" 
                      style={{ backgroundImage: pageSettings?.image ? `url(${pageSettings.image})` : 'none' }}/>
                  </div>
              <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,152,186,0.75)_26%,_rgba(192,192,192,0.75)_52%,_rgba(255,254,255,0.75)_100%)] z-0"></div> 
              <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white py-20 space-y-8">
                  <h1 className="text-white text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed text-left font-extrabold"
                      dangerouslySetInnerHTML={{__html: contentTranslation?.herotext ?? ''}}/>
                  <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
                      <a href={contentTranslation?.herobuttonLink}
                      dangerouslySetInnerHTML={{__html: contentTranslation?.herobuttonText ?? ''}}
                      className="w-full sm:w-auto px-8 py-4 bg-white text-primary-custom hover:bg-white/10 hover:text-white font-semibold rounded-xl backdrop-blur-md border border-white/15 transition"/>
                      <img src="/assets/logo2.png" alt="Emma Pediatra" className="mx-auto object-contain" style={{ maxHeight: '60px' }}/>
                  </div>
              </div>
          </section>
          </div>

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