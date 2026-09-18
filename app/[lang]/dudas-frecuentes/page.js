import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

const pageId = "dudasFrecuentes";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "es";

  try {
    const docRef = doc(db, "pages", pageId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return { title: pageId};
    
    const data = docSnap.data();
    const seo = data?.seo?.[lang] || data?.seo?.["es"] || { title: pageId };

    return {
      title: seo.title,
      description: seo.description || "",
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

  const navText = {
      image:"/assets/dra-emma-lopez-preguntas.png",
      es: {
            imagen:{
            },    
            dudasFrecuentes: 
            { 
              order: 0,
              title: "Dudas frecuentes sobre digestivo infantil",
              text: "A lo largo de la infancia es muy frecuente que aparezcan dudas sobre síntomas digestivos, alimentación o heces, y muchas veces la respuesta depende mucho de cada niña o niño. Como resultado de años de experiencia en consulta de digestivo infantil y gastroenterología pediátrica, he reunido aquí algunas de las preguntas más habituales que plantean las familias.",
            },
            reflujoVomitosGases: 
            { 
              order: 1,
              title: "Reflujo, vómitos y gases",
              text: "<strong>¿Es normal que mi bebé regurgite tanto después de las tomas o puede ser reflujo gastroesofágico infantil?</strong><br>En los primeros meses es habitual que muchos bebés regurgiten pequeñas cantidades de leche, sobre todo si tragan aire o si la toma ha sido muy abundante. Sin embargo, si las regurgitaciones son muy frecuentes, molestas, con mal crecimiento o se acompañan de llanto intenso y rechazo de las tomas, conviene valorar si hay un reflujo gastroesofágico que requiera seguimiento específico por pediatra digestivo.</p></br><p><strong>¿Cuándo debo preocuparme por los vómitos y pensar en un problema digestivo?</strong><br>Los vómitos ocasionales, en el contexto de una gastroenteritis leve, suelen ser autolimitados y mejorar en uno o dos días con buena hidratación. Si los vómitos se repiten, son muy intensos, aparecen con dolor de barriga fuerte, fiebre, decaimiento, pérdida de peso o dificultad para beber, es importante consultar para valorar si es necesario estudiar mejor el aparato digestivo.</p></br></br><p><strong>¿Qué puedo hacer si mi bebé tiene muchos gases y está muy irritable después de comer?</strong><br>Los gases y la tripita hinchada son muy frecuentes en lactantes, sobre todo en las primeras semanas, y suelen mejorar con el tiempo, cambios suaves en la postura y, en algunos casos, revisando la técnica de agarre al pecho o al biberón. Si el malestar es muy intenso, el bebé llora inconsolablemente, duerme mal o parece tener dolor significativo, puede ser útil revisar el patrón de alimentación y descartar otros problemas digestivos que a veces no se detectan sin una valoración más detallada",
            },
            estrenimientoHeces: 
            { 
              order: 2,
              title: "Estreñimiento, heces y color",
              text: "<strong>¿Cuándo se considera que un bebé o una niña/un niño tiene estreñimiento y qué se puede hacer en casa?</strong><br>No todas las criaturas hacen caca cada día; algunas pueden estar uno o dos días sin deposición y seguir siendo normal si cuando hacen caca es blanda y sin esfuerzo. Se habla de estreñimiento infantil cuando las heces son muy duras, escasas, cuesta expulsarlas o se acompañan de dolor, y en esos casos pueden ayudar cambios en la dieta, en la hidratación y, si no mejora, una revisión más concreta del hábito intestinal.</p></br><p><strong>¿Es normal estar varios días sin hacer caca o puede ser un problema de estreñimiento infantil?</strong><br>En ciertas edades es posible que una niña o un niño esté varios días sin deposiciones y se mantenga bien, sin dolor ni distensión abdominal, lo que puede seguir considerándose dentro de la normalidad. Si el intervalo entre cacas se alarga mucho, la caca es muy dura, el momento de ir al baño se vive con miedo o dolor o aparecen manchitas en la ropa interior, es recomendable valorar si se trata de un estreñimiento que requiera un plan de manejo más estructurado.</p></br><p><strong>¿Qué significa que haya sangre en las heces o heces muy duras y dolor al ir al baño?</strong><br>La presencia de sangre roja sobre heces muy duras puede deberse a pequeñas fisuras anales provocadas por el esfuerzo, algo relativamente frecuente en el estreñimiento infantil. Si la sangre es repetida, aparece mezclada con la caca, se acompaña de dolor abdominal, diarrea, fiebre o pérdida de peso, es importante no normalizarlo y estudiar con calma qué está ocurriendo en el intestino.</p></br><p><strong>¿Es normal el color de la caca de mi bebé o debo preocuparme?</strong><br>El color de las heces puede variar mucho según la edad y el tipo de alimentación: tonos mostaza o verdosos son habituales en lactantes, y marrones de distintas intensidades suelen ser normales en niñas y niños mayores. En cambio, heces muy pálidas o blanquecinas, negras (sin tomar hierro) o con sangre visible son signos de alarma que conviene comentar cuanto antes para decidir si es necesario hacer alguna prueba o seguimiento más estrecho",
            },
            dolorAbdominalColicos: 
            { 
              order: 3,
              title: "Dolor abdominal y cólicos",
              text: "<strong>¿Cuándo es “normal” el dolor de tripa y cuándo puede indicar un problema digestivo más importante?</strong><br>Molestias de barriga leves y pasajeras son frecuentes en la infancia, a veces relacionadas con virus, cambios de alimentación o situaciones de estrés. Si el dolor es intenso, despierta por la noche, se repite con frecuencia, limita la actividad diaria o se acompaña de otros síntomas (fiebre, vómitos, pérdida de peso, diarrea o estreñimiento persistente), suele ser buena idea analizarlo con más detalle.</p></br><p><strong>¿Qué diferencia hay entre cólicos del lactante y un dolor abdominal que requiere otra valoración?</strong><br>Los cólicos del lactante se caracterizan por episodios de llanto intenso en bebés sanos, sobre todo al final del día, con exploración normal y buen crecimiento. Cuando el dolor se asocia a vómitos biliosos, distensión marcada de la barriga, fiebre, mal estado general o falta de ganancia de peso, se sale del cuadro típico de cólico y puede hacer falta una valoración más específica del sistema digestivo.</p></br><p><strong>Mi criatura se queja a menudo de dolor de barriga, pero las pruebas salen normales: ¿puede ser dolor abdominal funcional?</strong><br>En muchas niñas y niños el dolor de barriga recurrente no se debe a una enfermedad estructural y se denomina dolor abdominal funcional, donde influyen factores intestinales y también emocionales. Aunque las pruebas básicas sean normales, un plan adaptado a cada caso (explicaciones, hábitos digestivos, manejo del estrés y, a veces, tratamientos específicos) puede marcar la diferencia.",
            },
            alimentacionAlergias: 
            { 
              order: 4,
              title: "Alimentación, alergias e intolerancias",
              text: "<strong>¿Cómo saber si hay alergia o intolerancia a la leche de vaca u otros alimentos por síntomas digestivos?</strong><br>Algunos síntomas digestivos como vómitos frecuentes, diarrea, dolor abdominal, sangre en heces o rechazo de las tomas pueden asociarse a alergia o intolerancia a alimentos, incluida la alergia a la proteína de leche de vaca (APLV), aunque no siempre la causa es esa. Como el diagnóstico no debe basarse solo en quitar alimentos por cuenta propia, suele ser necesario valorar la historia completa, explorar y, en ocasiones, realizar pruebas o dietas dirigidas.</p></br><p><strong>¿Qué alimentos son recomendables si hay estreñimiento o diarrea frecuentes?</strong><br>En el estreñimiento infantil suelen ayudar la fibra (fruta, verdura, legumbres, cereales integrales), una buena hidratación y evitar un exceso de ultraprocesados y bollería. En episodios de diarrea, en cambio, interesa ofrecer líquidos frecuentes, alimentación ligera y adecuada a la edad y ajustar poco a poco la dieta según la tolerancia, revisando el caso si las diarreas se repiten o se prolongan.</p></br><p><strong>¿Cuándo conviene cambiar la leche de fórmula por problemas digestivos y quién debe indicarlo?</strong><br>No siempre que hay cólicos, gases o regurgitaciones es necesario cambiar de fórmula; en muchos casos bastan ajustes en la cantidad, el ritmo de las tomas o la postura. Cuando se sospecha una alergia, una intolerancia o un problema digestivo más complejo, elegir otro tipo de fórmula (hidrolizada, extensamente hidrolizada, etc.) debería hacerse tras valorar la situación global, para escoger la opción más adecuada.",
            },
            sintomasAlarma: 
            { 
              order: 5,
              title: "Síntomas de alarma y pruebas",
              text: "<strong>¿Qué signos digestivos indican que no conviene esperar y es mejor una valoración más detallada?</strong><br>Algunas señales que requieren atención son el dolor abdominal intenso o persistente, vómitos repetidos (sobre todo verdes o con sangre), diarreas con sangre, fiebre prolongada, pérdida de peso o rechazo de la comida y la bebida. También es importante consultar cuando hay cambios llamativos en las heces (muy pálidas, negras sin tratamiento con hierro, o muy dolorosas) o un estreñimiento muy prolongado que no mejora con medidas básicas.</p></br><p><strong>¿Cuándo es mejor que el dolor de barriga, el reflujo o el estreñimiento los vea un pediatra de digestivo y no solo el pediatra general?</strong><br>El pediatra de cabecera suele ser la primera referencia y puede resolver una gran parte de los problemas digestivos habituales. Cuando los síntomas se mantienen en el tiempo, son muy limitantes o se repiten a pesar de las primeras medidas, es cuando suele plantearse una valoración más específica de digestivo infantil para decidir si hacen falta estudios adicionales o un plan más especializado.</p></br><p><strong>¿Qué pruebas se suelen hacer en digestivo infantil para estudiar estos problemas?</strong><br>Dependiendo de los síntomas, pueden solicitarse análisis de sangre y heces, ecografía abdominal u otras pruebas de imagen para ver cómo está el aparato digestivo. En algunos casos concretos, cuando se considera necesario, también se pueden indicar pruebas como endoscopia o estudios de alergia alimentaria, siempre valorando riesgos y beneficios en cada niña o niño.</p>",
            },
            enfermedadCeliaca: 
            { 
              order: 6,
              title: "Dudas frecuentes sobre enfermedad celíaca",
              text: "<strong>Acabamos de recibir un diagnóstico de enfermedad celíaca: ¿por dónde empezamos?</strong><br>El primer paso suele ser entender que la base del tratamiento es una alimentación sin gluten estricta y mantenida en el tiempo, lo que permite que el intestino se recupere y la niña o el niño crezca con normalidad. Al principio es habitual sentirse abrumadas por cambios en la compra, en el colegio o en cumpleaños, por lo que puede ayudar ir resolviendo dudas poco a poco y revisar el plan de alimentación y controles según vaya avanzando la adaptación.</p></br><p><strong>¿Es normal seguir con molestias digestivas tras empezar la dieta sin gluten?</strong><br>En algunos casos las molestias (dolor de barriga, gases, cansancio) tardan un tiempo en mejorar del todo, incluso tras retirar el gluten, porque el intestino necesita un periodo para recuperarse. Cuando los síntomas persisten más de lo esperable o aparecen signos nuevos, suele ser buen momento para comentar la situación, revisar la dieta y, si hace falta, ajustar el seguimiento o plantear estudios adicionales.</p></br><p><strong>Nos han dicho que podría ser celiaquía pero las pruebas no son concluyentes, ¿qué hacemos mientras?</strong><br>Hay niñas y niños con síntomas y serología o biopsias poco claras, en los que el diagnóstico definitivo puede requerir tiempo y controles periódicos. En estos casos, es importante decidir de forma razonada si mantener o no el gluten, evitar restricciones innecesarias y planificar juntos los siguientes pasos (nuevas analíticas, revisiones, etc.).</p></br><p><strong>¿Cómo podemos manejar el día a día sin gluten en el colegio, el comedor y las actividades sociales?</strong><br>Explicar de forma sencilla la situación al entorno escolar y familiar suele facilitar que se respeten las medidas de seguridad con la comida y se reduzca el riesgo de contaminaciones. Aun así, es normal que surjan dudas sobre fiestas, viajes, campamentos o comidas fuera de casa, y muchas veces una orientación personalizada ayuda a encontrar soluciones prácticas que encajen con la edad y el estilo de vida de cada criatura.",
            },
            cambiosFormula: 
            { 
              order: 7,
              title: "Cambios de fórmula y APLV",
              text: "<strong>Nos han cambiado varias veces de leche de fórmula por gases, cólicos o reflujo, ¿es realmente necesario?</strong><br>En los primeros meses se tiende a atribuir muchos síntomas digestivos (cólicos, regurgitaciones, gases) al tipo de leche, y eso puede llevar a encadenar cambios de fórmula sin un beneficio claro. Antes de seguir probando leches diferentes, suele ser útil revisar la cantidad y el ritmo de las tomas, la técnica, las posturas y la evolución del peso, para decidir de forma más calmada si el problema se relaciona con la fórmula o con otros factores.</p></br><p><strong>¿Cuándo hay que sospechar alergia a la proteína de leche de vaca (APLV) en bebés con problemas digestivos?</strong><br>Además de los cólicos y las regurgitaciones, la APLV puede asociarse a otros signos como irritabilidad marcada, diarrea, sangre en heces, dermatitis intensa, dificultad para ganar peso o antecedentes familiares de alergias. Como estos síntomas también pueden aparecer en otras situaciones, el diagnóstico no se basa solo en cambiar de leche, sino en valorar el conjunto del cuadro y decidir, si procede, un ensayo bien dirigido con una fórmula específica.</p></br><p><strong>¿Qué tipo de fórmula se suele usar en la APLV y durante cuánto tiempo?</strong><br>En la APLV se suelen emplear fórmulas extensamente hidrolizadas o, en determinados casos, fórmulas de aminoácidos, siempre adaptadas a la edad y la situación clínica de cada bebé. La duración del uso y la reintroducción de proteínas lácteas se planifican de forma gradual, con controles periódicos, para comprobar la tolerancia y ajustar el calendario según la evolución.</p></br><p><strong>¿Es buena idea probar “por nuestra cuenta” una leche sin lactosa o una fórmula especial?</strong><br>Cambiar de leche sin una indicación clara puede dificultar la interpretación de los síntomas y hacer más complejo el diagnóstico posterior, sobre todo cuando se sospecha alergia o intolerancia. Por eso suele ser preferible decidir los cambios de fórmula dentro de un plan organizado, en el que se sepa qué se quiere observar, durante cuánto tiempo y qué pasos seguir en función de la respuesta.",
            },
          },
      en:{
            dudasFrecuentes: 
            { 
              order: 0,
              title: "Frequently Asked Questions About Children's Digestive Health",
              text: "Throughout childhood, questions about digestive symptoms, feeding, or stool often come up, and the right answer usually depends a lot on the individual child. Drawing on years of experience in pediatric digestive and gastroenterology consultations, I've gathered here some of the questions families ask most often",
            },
            reflujoVomitosGases: 
            { 
              order: 1,
              title: "Reflux, Vomiting, and Gas",
              text: "strong>Is it normal for my baby to spit up so much after feeds, or could it be infant gastroesophageal reflux?</strong></p><br><p>In the first few months, it's common for many babies to bring up small amounts of milk, especially if they swallow air or have had a particularly large feed. However, if the spitting up is very frequent, causes distress, is associated with poor weight gain, or comes with intense crying and feeding refusal, it's worth assessing whether there is a gastroesophageal reflux that needs specific follow-up with a pediatric gastroenterologist.</p><br><p><strong>When should I worry about vomiting and consider it a sign of a digestive problem?</strong></p><br><p>Occasional vomiting, in the context of mild gastroenteritis, is usually self-limiting and improves within a day or two with good hydration. If vomiting is repeated, very intense, comes with severe abdominal pain, fever, lethargy, weight loss, or difficulty drinking fluids, it's important to seek an assessment to determine whether further evaluation of the digestive system is needed.</p><br><p><strong>What can I do if my baby has a lot of gas and is very irritable after feeding?</strong></p><br><p>Gas and a bloated tummy are very common in infants, especially in the first few weeks, and usually improve over time, with gentle changes in positioning and, in some cases, by reviewing latch technique at the breast or bottle. If the discomfort is very intense, the baby cries inconsolably, sleeps poorly, or seems to be in significant pain, it can be helpful to review the feeding pattern and rule out other digestive issues that sometimes aren't detected without a more detailed assessment.",
            },
            estrenimientoHeces: 
            { 
              order: 2,
              title: "Constipation, Stools, and Color",
              text: "<strong>When is a baby or child considered constipated, and what can be done at home?</strong></p><br><p>Not every child needs to pass stool every day; some may go one or two days without a bowel movement, and this can still be normal as long as the stool is soft and passes without straining. We talk about childhood constipation when stools are very hard, infrequent, difficult to pass, or associated with pain — in these cases, changes in diet and hydration can help, and if things don't improve, a more specific review of bowel habits is recommended.</p><br><p><strong>Is it normal to go several days without a bowel movement, or could it be a sign of childhood constipation?</strong></p><br><p>At certain ages, it's possible for a child to go several days without a bowel movement and remain otherwise well, with no pain or abdominal distension, which can still be considered within the range of normal. If the interval between bowel movements becomes very long, the stool is very hard, going to the bathroom is associated with fear or pain, or there are stains in the underwear, it's advisable to assess whether this is constipation that needs a more structured management plan.</p><br><p><strong>What does it mean if there's blood in the stool, or very hard stools and pain when going to the bathroom?</strong></p><br><p>Bright red blood on very hard stools can be due to small anal fissures caused by straining, which is relatively common in childhood constipation. If the bleeding is repeated, mixed in with the stool, or accompanied by abdominal pain, diarrhea, fever, or weight loss, it's important not to dismiss it and to calmly investigate what's happening in the bowel.</p><br><p><strong>Is my baby's stool color normal, or should I be concerned?</strong></p><br><p>Stool color can vary a great deal depending on age and diet: mustard or greenish tones are common in infants, and various shades of brown are usually normal in older children. However, very pale or whitish stools, black stools (without iron supplementation), or visible blood are warning signs that should be discussed as soon as possible, to decide whether further testing or closer follow-up is needed.</p>",
            },
            dolorAbdominalColicos: 
            { 
              order: 3,
              title: "Abdominal Pain and Colic",
              text: "<strong>When is tummy pain “normal,” and when could it point to a more significant digestive problem?</strong></p><br><p>Mild, short-lived tummy discomfort is common in childhood, sometimes linked to viral infections, dietary changes, or stress. If the pain is intense, wakes the child at night, happens frequently, limits daily activity, or comes with other symptoms (fever, vomiting, weight loss, diarrhea, or persistent constipation), it's usually a good idea to look into it in more detail.</p><br><p><strong>What's the difference between infant colic and abdominal pain that needs further assessment?</strong></p><br><p>Infant colic is characterized by episodes of intense crying in otherwise healthy babies, usually in the evening, with a normal exam and good growth. When the pain is associated with bilious (green) vomiting, marked abdominal distension, fever, feeling generally unwell, or poor weight gain, it goes beyond typical colic and may call for a more specific digestive assessment.</p><br><p><strong>My child often complains of tummy pain, but the tests come back normal — could this be functional abdominal pain?</strong></p><br><p>In many children, recurrent tummy pain isn't due to a structural disease and is known as functional abdominal pain, where both digestive and emotional factors can play a role. Even when basic tests are normal, a plan tailored to each case — explanations, digestive habits, stress management, and sometimes specific treatments — can make a real difference.</p>",
            },
            alimentacionAlergias: 
            { 
              order: 4,
              title: "Feeding, Allergies, and Intolerances",
              text: "<strong>How can I tell if there's an allergy or intolerance to cow's milk or other foods based on digestive symptoms?</strong></p><br><p>Some digestive symptoms — such as frequent vomiting, diarrhea, abdominal pain, blood in the stool, or feeding refusal — can be linked to a food allergy or intolerance, including cow's milk protein allergy (CMPA), although this isn't always the cause. Since diagnosis shouldn't be based solely on removing foods on your own, it's usually necessary to review the full history, carry out an examination, and, in some cases, run specific tests or supervised elimination diets.</p><br><p><strong>What foods are recommended if there's frequent constipation or diarrhea?</strong></p><br><p>For childhood constipation, fiber (fruit, vegetables, legumes, whole grains), good hydration, and limiting ultra-processed foods and pastries tend to help. During episodes of diarrhea, on the other hand, it's important to offer fluids often, keep meals light and age-appropriate, and gradually adjust the diet according to tolerance — seeking review if the diarrhea is recurrent or prolonged.</p><br><p><strong>When should infant formula be changed because of digestive problems, and who should recommend it?</strong></p><br><p>Not every case of colic, gas, or spitting up requires a formula change; in many cases, adjusting the amount, feeding pace, or position is enough. When an allergy, intolerance, or more complex digestive problem is suspected, switching to another type of formula (hydrolyzed, extensively hydrolyzed, etc.) should be done after assessing the overall picture, to choose the most appropriate option.</p>",
            },
            sintomasAlarma: 
            { 
              order: 5,
              title: "Warning Signs and Tests",
              text: "<strong>What digestive signs mean it's better not to wait, and to seek a more detailed assessment?</strong></p><br><p>Some signs that call for prompt attention include intense or persistent abdominal pain, repeated vomiting (especially green or bloody), bloody diarrhea, prolonged fever, weight loss, or refusal to eat and drink. It's also important to seek advice when there are notable changes in stool (very pale, black without iron treatment, or very painful to pass) or prolonged constipation that doesn't improve with basic measures.</p><br><p><strong>When is it better for tummy pain, reflux, or constipation to be seen by a pediatric gastroenterologist rather than only the general pediatrician?</strong></p><br><p>The primary care pediatrician is usually the first point of reference and can resolve a large proportion of common digestive problems. When symptoms persist over time, are very limiting, or keep recurring despite initial measures, that's usually when a more specific pediatric digestive assessment is considered, to decide whether additional tests or a more specialized plan are needed.</p><br><p><strong>What tests are typically done in pediatric gastroenterology to investigate these problems?</strong></p><br><p>Depending on the symptoms, blood and stool tests, abdominal ultrasound, or other imaging tests may be requested to assess the digestive system. In certain specific cases, when considered necessary, tests such as endoscopy or food allergy testing may also be indicated, always weighing the risks and benefits for each child.</p>",
            },
            enfermedadCeliaca: 
            { 
              order: 6,
              title: "Frequently Asked Questions About Celiac Disease",
              text: "<strong>We've just received a celiac disease diagnosis — where do we start?</strong></p><br><p>The first step is usually understanding that the foundation of treatment is a strict, lifelong gluten-free diet, which allows the gut to heal and the child to grow normally. It's common to feel overwhelmed at first by changes to grocery shopping, school meals, or birthday parties, so it can help to work through questions gradually and review the eating plan and follow-up checks as the adjustment progresses.</p><br><p><strong>Is it normal to still have digestive discomfort after starting the gluten-free diet?</strong></p><br><p>In some cases, symptoms (tummy pain, gas, fatigue) take a while to fully improve, even after gluten is removed, because the gut needs time to heal. When symptoms persist longer than expected or new signs appear, it's usually a good time to discuss the situation, review the diet, and, if needed, adjust follow-up or consider further testing.</p><br><p><strong>We've been told it might be celiac disease, but the tests aren't conclusive — what do we do in the meantime?</strong></p><br><p>Some children have symptoms with unclear serology or biopsy results, where a definitive diagnosis may take time and periodic monitoring. In these cases, it's important to decide, in a reasoned way, whether to keep gluten in the diet or not, avoid unnecessary restrictions, and plan the next steps together (further blood tests, follow-up visits, etc.).</p><br><p><strong>How can we manage everyday gluten-free life at school, in the cafeteria, and during social activities?</strong></p><br><p>Explaining the situation simply to school staff and family members usually makes it easier for food-safety measures to be respected and reduces the risk of cross-contamination. Even so, it's normal for questions to come up about parties, trips, camps, or eating out, and personalized guidance can often help find practical solutions suited to each child's age and lifestyle.</p>",
            },
            cambiosFormula: 
            { 
              order: 7,
              title: "Formula Changes and Cow's Milk Protein Allergy (CMPA)",
              text: "<strong>We've changed formula several times because of gas, colic, or reflux — is that really necessary?</strong></p><br><p>In the first few months, many digestive symptoms (colic, spitting up, gas) tend to get blamed on the type of formula, which can lead to switching formulas repeatedly without any clear benefit. Before trying yet another formula, it's usually helpful to review feeding amounts and pace, technique, positioning, and weight progress, in order to calmly decide whether the issue is related to the formula or to other factors.</p><br><p><strong>When should cow's milk protein allergy (CMPA) be suspected in babies with digestive problems?</strong></p><br><p>Besides colic and spitting up, CMPA can be associated with other signs such as marked irritability, diarrhea, blood in the stool, severe dermatitis, poor weight gain, or a family history of allergies. Since these symptoms can also appear in other situations, diagnosis isn't based on changing milk alone, but on assessing the overall picture and, if appropriate, deciding on a well-directed trial with a specific formula.</p><br><p><strong>What type of formula is typically used for CMPA, and for how long?</strong></p><br><p>CMPA is usually managed with extensively hydrolyzed formulas or, in certain cases, amino-acid-based formulas, always tailored to each baby's age and clinical situation. The duration of use and the gradual reintroduction of milk proteins are planned step by step, with periodic monitoring, to check tolerance and adjust the timeline according to progress.</p><br><p><strong>Is it a good idea to try a lactose-free milk or special formula “on our own”?</strong></p><br><p>Changing milk without clear medical guidance can make it harder to interpret symptoms and complicate the diagnosis later on, especially when an allergy or intolerance is suspected. For this reason, it's usually better to make formula changes as part of an organized plan, where it's clear what you're looking to observe, for how long, and what steps to follow depending on the response.</p>",
            },
          },
          it:{
            dudasFrecuentes: 
            { 
              order: 0,
              title: "Dudas frecuentes sobre digestivo infantil",
              text: "<p>A lo largo de la infancia es muy frecuente que aparezcan dudas sobre síntomas digestivos, alimentación o heces, y muchas veces la respuesta depende mucho de cada niña o niño. Como resultado de años de experiencia en consulta de digestivo infantil y gastroenterología pediátrica, he reunido aquí algunas de las preguntas más habituales que plantean las familias.</p>",
            },
            reflujoVomitosGases: 
            { 
              order: 1,
              title: "Reflujo, vómitos y gases",
              text: "<p><strong>¿Es normal que mi bebé regurgite tanto después de las tomas o puede ser reflujo gastroesofágico infantil?</strong><br>En los primeros meses es habitual que muchos bebés regurgiten pequeñas cantidades de leche, sobre todo si tragan aire o si la toma ha sido muy abundante. Sin embargo, si las regurgitaciones son muy frecuentes, molestas, con mal crecimiento o se acompañan de llanto intenso y rechazo de las tomas, conviene valorar si hay un reflujo gastroesofágico que requiera seguimiento específico por pediatra digestivo.</p></br><p><strong>¿Cuándo debo preocuparme por los vómitos y pensar en un problema digestivo?</strong><br>Los vómitos ocasionales, en el contexto de una gastroenteritis leve, suelen ser autolimitados y mejorar en uno o dos días con buena hidratación. Si los vómitos se repiten, son muy intensos, aparecen con dolor de barriga fuerte, fiebre, decaimiento, pérdida de peso o dificultad para beber, es importante consultar para valorar si es necesario estudiar mejor el aparato digestivo.</p></br></br><p><strong>¿Qué puedo hacer si mi bebé tiene muchos gases y está muy irritable después de comer?</strong><br>Los gases y la tripita hinchada son muy frecuentes en lactantes, sobre todo en las primeras semanas, y suelen mejorar con el tiempo, cambios suaves en la postura y, en algunos casos, revisando la técnica de agarre al pecho o al biberón. Si el malestar es muy intenso, el bebé llora inconsolablemente, duerme mal o parece tener dolor significativo, puede ser útil revisar el patrón de alimentación y descartar otros problemas digestivos que a veces no se detectan sin una valoración más detallada.</p>",
            },
            estrenimientoHeces: 
            { 
              order: 2,
              title: "Estreñimiento, heces y color",
              text: "<p><strong>¿Cuándo se considera que un bebé o una niña/un niño tiene estreñimiento y qué se puede hacer en casa?</strong><br>No todas las criaturas hacen caca cada día; algunas pueden estar uno o dos días sin deposición y seguir siendo normal si cuando hacen caca es blanda y sin esfuerzo. Se habla de estreñimiento infantil cuando las heces son muy duras, escasas, cuesta expulsarlas o se acompañan de dolor, y en esos casos pueden ayudar cambios en la dieta, en la hidratación y, si no mejora, una revisión más concreta del hábito intestinal.</p></br><p><strong>¿Es normal estar varios días sin hacer caca o puede ser un problema de estreñimiento infantil?</strong><br>En ciertas edades es posible que una niña o un niño esté varios días sin deposiciones y se mantenga bien, sin dolor ni distensión abdominal, lo que puede seguir considerándose dentro de la normalidad. Si el intervalo entre cacas se alarga mucho, la caca es muy dura, el momento de ir al baño se vive con miedo o dolor o aparecen manchitas en la ropa interior, es recomendable valorar si se trata de un estreñimiento que requiera un plan de manejo más estructurado.</p></br><p><strong>¿Qué significa que haya sangre en las heces o heces muy duras y dolor al ir al baño?</strong><br>La presencia de sangre roja sobre heces muy duras puede deberse a pequeñas fisuras anales provocadas por el esfuerzo, algo relativamente frecuente en el estreñimiento infantil. Si la sangre es repetida, aparece mezclada con la caca, se acompaña de dolor abdominal, diarrea, fiebre o pérdida de peso, es importante no normalizarlo y estudiar con calma qué está ocurriendo en el intestino.</p></br><p><strong>¿Es normal el color de la caca de mi bebé o debo preocuparme?</strong><br>El color de las heces puede variar mucho según la edad y el tipo de alimentación: tonos mostaza o verdosos son habituales en lactantes, y marrones de distintas intensidades suelen ser normales en niñas y niños mayores. En cambio, heces muy pálidas o blanquecinas, negras (sin tomar hierro) o con sangre visible son signos de alarma que conviene comentar cuanto antes para decidir si es necesario hacer alguna prueba o seguimiento más estrecho.</p>",
            },
            dolorAbdominalColicos: 
            { 
              order: 3,
              title: "Dolor abdominal y cólicos",
              text: "<p><strong>¿Cuándo es “normal” el dolor de tripa y cuándo puede indicar un problema digestivo más importante?</strong><br>Molestias de barriga leves y pasajeras son frecuentes en la infancia, a veces relacionadas con virus, cambios de alimentación o situaciones de estrés. Si el dolor es intenso, despierta por la noche, se repite con frecuencia, limita la actividad diaria o se acompaña de otros síntomas (fiebre, vómitos, pérdida de peso, diarrea o estreñimiento persistente), suele ser buena idea analizarlo con más detalle.</p></br><p><strong>¿Qué diferencia hay entre cólicos del lactante y un dolor abdominal que requiere otra valoración?</strong><br>Los cólicos del lactante se caracterizan por episodios de llanto intenso en bebés sanos, sobre todo al final del día, con exploración normal y buen crecimiento. Cuando el dolor se asocia a vómitos biliosos, distensión marcada de la barriga, fiebre, mal estado general o falta de ganancia de peso, se sale del cuadro típico de cólico y puede hacer falta una valoración más específica del sistema digestivo.</p></br><p><strong>Mi criatura se queja a menudo de dolor de barriga, pero las pruebas salen normales: ¿puede ser dolor abdominal funcional?</strong><br>En muchas niñas y niños el dolor de barriga recurrente no se debe a una enfermedad estructural y se denomina dolor abdominal funcional, donde influyen factores intestinales y también emocionales. Aunque las pruebas básicas sean normales, un plan adaptado a cada caso (explicaciones, hábitos digestivos, manejo del estrés y, a veces, tratamientos específicos) puede marcar la diferencia.</p>",
            },
            alimentacionAlergias: 
            { 
              order: 4,
              title: "Alimentación, alergias e intolerancias",
              text: "<p><strong>¿Cómo saber si hay alergia o intolerancia a la leche de vaca u otros alimentos por síntomas digestivos?</strong><br>Algunos síntomas digestivos como vómitos frecuentes, diarrea, dolor abdominal, sangre en heces o rechazo de las tomas pueden asociarse a alergia o intolerancia a alimentos, incluida la alergia a la proteína de leche de vaca (APLV), aunque no siempre la causa es esa. Como el diagnóstico no debe basarse solo en quitar alimentos por cuenta propia, suele ser necesario valorar la historia completa, explorar y, en ocasiones, realizar pruebas o dietas dirigidas.</p></br><p><strong>¿Qué alimentos son recomendables si hay estreñimiento o diarrea frecuentes?</strong><br>En el estreñimiento infantil suelen ayudar la fibra (fruta, verdura, legumbres, cereales integrales), una buena hidratación y evitar un exceso de ultraprocesados y bollería. En episodios de diarrea, en cambio, interesa ofrecer líquidos frecuentes, alimentación ligera y adecuada a la edad y ajustar poco a poco la dieta según la tolerancia, revisando el caso si las diarreas se repiten o se prolongan.</p></br><p><strong>¿Cuándo conviene cambiar la leche de fórmula por problemas digestivos y quién debe indicarlo?</strong><br>No siempre que hay cólicos, gases o regurgitaciones es necesario cambiar de fórmula; en muchos casos bastan ajustes en la cantidad, el ritmo de las tomas o la postura. Cuando se sospecha una alergia, una intolerancia o un problema digestivo más complejo, elegir otro tipo de fórmula (hidrolizada, extensamente hidrolizada, etc.) debería hacerse tras valorar la situación global, para escoger la opción más adecuada.</p>",
            },
            sintomasAlarma: 
            { 
              order: 5,
              title: "Síntomas de alarma y pruebas",
              text: "<strong>¿Qué signos digestivos indican que no conviene esperar y es mejor una valoración más detallada?</strong><br>Algunas señales que requieren atención son el dolor abdominal intenso o persistente, vómitos repetidos (sobre todo verdes o con sangre), diarreas con sangre, fiebre prolongada, pérdida de peso o rechazo de la comida y la bebida. También es importante consultar cuando hay cambios llamativos en las heces (muy pálidas, negras sin tratamiento con hierro, o muy dolorosas) o un estreñimiento muy prolongado que no mejora con medidas básicas.</p></br><p><strong>¿Cuándo es mejor que el dolor de barriga, el reflujo o el estreñimiento los vea un pediatra de digestivo y no solo el pediatra general?</strong><br>El pediatra de cabecera suele ser la primera referencia y puede resolver una gran parte de los problemas digestivos habituales. Cuando los síntomas se mantienen en el tiempo, son muy limitantes o se repiten a pesar de las primeras medidas, es cuando suele plantearse una valoración más específica de digestivo infantil para decidir si hacen falta estudios adicionales o un plan más especializado.</p></br><p><strong>¿Qué pruebas se suelen hacer en digestivo infantil para estudiar estos problemas?</strong><br>Dependiendo de los síntomas, pueden solicitarse análisis de sangre y heces, ecografía abdominal u otras pruebas de imagen para ver cómo está el aparato digestivo. En algunos casos concretos, cuando se considera necesario, también se pueden indicar pruebas como endoscopia o estudios de alergia alimentaria, siempre valorando riesgos y beneficios en cada niña o niño.</p>",
            },
            enfermedadCeliaca: 
            { 
              order: 6,
              title: "Dudas frecuentes sobre enfermedad celíaca",
              text: "<p><strong>Acabamos de recibir un diagnóstico de enfermedad celíaca: ¿por dónde empezamos?</strong><br>El primer paso suele ser entender que la base del tratamiento es una alimentación sin gluten estricta y mantenida en el tiempo, lo que permite que el intestino se recupere y la niña o el niño crezca con normalidad. Al principio es habitual sentirse abrumadas por cambios en la compra, en el colegio o en cumpleaños, por lo que puede ayudar ir resolviendo dudas poco a poco y revisar el plan de alimentación y controles según vaya avanzando la adaptación.</p></br><p><strong>¿Es normal seguir con molestias digestivas tras empezar la dieta sin gluten?</strong><br>En algunos casos las molestias (dolor de barriga, gases, cansancio) tardan un tiempo en mejorar del todo, incluso tras retirar el gluten, porque el intestino necesita un periodo para recuperarse. Cuando los síntomas persisten más de lo esperable o aparecen signos nuevos, suele ser buen momento para comentar la situación, revisar la dieta y, si hace falta, ajustar el seguimiento o plantear estudios adicionales.</p></br><p><strong>Nos han dicho que podría ser celiaquía pero las pruebas no son concluyentes, ¿qué hacemos mientras?</strong><br>Hay niñas y niños con síntomas y serología o biopsias poco claras, en los que el diagnóstico definitivo puede requerir tiempo y controles periódicos. En estos casos, es importante decidir de forma razonada si mantener o no el gluten, evitar restricciones innecesarias y planificar juntos los siguientes pasos (nuevas analíticas, revisiones, etc.).</p></br><p><strong>¿Cómo podemos manejar el día a día sin gluten en el colegio, el comedor y las actividades sociales?</strong><br>Explicar de forma sencilla la situación al entorno escolar y familiar suele facilitar que se respeten las medidas de seguridad con la comida y se reduzca el riesgo de contaminaciones. Aun así, es normal que surjan dudas sobre fiestas, viajes, campamentos o comidas fuera de casa, y muchas veces una orientación personalizada ayuda a encontrar soluciones prácticas que encajen con la edad y el estilo de vida de cada criatura.</p>",
            },
            cambiosFormula: 
            { 
              order: 7,
              title: "Cambios de fórmula y APLV",
              text: "<p><strong>Nos han cambiado varias veces de leche de fórmula por gases, cólicos o reflujo, ¿es realmente necesario?</strong><br>En los primeros meses se tiende a atribuir muchos síntomas digestivos (cólicos, regurgitaciones, gases) al tipo de leche, y eso puede llevar a encadenar cambios de fórmula sin un beneficio claro. Antes de seguir probando leches diferentes, suele ser útil revisar la cantidad y el ritmo de las tomas, la técnica, las posturas y la evolución del peso, para decidir de forma más calmada si el problema se relaciona con la fórmula o con otros factores.</p></br><p><strong>¿Cuándo hay que sospechar alergia a la proteína de leche de vaca (APLV) en bebés con problemas digestivos?</strong><br>Además de los cólicos y las regurgitaciones, la APLV puede asociarse a otros signos como irritabilidad marcada, diarrea, sangre en heces, dermatitis intensa, dificultad para ganar peso o antecedentes familiares de alergias. Como estos síntomas también pueden aparecer en otras situaciones, el diagnóstico no se basa solo en cambiar de leche, sino en valorar el conjunto del cuadro y decidir, si procede, un ensayo bien dirigido con una fórmula específica.</p></br><p><strong>¿Qué tipo de fórmula se suele usar en la APLV y durante cuánto tiempo?</strong><br>En la APLV se suelen emplear fórmulas extensamente hidrolizadas o, en determinados casos, fórmulas de aminoácidos, siempre adaptadas a la edad y la situación clínica de cada bebé. La duración del uso y la reintroducción de proteínas lácteas se planifican de forma gradual, con controles periódicos, para comprobar la tolerancia y ajustar el calendario según la evolución.</p></br><p><strong>¿Es buena idea probar “por nuestra cuenta” una leche sin lactosa o una fórmula especial?</strong><br>Cambiar de leche sin una indicación clara puede dificultar la interpretación de los síntomas y hacer más complejo el diagnóstico posterior, sobre todo cuando se sospecha alergia o intolerancia. Por eso suele ser preferible decidir los cambios de fórmula dentro de un plan organizado, en el que se sepa qué se quiere observar, durante cuánto tiempo y qué pasos seguir en función de la respuesta.</p>",
            },
          },
      };

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

  // Extraer contenido y asegurar ordenamiento ascendente por 'order'
  const translations = pageData?.content?.[lang] || navText[lang] || pageData?.content?.["es"];
  const pageSettings =  pageData?.content || navText;
  const sectionsArray = translations 
    ? Object.entries(translations)
        .map(([key, section]) => ({ id: key, ...section }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // Orden ascendente por 'order'
    : [];

  return (

    <main className="max-w-7xl mx-auto px-15 py-28 space-y-0 text-secondary-custom">
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
                {section.imageBase64 && section.imageBase64.trim() !== "" && (
                  <img 
                  className="relative w-full h-[480px] object-contain"  
                  src={section.imageBase64} 
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