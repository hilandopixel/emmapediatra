// app/area-privada/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import AuthSimpleForm from "@/components/AuthSimpleForm";

export default function AreaPrivadaPage() {
  const [userData, setUserData] = useState(null);
  const [loadingCheck, setLoadingCheck] = useState(true);

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPostSlug, setSelectedPostSlug] = useState(null);

  const carouselRef = useRef(null);
  const [openShareMenuId, setOpenShareMenuId] = useState(null);
  const [copiedPostId, setCopiedPostId] = useState(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("area_privada_email");
    if (savedEmail) {
      verificarAccesoDirecto(savedEmail);
    } else {
      setLoadingCheck(false);
    }
  }, []);

  const verificarAccesoDirecto = async (emailToVerify) => {
    setLoadingCheck(true);

    try {
      const res = await fetch("/api/simple-verify-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToVerify }),
      });

      const data = await res.json();

      if (res.ok && data.permitido) {
        handleAuthSuccess(data.userData);
      } else {
        localStorage.removeItem("area_privada_email");
        setUserData(null);
      }
    } catch (err) {
      console.error("Error al consultar el acceso:", err);
      setUserData(null);
    } finally {
      setLoadingCheck(false);
    }
  };

  const handleAuthSuccess = (verifiedUserData) => {
    setUserData(verifiedUserData);
    localStorage.setItem("area_privada_email", verifiedUserData.email);
    cargarArticulosYCategorias();
  };

  const handleLogout = () => {
    localStorage.removeItem("area_privada_email");
    setUserData(null);
  };

  const cargarArticulosYCategorias = async () => {
    try {
      setLoadingPosts(true);
      
      const catSnap = await getDocs(collection(db, "categories"));
      const catList = catSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        name: docSnap.data().name || docSnap.id,
      }));
      setCategories(catList);

      const postsSnap = await getDocs(collection(db, "posts"));
      const postsList = postsSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Ordenar por fecha de modificación (o creación) descendente
      postsList.sort((a, b) => {
        const timeA = a.updatedAt?.toDate 
          ? a.updatedAt.toDate().getTime() 
          : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
        const timeB = b.updatedAt?.toDate 
          ? b.updatedAt.toDate().getTime() 
          : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);

        return timeB - timeA;
      });

      setPosts(postsList);
    } catch (err) {
      console.error("Error al cargar publicaciones:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

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

  if (loadingCheck) {
    return <div className="text-center py-24 text-slate-700 text-sm">Cargando área privada...</div>;
  }

  // SI NO ESTÁ VALIDADO: Mostrar el componente AuthSimpleForm interactivo
  if (!userData) {
    return (
      <main className="max-w-md mx-auto my-16 px-4">
        <AuthSimpleForm onVerifySuccess={handleAuthSuccess} />
      </main>
    );
  }

  // SI TIENE ACCESO ACTIVO: Área privada completa
  return (
    <main className="max-w-5xl mx-auto px-6 py-16 space-y-8">
      <div className="flex justify-between items-center bg-white p-8 rounded-2xl shadow-md border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-custom">Área Privada</h1>
          <p className="text-slate-700 mt-1">
            Bienvenido/a, <strong className="text-primary-custom">{userData.nombre || userData.email}</strong>
          </p>
        </div>
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-primary-custom text-xs font-bold rounded-lg transition"
        >
          Salir
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-primary-custom">Artículos</h2>

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

                    <h3 className="font-bold text-primary-custom  text-base leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="text-slate-800 text-base leading-snug line-clamp-2">
                      {post.content}
                    </div>
                  </div>

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