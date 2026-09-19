import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

const pageId = "sobreMi";
const staticDocs = {
  seo:{
        es:{
              title: "Sobre mí | Dra. EMMA LÓPEZ RUBIO Pediatra gastroenteróloga en Córdoba | Especialista en digestivo y trastornos de la conducta alimentaria",
              description: "Soy la Dra. Emma López Rubio, pediatra especializada en gastroenterología, hepatología y nutrición infantil en Córdoba.",
              keywords: "digestivo infantil, pediatria, conducta alimentaria, gastroenteróloga"
            },
        en:{
              title: "About Dr. Emma López Rubio | Pediatric Gastroenterologist",
              description: "Meet Dr. Emma López Rubio, a Spain-based pediatric gastroenterologist with nearly a decade of experience treating children's digestive conditions, offering online video consultations worldwide.",
              keywords: "pediatric gastroenterologist Spain, children's digestive health specialist, online pediatric GI doctor"
        },
        it: {
              title: "Gastroenterologo Pediatrico Online | Videovisite per Bambini – Dott.ssa Emma López Rubio",
              description: "Gastroenterologa pediatrica specializzata offre videovisite sicure per bambini con reflusso, stitichezza, allergie alimentari, celiachia e altro. Prenota subito online.",
              keywords: "gastroenterologo pediatrico online, videovisita pediatrica, pediatra online bambini, televisita pediatrica"
        }
      },
      content: {
        es: {  
            sections:{
              sobreMi: 
              { 
                order: 1,
                text: "Soy la Dra. Emma López Rubio, pediatra especializada en gastroenterología, hepatología y nutrición pediátrica en Córdoba. Acompaño a niños y adolescentes con problemas de digestivo infantil como dolor abdominal recurrente, reflujo gastroesofágico, estreñimiento, diarrea, alergias y intolerancias alimentarias, alergia a la proteína de leche de vaca (APLV), enfermedad celíaca, enfermedad inflamatoria intestinal y otros trastornos funcionales digestivos. Trabajo como pediatra de Atención Primaria en el Servicio Andaluz de Salud (SAS) y como pediatra especialista en aparato digestivo infantil en consulta de gastroenterología pediátrica en Córdoba, lo que me permite unir en una misma mirada la pediatría general y la subespecialización digestiva.",
                image:"/assets/dra-emma-lopez-rubio-pediatra-gastroenterologa.png",
                imageAlt:"Dra Emma Lopez Rubio Pediatra especializada en gastroenterología, hepatología y nutrición pediátrica en Córdoba"
              },
              maneraTrabajo: 
              { 
                order: 2,
                title: "Cómo entiendo la consulta de digestivo infantil",
                text: "Mi manera de trabajar se apoya en tres pilares que definen esta consulta de gastroenterología pediátrica en Córdoba:",
              },
              rigorCientifico: 
              { 
                order: 2,
                subtitle: "Rigor científico y actualización continua",
                text: "Soy licenciada en Medicina, especialista en Pediatría vía MIR y he completado dos másteres relacionados con mi especialidad. Llevo casi una década centrada en digestivo infantil, abordando tanto patología digestiva frecuente como casos complejos en hospitales de referencia de la península y en la atención a familias de distintos países y entornos culturales.<br><br>Parto siempre de la medicina basada en la evidencia, siguiendo guías clínicas y protocolos actualizados para decidir qué pruebas son realmente necesarias y qué tratamientos aportan más beneficio en cada niño o niña.<br><br>He participado en congresos de la AEP y la SEGHNP y soy autora de varias publicaciones científicas en gastroenterología pediátrica, entre ellas:<br><br>“Gastroenteritis aguda” en Manual práctico de pediatría (3.ª ed.), 2021.<br><br>“Controversias del tratamiento con biológicos en la enfermedad inflamatoria intestinal”, SPAOYEX, 2019.<br><br>“Enterobiasis epiploica como causa infrecuente de abdomen agudo”, Acta Pediátrica, 2016.",
              },
              comunicacionClara: 
              { 
                order: 3,
                subtitle: "Comunicación clara, cercana y coordinada",
                text: "En cada visita dedico tiempo a explicar con un lenguaje comprensible qué está ocurriendo, por qué pueden aparecer los síntomas digestivos y cuáles son las opciones de estudio y tratamiento. Muchas familias llegan tras meses de pruebas, listas de espera o diagnósticos poco claros; el objetivo de la consulta es ordenar la información, resolver dudas y diseñar un plan de manejo que tenga sentido para todos. El hecho de trabajar simultáneamente en el SAS y en la consulta privada de digestivo pediátrico facilita la coordinación con el pediatra de cabecera, la interpretación de informes hospitalarios y la planificación conjunta del seguimiento.",
              },
              visionIntegralPaciente: 
              { 
                order: 4,
                subtitle: "Visión integral del paciente pediátrico y trabajo en red",
                text: "Aunque el foco principal está en el aparato digestivo del niño o la niña, la valoración siempre tiene en cuenta su crecimiento, su alimentación, su contexto familiar y escolar y su bienestar emocional. Trabajo en red con pediatras de Atención Primaria, nutricionistas pediátricos, psicólogos infantiles, alergólogos y cirujanos pediátricos cuando es necesario, para ofrecer una atención realmente multidisciplinar en digestivo infantil. Colaboro con asociaciones de pacientes y centros educativos para mejorar el conocimiento sobre problemas digestivos infantiles, enfermedad celíaca, alergias alimentarias, dolor abdominal crónico y hábitos de alimentación saludable.",
              },
              cursos: 
              { 
                order: 4,
                text: "Además de la actividad asistencial, la docencia es una parte importante de mi trabajo. Imparto cursos y charlas sobre pediatría, reanimación cardiopulmonar (RCP) y trastornos de la conducta alimentaria, entre otros temas dirigidos a profesionales y familias.<br><br>Si quieres recibir más información sobre próximos cursos, disponibilidad y contenidos, puedes contactar conmigo a través del formulario de la web",
                buttonLink: "/es/contacto",
                buttonText: "Contactar conmigo",
              },
            },
          },
        en:{
            sections:{
              aboutMe: 
              { 
                order: 1,
                text: "I'm Dr. Emma López Rubio, a pediatrician specializing in gastroenterology, hepatology, and pediatric nutrition. I care for children and teenagers with digestive conditions such as recurrent abdominal pain, gastroesophageal reflux, constipation, diarrhea, food allergies and intolerances, cow's milk protein allergy (CMPA), celiac disease, inflammatory bowel disease, and other functional digestive disorders.<br>I work as a primary care pediatrician within Spain's public health service and as a pediatric gastroenterology specialist in private practice, which allows me to combine general pediatrics with digestive subspecialty care in a single, integrated approach.",
                image:"/assets/dra-emma-lopez-rubio-pediatra-gastroenterologa.png",
                imageAlt:"Dra Emma Lopez Rubio Pediatra especializada en gastroenterología, hepatología y nutrición pediátrica en Córdoba"
              },
              scientificRigor:{
                order: 2,
                title:"How I approach pediatric digestive care",
                subtitle:"Scientific rigor and continuous training",
                text: "I hold a degree in Medicine, trained as a pediatric specialist through Spain's national residency programme (MIR), and have completed two master's degrees related to my specialty. For nearly a decade I have focused on pediatric digestive health, managing both common digestive conditions and complex cases at leading referral hospitals in Spain, as well as caring for families from different countries and cultural backgrounds.<br><br>I always work from an evidence-based approach, following up-to-date clinical guidelines and protocols to decide which tests are genuinely necessary and which treatments bring the greatest benefit to each child.<br><br>I have presented at conferences of the Spanish Association of Pediatrics (AEP) and the Spanish Society of Pediatric Gastroenterology, Hepatology and Nutrition (SEGHNP), and I am the author of several scientific publications in pediatric gastroenterology including, <br><br>“Gastroenteritis aguda” [“Acute gastroenteritis”], in Manual práctico de pediatría [Practical Pediatrics Handbook] (3rd ed.), 2021.<br><br>“Controversias del tratamiento con biológicos en la enfermedad inflamatoria intestinal” [“Controversies in biologic treatment for inflammatory bowel disease”], SPAOYEX, 2019.<br><br>“Enterobiasis epiploica como causa infrecuente de abdomen agudo” [“Epiploic enterobiasis as a rare cause of acute abdomen”], Acta Pediátrica, 2016.",
              },
              clearCommunication:{
                order: 3,
                subtitle:"Clear, approachable, and coordinated communication",
                text: "In every visit, I take the time to explain — in clear, accessible language — what is happening, why digestive symptoms may occur, and what the diagnostic and treatment options are. Many families come to me after months of tests, waiting lists, or unclear diagnoses; the goal of the consultation is to organize the information, answer questions, and design a management plan that makes sense for everyone. Working simultaneously in the public health system and in private pediatric digestive practice makes it easier to coordinate with your child's regular pediatrician, interpret hospital reports, and plan follow-up care together.",
              },
              wholeChildCoordinated:{
                order: 4,
                subtitle:"A whole-child approach and coordinated care",
                text: "Although the main focus is the child's digestive system, every assessment takes into account growth, diet, family and school context, and emotional wellbeing. I work closely with primary care pediatricians, pediatric dietitians, child psychologists, allergists, and pediatric surgeons when needed, to provide truly multidisciplinary care for children's digestive health. I collaborate with patient associations and schools to raise awareness of pediatric digestive conditions, celiac disease, food allergies, chronic abdominal pain, and healthy eating habits.",
              },
              courses:{
                order: 5,
                text: "Alongside clinical care, teaching is an important part of my work. I give courses and talks on pediatrics, cardiopulmonary resuscitation (CPR), and eating disorders, among other topics, for healthcare professionals and families.<br>If you'd like more information about upcoming courses, availability, or content, you can reach me through the contact form on this website.",
                buttonLink: "/en/contacto",
                buttonText: "Contact me"
              }
            }
            },
            it:{
              sections:{
               chiSono: 
              { 
                order: 1,
                text: "Sono la Dott.ssa Emma López Rubio, pediatra specializzata in gastroenterologia, epatologia e nutrizione pediatrica. Mi occupo di bambini e adolescenti con patologie digestive come dolore addominale ricorrente, reflusso gastroesofageo, stitichezza, diarrea, allergie e intolleranze alimentari, allergia alle proteine del latte vaccino (APLV), malattia celiaca, malattia infiammatoria intestinale e altri disturbi digestivi funzionali.<br>Lavoro come pediatra di famiglia (pediatra di libera scelta) nel servizio sanitario pubblico spagnolo e come specialista in gastroenterologia pediatrica in uno studio privato, il che mi permette di unire la pediatria generale alla sottospecializzazione digestiva in un'unica visione integrata. Nel 2021 ho ottenuto l’abilitazione per esercitare la professione di medico pediatra in Italia.",
                image:"/assets/dra-emma-lopez-rubio-pediatra-gastroenterologa.png",
                imageAlt:"Dott.ssa Emma López Rubio, pediatra specializzata in gastroenterologia, epatologia e nutrizione pediatrica"
              },
              rigoreScientifico:{
                order: 2,
                title:"Il mio approccio alla gastroenterologia pediatrica",
                subtitle:"Rigore scientifico e formazione continua",
                text: "Sono laureata in Medicina, specializzata in Pediatria tramite il programma di formazione post-laurea spagnolo (MIR), e ho completato due master legati alla mia specialità. Da quasi dieci anni mi dedico alla gastroenterologia pediatrica, occupandomi sia di patologie digestive frequenti sia di casi complessi in ospedali di riferimento in Spagna, oltre a seguire famiglie provenienti da diversi Paesi e contesti culturali.<br>Baso sempre il mio lavoro sulla medicina basata sull'evidenza, seguendo linee guida cliniche e protocolli aggiornati per decidere quali esami sono davvero necessari e quali trattamenti offrono il maggior beneficio per ciascun bambino.<br>Ho partecipato a congressi dell'AEP (Associazione Spagnola di Pediatria) e della SEGHNP (Società Spagnola di Gastroenterologia, Epatologia e Nutrizione Pediatrica), e sono autrice di diverse pubblicazioni scientifiche in gastroenterologia pediatrica, tra cui:<br>«Gastroenteritis aguda» [«Gastroenterite acuta»], in Manual práctico de pediatría [Manuale pratico di pediatria] (3ª ed.), 2021.<br>«Controversias del tratamiento con biológicos en la enfermedad inflamatoria intestinal» [«Controversie nel trattamento con farmaci biologici nella malattia infiammatoria intestinale»], SPAOYEX, 2019.<br>«Enterobiasis epiploica como causa infrecuente de abdomen agudo» [«Enterobiasi epiploica come causa rara di addome acuto»], Acta Pediátrica, 2016.<br>",
              },
              comunicazioneChiara:{
                order: 3,
                subtitle:"Comunicazione chiara, vicina e coordinata",
                text: "In ogni visita dedico del tempo a spiegare, con un linguaggio comprensibile, cosa sta accadendo, perché possono comparire i sintomi digestivi e quali sono le opzioni diagnostiche e terapeutiche. Molte famiglie arrivano dopo mesi di esami, liste d'attesa o diagnosi poco chiare; l'obiettivo della visita è mettere ordine nelle informazioni, rispondere ai dubbi e costruire un piano di gestione che abbia senso per tutti. Lavorare contemporaneamente nel sistema sanitario pubblico e nello studio privato di gastroenterologia pediatrica facilita il coordinamento con il pediatra di famiglia, l'interpretazione dei referti ospedalieri e la pianificazione condivisa del follow-up.",
              },
              wholeChildCoordinated:{
                order: 4,
                subtitle:"Visione globale del paziente pediatrico e lavoro in rete",
                text: "Anche se l'attenzione principale è rivolta all'apparato digestivo del bambino, la valutazione tiene sempre conto della crescita, dell'alimentazione, del contesto familiare e scolastico e del benessere emotivo. Collaboro con pediatri di base, nutrizionisti pediatrici, psicologi infantili, allergologi e chirurghi pediatrici quando necessario, per offrire un'assistenza davvero multidisciplinare nella salute digestiva infantile. Collaboro inoltre con associazioni di pazienti e scuole per sensibilizzare su patologie digestive infantili, celiachia, allergie alimentari, dolore addominale cronico e abitudini alimentari sane.",
              },
              corsi:{
                order: 4,
                text: "Oltre all'attività clinica, l'insegnamento è una parte importante del mio lavoro. Tengo corsi e conferenze su pediatria, rianimazione cardiopolmonare (RCP) e disturbi del comportamento alimentare, tra gli altri argomenti, rivolti sia a professionisti sanitari sia a famiglie.<br>Se desideri maggiori informazioni su prossimi corsi, disponibilità e contenuti, puoi contattarmi tramite il modulo di contatto del sito.<br>",
                buttonLink: "/it/contacto",
                buttonText: "Contattami"
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
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight" dangerouslySetInnerHTML={{ __html: section.title }} />
                )}

                {/* SubTítulo: Solo se pinta si no es nulo, vacío o espacios en blanco */}
                {section.subtitle && section.subtitle.trim() !== "" && (
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight" dangerouslySetInnerHTML={{ __html: section.subtitle }} />
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