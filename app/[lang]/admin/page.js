// app/admin/page.js
'use client';

import { useState, useEffect, useRef } from "react";
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import UserFormModal from "@/components/UserFormModal";
import ArticleFormModal from "@/components/ArticleFormModal";
import { Turnstile } from "@marsidev/react-turnstile"; // 1. Importar Turnstile

export default function AdminDashboardPage() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // Pestaña activa ('consultas' | 'usuarios' | 'articulos')
  const [activeTab, setActiveTab] = useState("consultas");

  // Formulario de login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Captcha para el login de admin
  const [adminCaptchaToken, setAdminCaptchaToken] = useState(null);
  const turnstileRef = useRef(null);

  // Mensajes globales de feedback
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // --- ESTADOS: CONSULTAS ---
  const [consultas, setConsultas] = useState([]);
  const [loadingConsultas, setLoadingConsultas] = useState(false);

  // --- ESTADOS: USUARIOS ---
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [activeUserModal, setActiveUserModal] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [confirmUserEmailInput, setConfirmUserEmailInput] = useState("");
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [canDeleteUsers, setCanDeleteUsers] = useState(false);

  // --- ESTADOS: ARTÍCULOS BLOG ---
  const [articles, setArticles] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [activeArticleModal, setActiveArticleModal] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [confirmArticleTitleInput, setConfirmArticleTitleInput] = useState("");
  const articleFormRef = useRef(null);

  // Scroll automático para edición de artículos
  useEffect(() => {
    if (activeArticleModal && articleFormRef.current) {
      articleFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeArticleModal]);

  // Escuchar sesión y verificar permisos
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        setCurrentUserEmail(currentUser.email);
        try {
          const userRef = doc(db, "usuarios_autorizados", currentUser.email.toLowerCase());
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            const roles = data.roles || [];
            const permisos = data.permisos || [];
            const isActivo = data.activo === true;

            const esAdminValido = isActivo && (
              roles.includes("administrador_global") || 
              roles.includes("administrador") || 
              permisos.includes("gestionar_solicitudes") ||
              data.esAdmin === true
            );

            if (esAdminValido) {
              setHasPermission(true);
              const esGlobal = roles.includes("administrador_global");
              setIsGlobalAdmin(esGlobal);
              setCanDeleteUsers(esGlobal || permisos.includes("borrar_usuarios"));

              fetchConsultas();
              fetchUsuarios();
              fetchArticlesAndCategories();
            } else {
              setHasPermission(false);
            }
          } else {
            setHasPermission(false);
          }
        } catch (err) {
          console.error("Error verificando permisos:", err);
          setHasPermission(false);
        }
      } else {
        setHasPermission(false);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Login protegido con Captcha
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!adminCaptchaToken) {
      setLoginError("Por favor, completa la verificación de seguridad (Captcha).");
      return;
    }

    try {
      // Validar el token del captcha en el servidor
      const captchaRes = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: adminCaptchaToken }),
      });

      const captchaData = await captchaRes.json();

      if (!captchaData.success) {
        throw new Error("CAPTCHA_FAILED");
      }

      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Error en login de admin:", err);
      if (err.message === "CAPTCHA_FAILED") {
        setLoginError("Fallo en la verificación anti-bot. Por favor, reintenta.");
      } else {
        setLoginError("Credenciales incorrectas o usuario no autorizado.");
      }
    } finally {
      // Resetear el captcha tras el intento
      setAdminCaptchaToken(null);
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    }
  };

  // --- MÉTODOS CONSULTAS ---
  const fetchConsultas = async () => {
    setLoadingConsultas(true);
    try {
      const q = query(collection(db, "consultas"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setConsultas(data);
    } catch (err) {
      console.error("Error al cargar consultas:", err);
    } finally {
      setLoadingConsultas(false);
    }
  };

  const aprobarSolicitud = async (id) => {
    try {
      const consultaRef = doc(db, "consultas", id);
      await updateDoc(consultaRef, { estado: "aprobada" });
      setConsultas(consultas.map(c => c.id === id ? { ...c, estado: "aprobada" } : c));
      setMensaje("¡Solicitud aprobada con éxito!");
    } catch (err) {
      console.error("Error al aprobar:", err);
      setError("Hubo un error al aprobar la solicitud.");
    }
  };

  // --- MÉTODOS USUARIOS ---
  const fetchUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios_autorizados"));
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUsuarios(data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const llamarApiActivarUsuario = async (targetEmail) => {
    try {
    // 1. Obtener el usuario activo en Firebase Auth
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No hay un usuario autenticado activo.");
    }

    // 2. Extraer el ID Token firmado de Firebase
    const token = await currentUser.getIdToken();

    // 3. Enviar la petición fetch con la cabecera Authorization: Bearer <token>
    const response = await fetch("/api/admin/activar-usuario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // 👈 Inyección del token Bearer
      },
      body: JSON.stringify({
        email: targetEmail,
      }),
    });
    
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al activar en el servidor");
    } catch (err) {
      console.error("Error al llamar a la API de activación:", err);
      throw err;
    }
  };

  const handleUserFormSubmit = async (formData, isEditing) => {
    setMensaje("");
    setError("");
    try {
      const userRef = doc(db, "usuarios_autorizados", formData.email);
      let estadoAnteriorActivo = false;

      if (isEditing) {
        const oldSnap = await getDoc(userRef);
        if (oldSnap.exists()) estadoAnteriorActivo = oldSnap.data().activo === true;

        await updateDoc(userRef, {
          nombre: formData.nombre,
          telefono: formData.telefono,
          origenEncuentro: formData.origenEncuentro,
          activo: formData.activo,
          aceptaPolitica: formData.aceptaPolitica,
          roles: formData.roles,
          permisos: formData.permisos,
          recursosPermitidos: formData.recursosPermitidos,
          updatedAt: serverTimestamp(),
        });

        if (!estadoAnteriorActivo && formData.activo) {
          await llamarApiActivarUsuario(formData.email);
        }
        setMensaje(`¡Usuario ${formData.email} actualizado con éxito!`);
      } else {
        await setDoc(userRef, {
          email: formData.email,
          nombre: formData.nombre,
          telefono: formData.telefono,
          origenEncuentro: formData.origenEncuentro,
          activo: formData.activo,
          aceptaPolitica: formData.aceptaPolitica,
          roles: formData.roles,
          permisos: formData.permisos,
          recursosPermitidos: formData.recursosPermitidos,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        if (formData.activo) {
          await llamarApiActivarUsuario(formData.email);
        }
        setMensaje(`¡Usuario ${formData.email} creado con éxito!`);
      }

      setActiveUserModal(null);
      fetchUsuarios();
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      setError("Hubo un error al guardar los datos del usuario.");
    }
  };

  const handleDeleteUserConfirm = async (e) => {
    e.preventDefault();
    if (!userToDelete) return;

    if (confirmUserEmailInput.trim().toLowerCase() !== userToDelete.id.toLowerCase()) {
      setError("El correo introducido no coincide. Operación cancelada.");
      setUserToDelete(null);
      setConfirmUserEmailInput("");
      return;
    }

    try {
      await deleteDoc(doc(db, "usuarios_autorizados", userToDelete.id));
      await deleteDoc(doc(db, "usuarios_areaprivada", userToDelete.id));
      setMensaje(`Usuario ${userToDelete.id} eliminado correctamente.`);
      setUserToDelete(null);
      setConfirmUserEmailInput("");
      fetchUsuarios();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setError("Hubo un error al eliminar el usuario de Firebase.");
      setUserToDelete(null);
      setConfirmUserEmailInput("");
    }
  };

  // --- MÉTODOS ARTÍCULOS ---
  const fetchArticlesAndCategories = async () => {
    setLoadingArticles(true);
    try {
      const catSnap = await getDocs(collection(db, "categories"));
      const catMap = {};
      catSnap.docs.forEach((d) => {
        catMap[d.id] = d.data().name || d.id;
      });
      setCategoriesMap(catMap);

      const querySnapshot = await getDocs(collection(db, "posts"));
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setArticles(data);
    } catch (err) {
      console.error("Error al cargar artículos:", err);
    } finally {
      setLoadingArticles(false);
    }
  };

  const handleArticleFormSubmit = async (formData, isEditing) => {
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

      setActiveArticleModal(null);
      fetchArticlesAndCategories();
    } catch (err) {
      console.error("Error al guardar artículo:", err);
      setError("Hubo un error al guardar los datos del artículo.");
    }
  };

  const handleDeleteArticleConfirm = async (e) => {
    e.preventDefault();
    if (!articleToDelete) return;

    if (confirmArticleTitleInput.trim() !== articleToDelete.title.trim()) {
      setError("El título introducido no coincide. Operación cancelada.");
      setArticleToDelete(null);
      setConfirmArticleTitleInput("");
      return;
    }

    try {
      await deleteDoc(doc(db, "posts", articleToDelete.id));
      setMensaje(`Artículo "${articleToDelete.title}" eliminado correctamente.`);
      setArticleToDelete(null);
      setConfirmArticleTitleInput("");
      fetchArticlesAndCategories();
    } catch (err) {
      console.error("Error al eliminar artículo:", err);
      setError("Hubo un error al eliminar el artículo.");
      setArticleToDelete(null);
      setConfirmArticleTitleInput("");
    }
  };

  if (checkingAuth) {
    return <div className="text-center py-24 text-slate-500">Verificando sesión y permisos...</div>;
  }

  // Pantalla de Login si no hay permisos o sesión
  if (!user || !hasPermission) {
    return (
      <div className="max-w-md mx-auto my-24 bg-white p-8 rounded-2xl shadow-md border border-slate-100">
        <h2 className="text-2xl font-bold text-primary-custom mb-2 text-center">Panel de Administración</h2>
        <p className="text-xs text-slate-400 text-center mb-6">Acceso restringido a personal autorizado</p>

        {user && !hasPermission && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">
            Tu cuenta no dispone de permisos suficientes de administración.
          </div>
        )}

        {loginError && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">{loginError}</div>}

        <form onSubmit={handleLogin} className="space-y-4 text-slate-600">
          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full border rounded-lg p-3 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full border rounded-lg p-3 bg-white"
            />
          </div>

          {/* Widget del Captcha en el Login de Admin */}
          <div className="flex justify-center py-2">
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setAdminCaptchaToken(token)}
              onExpire={() => setAdminCaptchaToken(null)}
              onError={() => setAdminCaptchaToken(null)}
            />
          </div>

          <button 
            type="submit" 
            disabled={!adminCaptchaToken}
            className="w-full py-3 bg-primary-custom hover:bg-[#266360] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition"
          >
            Iniciar sesión
          </button>
        </form>

        {user && (
          <div className="mt-4 text-center">
            <button onClick={() => signOut(auth)} className="text-xs text-slate-500 hover:underline">
              Cerrar sesión con cuenta actual
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Header General */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-custom">Panel de Administración</h1>
          <p className="text-xs text-slate-500 mt-1">Sesión activa: {currentUserEmail}</p>
        </div>
        <button 
          onClick={() => signOut(auth)} 
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-3">
        <button
          onClick={() => { setActiveTab("consultas"); setMensaje(""); setError(""); }}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === "consultas"
              ? "bg-primary-custom text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          📩 Solicitudes ({consultas.length})
        </button>

        <button
          onClick={() => { setActiveTab("usuarios"); setMensaje(""); setError(""); }}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === "usuarios"
              ? "bg-primary-custom text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          👥 Gestión de Usuarios ({usuarios.length})
        </button>

        <button
          onClick={() => { setActiveTab("articulos"); setMensaje(""); setError(""); }}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === "articulos"
              ? "bg-primary-custom text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          📝 Artículos de Blog ({articles.length})
        </button>
      </div>

      {/* Alertas globales */}
      {mensaje && <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl text-sm">{mensaje}</div>}
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

      {/* ==================== PESTAÑA 1: CONSULTAS ==================== */}
      {activeTab === "consultas" && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Solicitudes de Consulta Recibidas</h2>
            <button onClick={fetchConsultas} className="text-xs text-primary-custom hover:underline font-semibold">
              🔄 Actualizar lista
            </button>
          </div>

          {loadingConsultas ? (
            <p className="text-center py-12 text-slate-500">Cargando solicitudes...</p>
          ) : consultas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-100 shadow-sm">
              No hay solicitudes registradas todavía.
            </div>
          ) : (
            <div>
              {/* VISTA TARJETAS (Móvil: < md) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {consultas.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3 text-sm">
                    <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-base">
                          {item.nombre} {item.apellidos}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : "Reciente"}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                        item.estado === "aprobada" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {item.estado || "pendiente"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="block font-bold text-slate-400 uppercase text-[10px]">Email</span>
                        <span className="truncate block">{item.email}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-400 uppercase text-[10px]">Teléfono</span>
                        <span>{item.telefono || "-"}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Motivo</span>
                      <span className="inline-block px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                        {item.motivo}
                      </span>
                    </div>

                    {item.mensaje && (
                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-100">
                        "{item.mensaje}"
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100">
                      {item.estado !== "aprobada" ? (
                        <button
                          onClick={() => aprobarSolicitud(item.id)}
                          className="w-full py-2.5 bg-green-700 hover:bg-[#266360] text-white text-xs font-bold rounded-xl transition"
                        >
                          Aprobar solicitud
                        </button>
                      ) : (
                        <span className="block text-center text-xs text-slate-400 font-medium py-1">Solicitud Aprobada</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* VISTA TABLA (Escritorio: >= md) */}
              <div className="hidden md:block bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-sm uppercase">
                        <th className="p-4">Fecha</th>
                        <th className="p-4">Paciente</th>
                        <th className="p-4">Contacto</th>
                        <th className="p-4">Motivo</th>
                        <th className="p-4">Mensaje</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {consultas.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 text-slate-500 whitespace-nowrap">
                            {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : "Reciente"}
                          </td>
                          <td className="p-4 font-semibold">
                            {item.nombre} {item.apellidos}
                          </td>
                          <td className="p-4">
                            <div>{item.email}</div>
                            <div className="text-xs text-slate-500">{item.telefono}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                              {item.motivo}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 max-w-xs truncate" title={item.mensaje}>
                            {item.mensaje}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              item.estado === "aprobada" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {item.estado || "pendiente"}
                            </span>
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            {item.estado !== "aprobada" ? (
                              <button
                                onClick={() => aprobarSolicitud(item.id)}
                                className="px-4 py-2 bg-green-700 hover:bg-[#266360] text-white text-xs font-bold rounded-lg transition"
                              >
                                Aprobar solicitud
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Aprobada</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================== PESTAÑA 2: USUARIOS ==================== */}
      {activeTab === "usuarios" && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h2>
            <button
              onClick={() => setActiveUserModal("create")}
              className="px-4 py-2 bg-primary-custom hover:bg-[#266360] text-white text-xs font-bold rounded-xl transition"
            >
              + Dar de alta nuevo usuario
            </button>
          </div>

          {activeUserModal === "create" && (
            <UserFormModal 
              isGlobalAdmin={isGlobalAdmin} 
              onClose={() => setActiveUserModal(null)} 
              onSubmit={handleUserFormSubmit} 
            />
          )}

          {activeUserModal && activeUserModal !== "create" && (
            <UserFormModal 
              userToEdit={activeUserModal} 
              isGlobalAdmin={isGlobalAdmin} 
              onClose={() => setActiveUserModal(null)} 
              onSubmit={handleUserFormSubmit} 
            />
          )}

          {userToDelete && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-lg border border-slate-200 space-y-4">
                <h3 className="text-xl font-bold text-red-600">¿Estás seguro de eliminar este usuario?</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Para confirmar, escribe el correo exacto: <strong className="text-slate-900">{userToDelete.id}</strong>
                </p>

                <form onSubmit={handleDeleteUserConfirm} className="space-y-4">
                  <input 
                    type="email" 
                    value={confirmUserEmailInput} 
                    onChange={(e) => setConfirmUserEmailInput(e.target.value)}
                    placeholder="Introduce el correo para confirmar"
                    required
                    className="w-full border rounded-lg p-3 text-slate-700 bg-white text-sm"
                  />
                  <div className="flex gap-3 justify-end pt-2">
                    <button 
                      type="button" 
                      onClick={() => { setUserToDelete(null); setConfirmUserEmailInput(""); }}
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

          {loadingUsuarios ? (
            <p className="text-center py-12 text-slate-500">Cargando usuarios...</p>
          ) : usuarios.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-100 shadow-sm">
              No hay usuarios registrados.
            </div>
          ) : (
            <div>
              {/* VISTA TARJETAS (Móvil: < md) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {usuarios.map((u) => (
                  <div key={u.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-sm">
                    <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-3">
                      <div className="space-y-0.5">
                        <h3 className="font-extrabold text-slate-800 text-base leading-snug">
                          {u.nombre || "Sin nombre registrado"}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono break-all">{u.id}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                        u.activo !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {u.activo !== false ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                      <div>
                        <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Teléfono</span>
                        <span>{u.telefono || "-"}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Origen</span>
                        <span className="truncate block">{u.origenEncuentro || "-"}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Privacidad</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.aceptaPolitica ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {u.aceptaPolitica ? "Aceptada" : "Pendiente"}
                        </span>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Última mod.</span>
                        <span>
                          {u.updatedAt?.toDate 
                            ? u.updatedAt.toDate().toLocaleDateString() 
                            : (u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : "Reciente")}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="block font-bold text-slate-400 uppercase text-[10px] mb-1">Roles Asignados</span>
                      <div className="flex flex-wrap gap-1">
                        {u.roles && u.roles.length > 0 ? (
                          u.roles.map((r) => (
                            <span key={r} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium border border-slate-200">
                              {r}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs italic">Sin roles</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2 border-t border-slate-100">
                      <button
                        onClick={() => setActiveUserModal(u)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition text-center"
                      >
                        ✏️ Modificar
                      </button>
                      
                        <button
                          onClick={() => { setUserToDelete(u); setConfirmUserEmailInput(""); }}
                          className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2.5 px-4 rounded-xl transition text-center"
                        >
                          🗑️ Eliminar
                        </button>
                      
                    </div>
                  </div>
                ))}
              </div>

              {/* VISTA TABLA (Escritorio: >= md) */}
              <div className="hidden md:block bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-sm uppercase">
                        <th className="p-4">Email / ID</th>
                        <th className="p-4">Nombre</th>
                        <th className="p-4">Teléfono</th>
                        <th className="p-4">Origen</th>
                        <th className="p-4 text-center">Privacidad</th>
                        <th className="p-4">Modificación</th>
                        <th className="p-4 text-center">Estado</th>
                        <th className="p-4">Roles</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {usuarios.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-semibold">{u.id}</td>
                          <td className="p-4">{u.nombre || "-"}</td>
                          <td className="p-4">{u.telefono || "-"}</td>
                          <td className="p-4 text-xs">{u.origenEncuentro || "-"}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.aceptaPolitica ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}>
                              {u.aceptaPolitica ? "Aceptada" : "Pendiente"}
                            </span>
                          </td>
                          <td className="p-4 text-xs">
                            {u.updatedAt?.toDate 
                              ? u.updatedAt.toDate().toLocaleString() 
                              : (u.createdAt?.toDate ? u.createdAt.toDate().toLocaleString() : "Reciente")}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.activo !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {u.activo !== false ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {u.roles && u.roles.length > 0 ? (
                                u.roles.map((r) => (
                                  <span key={r} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                                    {r}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 text-xs">Sin roles</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => setActiveUserModal(u)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                            >
                              Modificar
                            </button>
                            
                              <button
                                onClick={() => { setUserToDelete(u); setConfirmUserEmailInput(""); }}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition"
                              >
                                Eliminar
                              </button>
                            
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================== PESTAÑA 3: ARTÍCULOS BLOG ==================== */}
      {activeTab === "articulos" && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Gestión de Artículos del Blog Exclusivo</h2>
            <button
              onClick={() => setActiveArticleModal("create")}
              className="px-4 py-2 bg-primary-custom hover:bg-[#266360] text-white text-xs font-bold rounded-xl transition"
            >
              + Crear nuevo artículo
            </button>
          </div>

          {activeArticleModal && (
            <div ref={articleFormRef} className="scroll-mt-6">
              <ArticleFormModal
                articleToEdit={activeArticleModal !== "create" ? activeArticleModal : null}
                onClose={() => setActiveArticleModal(null)}
                onSubmit={handleArticleFormSubmit}
              />
            </div>
          )}

          {articleToDelete && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-lg border border-slate-200 space-y-4">
                <h3 className="text-xl font-bold text-red-600">¿Estás seguro de eliminar este artículo?</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Esta acción es irreversible. Escribe el título exacto: <strong className="text-slate-900">{articleToDelete.title}</strong>
                </p>

                <form onSubmit={handleDeleteArticleConfirm} className="space-y-4">
                  <input
                    type="text"
                    value={confirmArticleTitleInput}
                    onChange={(e) => setConfirmArticleTitleInput(e.target.value)}
                    placeholder="Escribe el título para confirmar"
                    required
                    className="w-full border rounded-lg p-3 text-slate-700 bg-white text-sm"
                  />
                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => { setArticleToDelete(null); setConfirmArticleTitleInput(""); }}
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

          {loadingArticles ? (
            <p className="text-center py-12 text-slate-500">Cargando artículos...</p>
          ) : articles.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-100 shadow-sm">
              No hay artículos publicados.
            </div>
          ) : (
            <div>
              {/* VISTA TARJETAS (Móvil: < md) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {articles.map((art) => (
                  <div key={art.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-sm">
                    <div className="flex gap-3 items-start border-b border-slate-100 pb-3">
                      {art.coverImageUrl ? (
                        <img src={art.coverImageUrl} alt={art.title} className="w-14 h-14 object-cover rounded-xl border shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-[10px] shrink-0 font-medium">
                          Sin foto
                        </div>
                      )}

                      <div className="space-y-0.5 overflow-hidden">
                        <h3 className="font-extrabold text-slate-800 text-base leading-snug line-clamp-2">
                          {art.title}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">/blog/{art.slug}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                      <div>
                        <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Categorías</span>
                        <div className="flex flex-wrap gap-1">
                          {art.categoryIds && art.categoryIds.length > 0 ? (
                            art.categoryIds.map((cId) => (
                              <span key={cId} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200">
                                {categoriesMap[cId] || cId}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs italic">Sin categoría</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Archivo PDF</span>
                        {art.pdfUrl ? (
                          <a href={art.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-custom font-bold hover:underline inline-block pt-0.5">
                            📄 Ver PDF
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No adjunto</span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 border-t border-slate-50 pt-2">
                      <span className="font-bold text-slate-400 uppercase text-[10px]">Última modificación: </span>
                      {art.updatedAt?.toDate 
                        ? art.updatedAt.toDate().toLocaleDateString() 
                        : (art.createdAt?.toDate ? art.createdAt.toDate().toLocaleDateString() : "Reciente")}
                    </div>

                    <div className="pt-1 flex gap-2 border-t border-slate-100">
                      <button
                        onClick={() => setActiveArticleModal(art)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition text-center"
                      >
                        ✏️ Modificar
                      </button>
                      <button
                        onClick={() => { setArticleToDelete(art); setConfirmArticleTitleInput(""); }}
                        className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2.5 px-4 rounded-xl transition text-center"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* VISTA TABLA (Escritorio: >= md) */}
              <div className="hidden md:block bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-sm uppercase">
                        <th className="p-4">Portada</th>
                        <th className="p-4">Título / Slug</th>
                        <th className="p-4">Categorías</th>
                        <th className="p-4 text-center">PDF</th>
                        <th className="p-4">Modificación</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {articles.map((art) => (
                        <tr key={art.id} className="hover:bg-slate-50 transition">
                          <td className="p-4">
                            {art.coverImageUrl ? (
                              <img src={art.coverImageUrl} alt={art.title} className="w-12 h-12 object-cover rounded-lg border" />
                            ) : (
                              <span className="text-xs text-slate-400">Sin foto</span>
                            )}
                          </td>
                          <td className="p-4 font-semibold text-slate-800 max-w-xs">
                            <div className="truncate">{art.title}</div>
                            <div className="text-xs text-slate-500 font-normal truncate">/blog/{art.slug}</div>
                          </td>
                          <td className="p-4">
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
                          <td className="p-4 text-xs">
                            {art.updatedAt?.toDate 
                              ? art.updatedAt.toDate().toLocaleString() 
                              : (art.createdAt?.toDate ? art.createdAt.toDate().toLocaleString() : "Reciente")}
                          </td>
                          <td className="p-4 text-center space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => setActiveArticleModal(art)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                            >
                              Modificar
                            </button>
                            <button
                              onClick={() => { setArticleToDelete(art); setConfirmArticleTitleInput(""); }}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}