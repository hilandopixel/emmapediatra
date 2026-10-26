// app/area-privada/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import AuthForm from "@/components/AuthForm";

export default function AreaPrivadaPage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPostSlug, setSelectedPostSlug] = useState(null);

  // Referencia para el contenedor con scroll snap
  const carouselRef = useRef(null);

  // Estado para controlar qué menú de compartir está abierto
  const [openShareMenuId, setOpenShareMenuId] = useState(null);
  const [copiedPostId, setCopiedPostId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        try {
          // 1. Refrescar explícitamente el token de Firebase Auth para evitar estados en caché
          await currentUser.getIdToken(true);

          // 2. Consultar en Firestore pasando el email siempre en minúsculas
          const cleanEmail = currentUser.email.toLowerCase();
          const userRef = doc(db, "usuarios_autorizados", cleanEmail);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            setUserData({ activo: false, roles: [] });
          }
        } catch (err) {
          console.error("Error al obtener datos del usuario:", err);
          setUserData({ activo: false, roles: [] });
        }
      } else {
        setUserData(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || userData?.activo === false) return;

    const fetchData = async () => {
      try {
        setLoadingPosts(true);
        const catSnap = await getDocs(collection(db, "categories"));
        const catList = [];
        
        catSnap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const catName = data.name || docSnap.id;
          catList.push({ id: docSnap.id, name: catName });
        });

        setCategories(catList);

        const postsSnap = await getDocs(collection(db, "posts"));
        const postsList = postsSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setPosts(postsList);
      } catch (err) {
        console.error("Error al cargar publicaciones:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchData();
  }, [user, userData]);

  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === "all") return true;
    return post.categoryIds && post.categoryIds.includes(selectedCategory);
  });

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setOpenShareMenuId(null);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  // Desplazamiento por botones usando Scroll Snap
  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.firstElementChild?.clientWidth || 300;
    const scrollAmount = direction === "next" ? cardWidth + 24 : -(cardWidth + 24);
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setOpenShareMenuId(null);
  };

  const handleCopyLink = (slug, postId) => {
    const postUrl = `${window.location.origin}/blog/${slug}`;
    navigator.clipboard.writeText(postUrl);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
    setOpenShareMenuId(null);
  };

  const handleShareWhatsApp = (title, slug) => {
    const postUrl = `${window.location.origin}/blog/${slug}`;
    const text = encodeURIComponent(`Mira este artículo: *${title}*\n${postUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    setOpenShareMenuId(null);
  };

  if (loadingAuth) {
    return <div className="text-center py-24 text-slate-700">Cargando área privada...</div>;
  }

  if (!user) {
    return (
      <div className="py-16">
        <AuthForm />
      </div>
    );
  }

  if (userData && userData.activo === false) {
    return (
      <div className="max-w-lg mx-auto my-24 bg-white p-8 rounded-2xl shadow-md border border-slate-100 text-center space-y-6">
        <h2 className="text-2xl font-bold text-primary-custom">Cuenta pendiente de validación</h2>
        <p className="text-slate-700 leading-relaxed text-sm">
          Hola <strong className="text-primary-custom">{userData.nombre || user.email}</strong>, tu cuenta ha sido registrada correctamente pero <strong className="text-primary-custom">aún no ha sido activada</strong>.
        </p>
        <button 
          onClick={() => signOut(auth)} 
          className="px-6 py-2.5 button-primary-custom text-xs font-bold rounded-xl transition"
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-2xl shadow-md border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-custom">Área Privada</h1>
          <p className="text-slate-700 mt-1">
            Bienvenido/a, <strong className="text-primary-custom">{userData?.nombre || user.email}</strong>
          </p>
        </div>
        <button 
          onClick={() => signOut(auth)} 
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 button-primary-custom text-xs font-bold rounded-lg transition"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Sección Carrusel Peek Mejorado */}
      <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-primary-custom">Artículos</h2>

        {/* Filtros de Categoría */}
        {!loadingPosts && (
          <div className="flex flex-wrap gap-2 pt-1 pb-2 border-b border-slate-100">
            <button
              onClick={() => handleCategorySelect("all")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition ${
                selectedCategory === "all"
                  ? "bg-primary-custom text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todas ({posts.length})
            </button>
            {categories.map((cat) => {
              const count = posts.filter(
                (p) => p.categoryIds && p.categoryIds.includes(cat.id)
              ).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition ${
                    selectedCategory === cat.id
                      ? "bg-primary-custom text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        )}

        {loadingPosts ? (
          <p className="text-sm text-slate-500 py-6 text-center">Cargando publicaciones...</p>
        ) : filteredPosts.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">
            No se encontraron artículos en esta categoría.
          </p>
        ) : (
          <div className="relative group">
            {/* Contenedor del Carrusel Peek */}
            <div 
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth py-4 px-4 scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="snap-center shrink-0 w-[72%] md:w-[48%] lg:w-[38%] h-[380px] bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition relative"
                >
                  {/* Bloque Superior: Portada y Título */}
                  <div className="space-y-3">
                    {post.coverImageUrl ? (
                      <img 
                        src={post.coverImageUrl} 
                        alt={post.title} 
                        className="w-full h-40 object-cover object-top rounded-xl border border-slate-100 cursor-pointer"
                        onClick={() => setSelectedPostSlug(post.slug)}
                      />
                    ) : (
                      <div 
                        onClick={() => setSelectedPostSlug(post.slug)}
                        className="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium cursor-pointer"
                      >
                        Ver artículo
                      </div>
                    )}

                    <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                  </div>

                  {/* Bloque Inferior: Botones */}
                  <div className="pt-3 space-y-2 mt-auto relative">
                    <button
                      onClick={() => setSelectedPostSlug(post.slug)}
                      className="w-full bg-primary-custom hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition text-center block"
                    >
                      Leer completo
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setOpenShareMenuId(openShareMenuId === post.id ? null : post.id)}
                        className="w-full bg-slate-200/80 hover:bg-slate-300/80 text-primary-custom text-xs font-bold py-2 px-4 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <span>🔗</span>
                        <span>{copiedPostId === post.id ? "¡Enlace copiado!" : "Compartir"}</span>
                      </button>

                      {openShareMenuId === post.id && (
                        <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-20 space-y-1 animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => handleCopyLink(post.slug, post.id)}
                            className="w-full text-left px-3 py-2 text-xs text-primary-custom font-semibold hover:bg-slate-100 rounded-lg flex items-center gap-2 transition"
                          >
                            <span>📋</span> Copiar enlace
                          </button>
                          <button
                            onClick={() => handleShareWhatsApp(post.title, post.slug)}
                            className="w-full text-left px-3 py-2 text-xs bg-green-700 font-semibold hover:bg-green-50 rounded-lg flex items-center gap-2 transition"
                          >
                            <span>💬</span> Enviar por WhatsApp
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Flechas de Navegación Flotantes */}
            {filteredPosts.length > 1 && (
              <>
                <button 
                  onClick={() => scrollCarousel("prev")}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-primary-custom hover:bg-white text-white font-bold rounded-full shadow-lg border border-slate-200 flex items-center justify-center transition backdrop-blur-sm"
                  aria-label="Anterior"
                >
                  ←
                </button>
                <button 
                  onClick={() => scrollCarousel("next")}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-primary-custom hover:bg-white text-white font-bold rounded-full shadow-lg border border-slate-200 flex items-center justify-center transition backdrop-blur-sm"
                  aria-label="Siguiente"
                >
                  →
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Popup / Modal Popup */}
      {selectedPostSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-semibold text-slate-500">Vista previa del artículo</span>
              <button
                onClick={() => setSelectedPostSlug(null)}
                className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded-full text-slate-700 font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 w-full h-full bg-white">
              <iframe
                src={`/blog/${selectedPostSlug}`}
                className="w-full h-full border-0"
                title="Detalle del artículo"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}