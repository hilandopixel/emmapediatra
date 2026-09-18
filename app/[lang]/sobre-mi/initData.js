import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

// 1. Generar metadatos dinámicos (SEO) desde Firebase según el idioma
export async function generateMetadata({ params }) {
  const { lang } = await params;
  
  try {
  
  await setDoc(doc(db, "pages", "sobre-mi"), {
  "seo": {
    "es": { "title": "Sobre mí | Dpto Pediátrico", "description": "Conoce a la Dra..." },
    "en": { "title": "About Me | Pediatric Care", "description": "Meet Dr..." }
  },
  "content": {
    "es": {
      "title": "Sobre mí",
      "paragraphs": [
        "Soy la <strong>Dra. Emma López Rubio</strong>, pediatra especializada en gastroenterologia...",
        "Trabajo como pediatra de atención primaria..."
      ]
    },
    "en": {
      "title": "About Me",
      "paragraphs": [
        "I am <strong>Dr. Emma López Rubio</strong>, a pediatrician specializing in gastroenterology...",
        "I work as a primary care pediatrician..."
      ]
    }
  }
});
  
    return {
      title: seo.title,
      description: seo.description,
    };
  } catch (error) {
    console.error("Error al cargar SEO desde Firebase:", error);
    return { title: "Sobre mí" };
  }


}

// 2. Componente de la página renderizado en el servidor (SSR)
export default async function SobreMiPage({ params }) {
  const { lang } = await params;

  let pageData = null;

  try {
    // Obtenemos el documento de la página "sobre-mi" desde Firestore
    const docRef = doc(db, "pages", "sobre-mi");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      pageData = docSnap.data();
    }
  } catch (error) {
    console.error("Error al conectar con Firebase Firestore:", error);
  }

  // Fallback de textos por seguridad si Firebase no responde o está vacío
  const fallbackTexts = {
    title: "Sobre mí",
    paragraphs: [
      "No se ha podido cargar el contenido en este momento o la base de datos no está conectada."
    ]
  };

  // Seleccionamos los bloques de texto según el idioma actual ([lang])
  const content = pageData && pageData.content && pageData.content[lang] 
    ? pageData.content[lang] 
    : (pageData && pageData.content && pageData.content["es"] ? pageData.content["es"] : fallbackTexts);

  return (
    <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", lineHeight: "1.6" }}>
      <h1>{content.title}</h1>
      
      {/* Renderizado de párrafos aplicando la estructura HTML requerida */}
      {content.paragraphs.map((parrafoHtml, index) => (
        <span key={index} dangerouslySetInnerHTML={{ __html: `<br><p>${parrafoHtml}</p>` }} />
      ))}
    </main>
  );
}