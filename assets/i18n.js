// Diccionario base / Fallback inicial por si no hay conexión
export let translations = {
  es: {
    nav_about: "Sobre Mí",
    nav_nutrition: "Nutrición",
    nav_diets: "Dietas",
    nav_sponsors: "Sponsors",
    nav_contact: "Contacto",
    nav_blog: "Blog",
    hero_title: "Revoluciona tu salud con Nutrición Real en Córdoba.",
    hero_desc: "¿No puedes más con dietas poco eficientes? Soy tu especialista en dietas personalizadas y reeducación alimentaria en el corazón de la Subbética. Recupera tu energía de forma sostenible.",
    hero_btn_contact: "Consúltame",
    hero_btn_method: "Ver Metodología",
    about_tag: "Tu Nutricionista de Confianza",
    about_title: "Creemos hábitos alimenticios reales, adaptados a tu vida diaria.",
    about_desc: "Como nutricionista de referencia en la Subbética Cordobesa, ofrezco un seguimiento cercano y adaptado a tus gustos y horarios. Trabajamos juntos sin restricciones.",
    about_spec: "Especialidades: Control de peso, nutrición clínica (digestiva/hormonal) y nutrición deportiva.",
    contact_title: "¿Hablamos de tus objetivos?",
    contact_desc: "Hablemos. Da el paso hacia tu bienestar.",
    contact_btn: "Contactar",
    diets_title: "Dietas Personalizadas",
    diets_desc: "Planes orientados a la pérdida de grasa corporal o rendimiento físico utilizando productos locales y menús flexibles que encajan con tu día a día.",
    diets_item1: "Menús semanales adaptados a tu entorno",
    diets_item2: "Listas de la compra inteligentes",
    nutritiondeportiva_title: "Nutrición Deportiva",
    nutritiondeportiva_desc: "Planificación adaptada a tus entrenamientos y objetivos. construimos un plan nutricional personal para el día de la competición para sacar el máximo rendimiento.",
    nutritiondeportiva_item1: "Entrenamiento gástrico",
    nutritiondeportiva_item2: "Estabilidad energética",
    nutrition_title: "Nutrición Pre-Competición Personalizada",
    nutrition_desc: "Te planifico y asesoro en la semana pre competición para que saques el máximo rendimiento.",
    nutrition_item1: "Educación nutricional sin mitos",
    nutrition_item2: "Abordaje de energía",
    sponsors_title: "Colaboradores y proyectos aliados",
    blog_tag: "Divulgación",
    blog_title: "Últimas Entradas del Blog",
    blog_desc: "Artículos de nutrición real, salud y bienestar respaldados por ciencia.",
    read_more: "Leer artículo completo"
  },
  en: {
    nav_about: "About Me",
    nav_nutrition: "Nutrition",
    nav_diets: "Diets",
    nav_sponsors: "Sponsors",
    nav_contact: "Contact",
    nav_blog: "Blog",
    hero_title: "Revolutionize your health with Real Nutrition in Cordoba.",
    hero_desc: "Tired of inefficient diets? I am your specialist in personalized diets and nutritional re-education in the heart of Subbética. Regain your energy sustainably.",
    hero_btn_contact: "Contact Me",
    hero_btn_method: "Our Methodology",
    about_tag: "Your Trusted Nutritionist",
    about_title: "Let's build real eating habits adapted to your daily life.",
    about_desc: "As a reference nutritionist in Subbética Cordobesa, I offer close monitoring tailored to your tastes and schedules. We work together without restrictions.",
    about_spec: "Specialties: Weight control, clinical nutrition (digestive/hormonal), and sports nutrition.",
    contact_title: "Shall we talk about your goals?",
    contact_desc: "Let's talk. Take the step towards your well-being.",
    contact_btn: "Contact",
    diets_title: "Personalized Diets",
    diets_desc: "Plans focused on body fat loss or physical performance using local products and flexible menus that fit into your daily routine.",
    diets_item1: "Weekly menus tailored to your lifestyle",
    diets_item2: "Smart shopping lists",
    nutritiondeportiva_title: "Sports Nutrition",
    nutritiondeportiva_desc: "A training plan tailored to your workouts and goals. We create a personalized nutrition plan for race day to help you achieve peak performance.",
    nutritiondeportiva_item1: "Gastric training",
    nutritiondeportiva_item2: "Energy stability",
    nutrition_title: "Personalized Pre-Competition Nutrition",
    nutrition_desc: "I plan and advise you during the pre-competition week to help you achieve peak performance.",
    nutrition_item1: "Myth-free nutritional education",
    nutrition_item2: "Energy management approach",
    sponsors_title: "Partners and allied projects",
    blog_tag: "Outreach",
    blog_title: "Latest Blog Posts",
    blog_desc: "Articles on real nutrition, health, and wellness backed by science.",
    read_more: "Read full article"
  }
};

// Cargar traducciones desde el almacenamiento local si existen
const cachedTrans = localStorage.getItem('site_translations_cache');
if (cachedTrans) {
  try {
    translations = JSON.parse(cachedTrans);
  } catch (e) { console.error("Error al leer caché de i18n", e); }
}

export function updateTranslationsDictionary(newTranslations) {
  translations = newTranslations;
  localStorage.setItem('site_translations_cache', JSON.stringify(newTranslations));
}

export function getLanguage() {
  return localStorage.getItem('app_lang') || 'es';
}

export function setLanguage(lang) {
  localStorage.setItem('app_lang', lang);
  const currentLang = translations[lang] ? lang : 'es';
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang] && translations[currentLang][key] !== undefined) {
      el.textContent = translations[currentLang][key];
    }
  });

  document.querySelectorAll('button[onclick*="changeLang"]').forEach(btn => {
    if (btn.getAttribute('onclick').includes(`'${currentLang}'`)) {
      btn.classList.add('opacity-100', 'font-extrabold', 'text-teal-600');
      btn.classList.remove('opacity-50');
    } else {
      btn.classList.add('opacity-50');
      btn.classList.remove('opacity-100', 'font-extrabold', 'text-teal-600');
    }
  });

  window.dispatchEvent(new CustomEvent('languageChanged', { detail: currentLang }));
}