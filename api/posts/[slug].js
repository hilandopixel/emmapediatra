import admin from "firebase-admin";

function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  return key.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getPrivateKey(),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // 1. Obtener el slug y el idioma de la URL (req.query)
  const { slug, lang } = req.query;

  if (!slug) {
    return res.status(404).send("Artículo no encontrado");
  }

  try {
    const docRef = db.collection("posts").doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).send("<h1>404 - Artículo no encontrado</h1>");
    }

    const data = docSnap.data();

    // 2. Determinar idioma (por defecto 'es' si no viene en la URL)
    const selectedLang = (lang === 'en') ? 'en' : 'es';

    // 3. Extraer el objeto según el idioma o usar el idioma raíz/español
    const contentObj = data[selectedLang] || data.es || data;

    // 4. Asignación robusta de variables con respaldo (fallback)
    const titulo = contentObj.titulo || data.titulo || "Sin título";
    const extracto = contentObj.extracto || data.extracto || "";
    const metaDescription = contentObj.metaDesc || extracto || "Artículo de nutrición real.";
    
    // Si el contenido HTML formateado no existe en el idioma, tomar extracto o raíz
    const contenidoHtml = contentObj.contenido || data.contenido || extracto || "";

    // 5. Formatear la fecha según el idioma seleccionado
    let fecha = "";
    if (data.fecha) {
      const dateObj = data.fecha.toDate ? data.fecha.toDate() : new Date(data.fecha.seconds * 1000);
      fecha = dateObj.toLocaleDateString(selectedLang === 'en' ? 'en-US' : 'es-ES', {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    const imageTag = data.imagen
      ? `<img src="${data.imagen}" alt="${titulo}" class="w-full max-h-[500px] object-cover rounded-3xl shadow-xl">`
      : "";

    const tagsList = Array.isArray(data.tags) ? data.tags.join(", ") : "";
    const postUrl = `https://${req.headers.host}/posts/${slug}?lang=${selectedLang}`;
    const imageUrl = data.imagen || `https://${req.headers.host}/assets/logo2.png`;

    const htmlContent = `<!DOCTYPE html>
<html lang="${selectedLang}" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titulo} | Nutrición Dani Luque</title>
    
    <meta name="description" content="${metaDescription}">
    <meta name="keywords" content="${tagsList}">
    <meta name="author" content="Dani Luque">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${postUrl}">

    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Nutrición Dani Luque">
    <meta property="og:title" content="${titulo}">
    <meta property="og:description" content="${metaDescription}">
    <meta property="og:url" content="${postUrl}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="article:published_time" content="${fecha}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${titulo}">
    <meta name="twitter:description" content="${metaDescription}">
    <meta name="twitter:image" content="${imageUrl}">

    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link rel="stylesheet" href="/assets/style.css">
    <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "MedicalBusiness"],
      "@id": "https://nutriciondaniluque.es",
      "name": "Nutrición Dani Luque | Nutricionista 100% Online",
      "image": "https://www.nutriciondaniluque.es/assets/logo2.png",
      "url": "https://nutriciondaniluque.es",
      "telephone": "+34609083012",
      "description": "Olvídate de las dietas genéricas. Consigue un plan de nutrición clínica o deportiva totalmente personalizado, adaptado a tus objetivos, tu estilo de vida y tus necesidades.",
      "sameAs": [
        "https://www.facebook.com/profile.php?id=61594394693431",
        "https://www.instagram.com/nutriciondaniluque",
        "https://wa.me/34609083012",
      ]
    },
    {
      "@type": "Blog",
      "@id": "${postUrl}",
      "url": "${postUrl}",
      "name": "${titulo}",
      "description": "${metaDescription}",
      "publisher": {
        "@id": "https://nutriciondaniluque.es"
      }
    }
  ]
}
</script>
</head>
<body class="min-h-screen text-slate-800 flex flex-col justify-between">
    <main class="max-w-4xl mx-auto px-6 py-28 w-full flex-grow">
        <article class="space-y-8">
            <div class="space-y-4 text-center">
                <span class="text-xs font-bold uppercase text-teal-600">${fecha}</span>
                <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900">${titulo}</h1>
            </div>
            ${imageTag}
            <div class="p-8 space-y-6 text-slate-700 leading-relaxed text-lg whitespace-pre-line">${contenidoHtml}</div>
        </article>
    </main>
    <script type="module">
        import { initHeader } from "/firebase-config.js";
        initHeader();
    </script>
</body>
</html>`;

    res.setHeader("Cache-Control", "public, max-age=600, s-maxage=600");
    return res.status(200).send(htmlContent);
  } catch (error) {
    console.error("Error al servir el post:", error);
    return res.status(500).send("Error interno del servidor");
  }
}