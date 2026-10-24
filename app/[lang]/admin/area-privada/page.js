// app/admin/blog/page.js
'use client';

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, getDoc, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import ArticleFormModal from "@/components/ArticleFormModal";

export default function GestionArticulosAdmin() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  const [articles, setArticles] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [activeModal, setActiveModal] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [confirmTitleInput, setConfirmTitleInput] = useState("");
  
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        try {
          const userRef = doc(db, "usuarios_autorizados", currentUser.email.toLowerCase());
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            const roles = data.roles || [];
            const isActivo = data.activo === true;

            const esAdminValido = isActivo && (roles.includes("administrador_global") || roles.includes("administrador"));

            if (esAdminValido) {
              setHasAccess(true);
              fetchArticlesAndCategories();
            } else {
              setHasAccess(false);
            }
          } else {
            setHasAccess(false);
          }
        } catch (err) {
          console.error("Error verificando permisos:", err);
          setHasAccess(false);
        }
      } else {
        setHasAccess(false);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchArticlesAndCategories = async () => {
    setLoading(true);
    try {
      // 1. Cargar Mapa de Categorías
      const catSnap = await getDocs(collection(db, "categories"));
      const catMap = {};
      catSnap.docs.forEach((d) => {
        catMap[d.id] = d.data().name || d.id;
      });
      setCategoriesMap(catMap);

      // 2. Cargar Artículos
      const querySnapshot = await getDocs(collection(db, "posts"));
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setArticles(data);
    } catch (err) {
      console.error("Error al cargar artículos:", err);
      setError("No se pudieron cargar los artículos del blog.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData, isEditing) => {
    setMensaje("");
    setError("");

    try {
      if (isEditing) {
        const articleRef = doc(db, "posts", formData.id);
        await updateDoc(articleRef, {
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          categoryIds: formData.categoryIds,
          coverImageUrl: formData.coverImageUrl,
          pdfUrl: formData.pdfUrl,
          updatedAt: serverTimestamp(),
        });
        setMensaje(`Artículo "${formData.title}" actualizado con éxito.`);
      } else {
        await addDoc(collection(db, "posts"), {
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          categoryIds: formData.categoryIds,
          coverImageUrl: formData.coverImageUrl,
          pdfUrl: formData.pdfUrl,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setMensaje(`Artículo "${formData.title}" creado con éxito.`);
      }

      setActiveModal(null);
      fetchArticlesAndCategories();
    } catch (err) {
      console.error("Error al guardar artículo:", err);
      setError("Hubo un error al guardar los datos del artículo.");
    }
  };

  const handleDeleteArticleConfirm = async (e) => {
    e.preventDefault();
    if (!articleToDelete) return;

    if (confirmTitleInput.trim() !== articleToDelete.title.trim()) {
      setError("El título introducido no coincide. Operación cancelada.");
      setArticleToDelete(null);
      setConfirmTitleInput("");
      return;
    }

    try {
      await deleteDoc(doc(db, "posts", articleToDelete.id));
      setMensaje(`Artículo "${articleToDelete.title}" eliminado correctamente.`);
      setArticleToDelete(null);
      setConfirmTitleInput("");
      fetchArticlesAndCategories();
    } catch (err) {
      console.error("Error al eliminar artículo:", err);
      setError("Hubo un error al eliminar el artículo de Firestore.");
      setArticleToDelete(null);
      setConfirmTitleInput("");
    }
  };

  if (checkingAuth) {
    return <div className="text-center py-24 text-slate-700">Verificando permisos de acceso...</div>;
  }

  if (!hasAccess) {
    return (
      <div className="max-w-md mx-auto my-24 bg-white p-8 rounded-2xl shadow-md border border-slate-100 text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary-custom">Acceso Restringido</h2>
        <p className="text-slate-700 text-sm">No tienes permisos de administrador activo para ver esta sección.</p>
        <button onClick={() => signOut(auth)} className="px-6 py-2.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-primary-custom">Gestión de Artículos del Blog</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveModal("create")}
            className="px-4 py-2 bg-primary-custom hover:bg-[#266360] text-white text-sm font-bold rounded-xl transition"
          >
            + Crear nuevo artículo
          </button>
          <button onClick={() => signOut(auth)} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition">
            Cerrar sesión
          </button>
        </div>
      </div>

      {mensaje && <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl text-sm">{mensaje}</div>}
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

      {/* Modal Crear */}
      {activeModal === "create" && (
        <ArticleFormModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Modal Editar */}
      {activeModal && activeModal !== "create" && (
        <ArticleFormModal
          articleToEdit={activeModal}
          onClose={() => setActiveModal(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Modal Confirmación de Eliminación */}
      {articleToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-lg border border-slate-200 space-y-4">
            <h3 className="text-xl font-bold text-red-600">¿Estás seguro de eliminar este artículo?</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              Esta acción es irreversible. Para confirmar, escribe el título exacto de la entrada: <strong className="text-slate-900">{articleToDelete.title}</strong>
            </p>

            <form onSubmit={handleDeleteArticleConfirm} className="space-y-4">
              <input
                type="text"
                value={confirmTitleInput}
                onChange={(e) => setConfirmTitleInput(e.target.value)}
                placeholder="Escribe el título para confirmar"
                required
                className="w-full border rounded-lg p-3 text-slate-700 bg-white text-sm"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setArticleToDelete(null); setConfirmTitleInput(""); }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Sí, eliminar definitivamente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center py-12 text-slate-700">Cargando artículos...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-sm uppercase">
                  <th className="p-4">Portada</th>
                  <th className="p-4">Título / Slug</th>
                  <th className="p-4">Categorías</th>
                  <th className="p-4 text-center">PDF</th>
                  <th className="p-4">Última modificación</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-700">No hay artículos publicados.</td>
                  </tr>
                ) : (
                  articles.map((art) => (
                    <tr key={art.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        {art.coverImageUrl ? (
                          <img src={art.coverImageUrl} alt={art.title} className="w-12 h-12 object-cover rounded-lg" />
                        ) : (
                          <span className="text-xs text-slate-400">Sin foto</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-slate-800 max-w-xs">
                        <div className="truncate">{art.title}</div>
                        <div className="text-xs text-slate-500 font-normal truncate">/blog/{art.slug}</div>
                      </td>
                      <td className="p-4 text-slate-700">
                        <div className="flex flex-wrap gap-1">
                          {art.categoryIds && art.categoryIds.length > 0 ? (
                            art.categoryIds.map((cId) => (
                              <span key={cId} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                                {categoriesMap[cId] || cId}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">Sin categoría</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {art.pdfUrl ? (
                          <a href={art.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-custom font-bold hover:underline">
                            Ver PDF
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-700 text-xs">
                        {art.updatedAt?.toDate 
                          ? art.updatedAt.toDate().toLocaleString() 
                          : (art.createdAt?.toDate ? art.createdAt.toDate().toLocaleString() : "Reciente")}
                      </td>
                      <td className="p-4 text-center space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setActiveModal(art)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                        >
                          Modificar
                        </button>
                        <button
                          onClick={() => { setArticleToDelete(art); setConfirmTitleInput(""); }}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}