"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import AuthForm from "@/components/AuthForm";
import PdfViewerWrapper from "@/components/PdfViewerWrapper"; // Reutilizamos el visor de PDF

export default function AreaPrivadaPage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Estados para posts, categorías, filtros y modal
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPostSlug, setSelectedPostSlug] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        try {
          const userRef = doc(db, "usuarios_autorizados", currentUser.email.toLowerCase());
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

  // Cargar Posts y Categorías cuando el usuario esté logueado y activo
  useEffect(() => {
    if (!user || userData?.activo === false) return;

    const fetchData = async () => {
      try {
        setLoadingPosts(true);
        // 1. Cargar categorías
        const catSnap = await getDocs(collection(db, "categories"));
        const catMap = {};
        const catList = [];
        
        catSnap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const catName = data.name || docSnap.id;
          catMap[docSnap.id] = catName;
          catList.push({ id: docSnap.id, name: catName });
        });

        setCategoriesMap(catMap);
        setCategories(catList);

        // 2. Cargar artículos
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

  // Filtrado de posts según categoría
  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === "all") return true;
    return post.categoryIds && post.categoryIds.includes(selectedCategory);
  });

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentSlide(0);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % filteredPosts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + filteredPosts.length) % filteredPosts.length);
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

      {/* Sección Carrusel de Posts */}
      <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-primary-custom">Artículos de Blog Exclusivos</h2>

        {/* Filtros de Categoría */}
        {!loadingPosts && (
          <div className="flex flex-wrap gap-2 pt-1 pb-2 border-b border-slate-100">
            <button
              onClick={() => handleCategorySelect("all")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition ${
                selectedCategory === "all"
                  ? "bg-black text-white shadow-sm"
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
                      ? "bg-black text-white shadow-sm"
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
          <div className="relative overflow-hidden p-2">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {filteredPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="min-w-full md:min-w-[48%] lg:min-w-[31%] bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shrink-0 shadow-sm hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    {/* Visualización multimedia: Imagen o Miniatura PDF */}
                    {post.coverImageUrl ? (
                      <img 
                        src={post.coverImageUrl} 
                        alt={post.title} 
                        className="w-full h-44 object-cover rounded-xl border border-slate-100"
                      />
                    ) : post.pdfUrl ? (
                      <div 
                        onClick={() => setSelectedPostSlug(post.slug)}
                        className="relative w-full h-44 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group"
                      >
                        {/* Renderizado de la primera página del PDF */}
                        <div className="pointer-events-none scale-75 origin-top-left w-[133%] h-[133%] overflow-hidden">
                          <PdfViewerWrapper pdfUrl={post.pdfUrl} />
                        </div>
                        {/* Overlay al pasar el ratón */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="bg-black/75 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            📄 Ver documento PDF
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-44 bg-slate-200/60 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
                        Sin vista previa
                      </div>
                    )}

                    {/* Categorías / Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.categoryIds && post.categoryIds.length > 0 ? (
                        post.categoryIds.map((catId) => (
                          <span 
                            key={catId} 
                            className="bg-primary-custom/10 text-primary-custom text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          >
                            {categoriesMap[catId] || catId}
                          </span>
                        ))
                      ) : (
                        <span className="bg-slate-200 text-slate-600 text-[11px] font-medium px-2.5 py-1 rounded-full">
                          Sin categoría
                        </span>
                      )}
                    </div>

                    {/* Título del Post */}
                    <h3 className="font-bold text-slate-800 text-lg leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                  </div>

                  {/* Botón Abrir Popup */}
                  <div className="pt-5 mt-auto">
                    <button
                      onClick={() => setSelectedPostSlug(post.slug)}
                      className="w-full bg-black hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition text-center block"
                    >
                      Leer completo
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Flechas de navegación */}
            {filteredPosts.length > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={prevSlide}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition text-slate-700 font-bold"
                  aria-label="Anterior"
                >
                  ←
                </button>
                <span className="text-xs text-slate-500 font-medium">
                  {currentSlide + 1} / {filteredPosts.length}
                </span>
                <button 
                  onClick={nextSlide}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition text-slate-700 font-bold"
                  aria-label="Siguiente"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recursos previos */}
      <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-primary-custom">Tus recursos y materiales exclusivos</h2>
        
        {userData?.recursosPermitidos && userData.recursosPermitidos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {userData.recursosPermitidos.map((recursoId) => (
              <div key={recursoId} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                <span className="font-semibold text-slate-700">Material / Evento: {recursoId}</span>
                <span className="text-xs bg-primary-custom text-white px-3 py-1 rounded-full font-medium">Disponible</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-700">No tienes materiales asignados en este momento. Te notificaremos cuando se añada nuevo contenido.</p>
        )}
      </div>

      {/* Ventana Emergente / Modal Popup */}
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