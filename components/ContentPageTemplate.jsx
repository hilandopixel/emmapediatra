import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export async function generatePageMetadata(pageId, staticDocs, params) {
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
    const seoFallback = staticDocs?.seo?.[lang] || staticDocs?.seo?.["es"] || {};
    return { 
      title: seoFallback.title || pageId,
      description: seoFallback.description || "",
      keywords: seoFallback.keywords || ""
    };
  }
}

export default async function ContentPageTemplate({ pageId, staticDocs, params }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "es";

  let pageData = null;
  try {
    const docRef = doc(db, "pages", pageId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      pageData = docSnap.data();
    }
  } catch (error) {
    console.error("Error al conectar con base de datos:", error);
  }

  const contentTranslation = pageData?.content?.[lang] || staticDocs?.content[lang] || pageData?.content?.["es"];
  const pageSettings = pageData?.content || staticDocs?.content;
  
  const sectionsArray = contentTranslation?.sections 
    ? Object.entries(contentTranslation?.sections)
        .map(([key, section]) => ({ id: key, ...section }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  return (
    <main className="max-w-7xl mx-auto px-6 py-28 space-y-0 text-secondary-custom">
        {pageSettings?.image && pageSettings?.image.trim() !== "" && (
          <div className="relative w-full">
              <img className="relative w-full align-bottom" src={pageSettings?.image} alt="Banner" />
              <div 
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  style={{ background: "linear-gradient(135deg, rgba(255,152,186,0.75) 26%, rgba(192,192,192,0.75) 52%, rgba(255,254,255,0.75) 100%)" }}
              />
          </div>
        )}

      {sectionsArray.map((section) => {
        if (!section) return null;
        const contentArray = Array.isArray(section?.content) 
          ? section.content.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) 
          : section?.content ? Object.values(section.content) : [];

        return (
          <section key={section.id} id={section.id} className="hilando-pixel-section">
             <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
                {contentArray?.map((c, index) => (
                  <div key={index} className="space-y-4">
                    {c.image && c.image.trim() !== "" && (
                      <img id={c.id} className="relative w-full h-[480px] object-contain" src={c.image} alt="Descriptiva" />
                    )}
                    {c.title && c.title.trim() !== "" && (
                      <h2 id={c.id} className="text-3xl sm:text-5xl font-extrabold tracking-tight" dangerouslySetInnerHTML={{ __html: c.title }} />
                    )}
                    {c.subtitle && c.subtitle.trim() !== "" && (
                      <h3 id={c.id} className="text-xl sm:text-2xl tracking-tight" dangerouslySetInnerHTML={{ __html: c.subtitle }} />
                    )}
                    {c.text && c.text.trim() !== "" && (
                      <div id={c.id} className="text-lg font-light leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: c.text }} />
                    )}
                    {c.buttonLink && c.buttonLink.trim() !== "" && c.buttonText && c.buttonText.trim() !== "" && (
                      <a id={c.id} href={c.buttonLink} className="button-link inline-block px-10 py-4 bg-primary-custom hover:bg-[#266360] text-white font-bold rounded-xl transition transform hover:scale-105">
                        {c.buttonText}
                      </a>
                    )}
                    {c.htmlEmbbeded && c.htmlEmbbeded.trim() !== "" && (
                      <div id={c.id} dangerouslySetInnerHTML={{ __html: c.htmlEmbbeded }} />
                    )}
                  </div>
                ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}