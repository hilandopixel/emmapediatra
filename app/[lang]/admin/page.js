// app/admin/page.js
'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
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
import ConsultaDetailForm from "@/components/ConsultaDetailForm";
import { Turnstile } from "@marsidev/react-turnstile";

export default function AdminDashboardPage() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // Pestaña activa ('consultas' | 'usuarios' | 'articulos' | 'historial')
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

  // --- ESTADOS: BÚSQUEDA Y ORDENACIÓN ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // --- ESTADOS: FILTROS ESPECÍFICOS ---
  const [filterEstadoConsulta, setFilterEstadoConsulta] = useState("all");
  const [filterEstadoUsuario, setFilterEstadoUsuario] = useState("all");
  const [filterRolUsuario, setFilterRolUsuario] = useState("all");
  const [filterCategoriaRecurso, setFilterCategoriaRecurso] = useState("all");
  
  // --- ESTADO COLLAPSE EN HISTORIAL ---
  const [expandedEmails, setExpandedEmails] = useState({});

  const toggleExpandEmail = (userEmail) => {
    setExpandedEmails(prev => ({
      ...prev,
      [userEmail]: !prev[userEmail]
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    
    if (tab === "usuarios") {
      setSortConfig({ key: 'updatedAt', direction: 'desc' });
    } else if (tab === "consultas") {
      setSortConfig({ key: 'createdAt', direction: 'desc' });
    } else if (tab === "historial") {
      setSortConfig({ key: 'ultimoAcceso', direction: 'desc' });
    } else {
      setSortConfig({ key: 'updatedAt', direction: 'desc' });
    }

    setFilterEstadoConsulta("all");
    setFilterEstadoUsuario("all");
    setFilterRolUsuario("all");
    setFilterCategoriaRecurso("all");
    setMensaje("");
    setError("");
  };

  // --- ESTADOS Y REFERENCIA: CONSULTAS ---
  const [consultas, setConsultas] = useState([]);
  const [loadingConsultas, setLoadingConsultas] = useState(false);
  const [selectedConsultaModal, setSelectedConsultaModal] = useState(null);

  // --- ESTADOS Y REFERENCIA: USUARIOS ---
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [activeUserModal, setActiveUserModal] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [confirmUserEmailInput, setConfirmUserEmailInput] = useState("");
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [canDeleteUsers, setCanDeleteUsers] = useState(false);
  const userFormRef = useRef(null);

  // --- ESTADOS Y REFERENCIA: RECURSOS BLOG ---
  const [articles, setArticles] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [activeArticleModal, setActiveArticleModal] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [confirmArticleTitleInput, setConfirmArticleTitleInput] = useState("");
  const articleFormRef = useRef(null);

  // --- ESTADOS Y REFERENCIA: HISTORIAL ACCESOS ---
  const [historialAgrupado, setHistorialAgrupado] = useState([]);
  const [mapaUltimoAcceso, setMapaUltimoAcceso] = useState({});
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  useEffect(() => {
    if (activeUserModal && userFormRef.current) {
      userFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeUserModal]);

  useEffect(() => {
    if (activeArticleModal && articleFormRef.current) {
      articleFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeArticleModal]);

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
              fetchHistorialAccesos();
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToCSV = (data, filename, headers) => {
    if (!data || !data.length) return;

    const csvRows = [];
    csvRows.push(headers.map(h => `"${h.label}"`).join(","));

    for (const row of data) {
      const values = headers.map(h => {
        let val = h.accessor(row);
        if (val === null || val === undefined) val = "";
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvString = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FILTRADO DE DATOS CON USEMEMO ---
  const processedConsultas = useMemo(() => {
    let result = [...consultas];

    if (filterEstadoConsulta !== "all") {
      result = result.filter(c => (c.estado || "pendiente") === filterEstadoConsulta);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.nombre?.toLowerCase().includes(term) ||
        item.apellidos?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.telefono?.toLowerCase().includes(term) ||
        item.motivo?.toLowerCase().includes(term) ||
        item.mensaje?.toLowerCase().includes(term)
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";
        if (sortConfig.key === 'createdAt') {
          aVal = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          bVal = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [consultas, searchTerm, filterEstadoConsulta, sortConfig]);

  const processedUsuarios = useMemo(() => {
    let result = [...usuarios];

    if (filterEstadoUsuario !== "all") {
      const esActivoDeseado = filterEstadoUsuario === "activo";
      result = result.filter(u => (u.activo !== false) === esActivoDeseado);
    }

    if (filterRolUsuario !== "all") {
      result = result.filter(u => u.roles && u.roles.includes(filterRolUsuario));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u => 
        u.id?.toLowerCase().includes(term) ||
        u.nombre?.toLowerCase().includes(term) ||
        u.telefono?.toLowerCase().includes(term) ||
        u.observaciones?.toLowerCase().includes(term) ||
        u.origenEncuentro?.toLowerCase().includes(term)
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";
        if (sortConfig.key === 'updatedAt') {
          aVal = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
          bVal = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [usuarios, searchTerm, filterEstadoUsuario, filterRolUsuario, sortConfig]);

  const processedArticles = useMemo(() => {
    let result = [...articles];

    if (filterCategoriaRecurso !== "all") {
      result = result.filter(art => art.categoryIds && art.categoryIds.includes(filterCategoriaRecurso));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(art => 
        art.title?.toLowerCase().includes(term) ||
        art.slug?.toLowerCase().includes(term)
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";
        if (sortConfig.key === 'updatedAt') {
          aVal = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
          bVal = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [articles, searchTerm, filterCategoriaRecurso, sortConfig]);

  const processedHistorial = useMemo(() => {
    let result = [...historialAgrupado];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => item.email?.toLowerCase().includes(term));
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";
        if (sortConfig.key === 'ultimoAcceso') {
          aVal = a.ultimoAccesoDate ? a.ultimoAccesoDate.getTime() : 0;
          bVal = b.ultimoAccesoDate ? b.ultimoAccesoDate.getTime() : 0;
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [historialAgrupado, searchTerm, sortConfig]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!adminCaptchaToken) {
      setLoginError("Por favor, completa la verificación de seguridad (Captcha).");
      return;
    }

    try {
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

  const completarSolicitud = async (id) => {
    try {
      const consultaRef = doc(db, "consultas", id);
      await updateDoc(consultaRef, { estado: "completada" });
      setConsultas(consultas.map(c => c.id === id ? { ...c, estado: "completada" } : c));
      setMensaje("¡Solicitud completada con éxito!");
    } catch (err) {
      console.error("Error al completar:", err);
      setError("Hubo un error al completar la solicitud.");
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
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No hay un usuario autenticado activo.");

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/admin/activar-usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email: targetEmail }),
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
          observaciones: formData.observaciones || "",
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
          observaciones: formData.observaciones || "",
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

  // --- MÉTODOS RECURSOS ---
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
      console.error("Error al cargar recursos:", err);
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
        setMensaje(`Recurso "${formData.title}" actualizado con éxito.`);
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
        setMensaje(`Recurso "${formData.title}" creado con éxito.`);
      }

      setActiveArticleModal(null);
      fetchArticlesAndCategories();
    } catch (err) {
      console.error("Error al guardar recurso:", err);
      setError("Hubo un error al guardar los datos del recurso.");
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
      setMensaje(`Recurso "${articleToDelete.title}" eliminado correctamente.`);
      setArticleToDelete(null);
      setConfirmArticleTitleInput("");
      fetchArticlesAndCategories();
    } catch (err) {
      console.error("Error al eliminar recurso:", err);
      setError("Hubo un error al eliminar el recurso.");
      setArticleToDelete(null);
      setConfirmArticleTitleInput("");
    }
  };

  // --- MÉTODOS HISTORIAL ACCESOS (AGRUPADO POR EMAIL) ---
  const fetchHistorialAccesos = async () => {
    setLoadingHistorial(true);
    try {
      const querySnapshot = await getDocs(collection(db, "historial_accesos"));
      const mapa = {};
      const listaAgrupada = [];

      querySnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const userEmail = docSnap.id.toLowerCase();
        const fechaUltimo = data.ultimoAcceso?.toDate ? data.ultimoAcceso.toDate() : null;

        mapa[userEmail] = fechaUltimo;

        let accesosLista = Array.isArray(data.accesos) ? [...data.accesos] : [];
        
        // Ordenar accesos individualmente de más reciente a más antiguo
        accesosLista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        listaAgrupada.push({
          email: docSnap.id,
          totalAccesos: data.totalAccesos || accesosLista.length,
          ultimoAccesoDate: fechaUltimo,
          accesos: accesosLista
        });
      });

      // Ordenar usuarios por su acceso más reciente por defecto
      listaAgrupada.sort((a, b) => {
        const timeA = a.ultimoAccesoDate ? a.ultimoAccesoDate.getTime() : 0;
        const timeB = b.ultimoAccesoDate ? b.ultimoAccesoDate.getTime() : 0;
        return timeB - timeA;
      });

      setMapaUltimoAcceso(mapa);
      setHistorialAgrupado(listaAgrupada);
    } catch (err) {
      console.error("Error al cargar historial de accesos:", err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  if (checkingAuth) {
    return <div className="text-center py-24 text-slate-500">Verificando sesión y permisos...</div>;
  }

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
      {/* Modal de Detalle de Consulta */}
      {selectedConsultaModal && (
        <ConsultaDetailForm
          consulta={selectedConsultaModal}
          onClose={() => setSelectedConsultaModal(null)}
          onCompletar={completarSolicitud}
        />
      )}

      {/* Header General */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-custom">Panel de Administración</h1>
          <p className="text-xs text-primary-custom mt-1">Sesión activa: {currentUserEmail}</p>
        </div>
        <button 
          onClick={() => signOut(auth)} 
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => handleTabChange("consultas")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === "consultas"
              ? "bg-primary-custom text-white shadow-sm"
              : "bg-slate-100 text-primary-custom hover:bg-slate-200"
          }`}
        >
          📩 Solicitudes ({consultas.length})
        </button>

        <button
          onClick={() => handleTabChange("usuarios")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === "usuarios"
              ? "bg-primary-custom text-white shadow-sm"
              : "bg-slate-100 text-primary-custom hover:bg-slate-200"
          }`}
        >
          👥 Usuarios ({usuarios.length})
        </button>

        <button
          onClick={() => handleTabChange("articulos")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === "articulos"
              ? "bg-primary-custom text-white shadow-sm"
              : "bg-slate-100 text-primary-custom hover:bg-slate-200"
          }`}
        >
          📝 Recursos ({articles.length})
        </button>

        <button
          onClick={() => handleTabChange("historial")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === "historial"
              ? "bg-primary-custom text-white shadow-sm"
              : "bg-slate-100 text-primary-custom hover:bg-slate-200"
          }`}
        >
          📋 Histórico Accesos ({historialAgrupado.length})
        </button>
      </div>

      {/* BARRA DE FILTROS Y EXPORTACIÓN */}
      <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Campo de Búsqueda General */}
          <div className="w-full sm:max-w-xs relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === "historial" ? "Buscar por email..." : `Buscar en ${activeTab}...`}
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:border-primary-custom"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
          </div>

          {/* Filtros Específicos por Pestaña */}
          {activeTab === "consultas" && (
            <select
              value={filterEstadoConsulta}
              onChange={(e) => setFilterEstadoConsulta(e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-primary-custom"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="completada">Completadas</option>
            </select>
          )}

          {activeTab === "usuarios" && (
            <>
              <select
                value={filterEstadoUsuario}
                onChange={(e) => setFilterEstadoUsuario(e.target.value)}
                className="border rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-primary-custom"
              >
                <option value="all">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>

              <select
                value={filterRolUsuario}
                onChange={(e) => setFilterRolUsuario(e.target.value)}
                className="border rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-primary-custom"
              >
                <option value="all">Todos los roles</option>
                <option value="administrador_global">Admin Global</option>
                <option value="administrador">Administrador</option>
                <option value="paciente">Paciente</option>
              </select>
            </>
          )}

          {activeTab === "articulos" && (
            <select
              value={filterCategoriaRecurso}
              onChange={(e) => setFilterCategoriaRecurso(e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-primary-custom"
            >
              <option value="all">Todas las categorías</option>
              {Object.entries(categoriesMap).map(([catId, catName]) => (
                <option key={catId} value={catId}>{catName}</option>
              ))}
            </select>
          )}
        </div>

        {/* Botones de Exportar a CSV */}
        {activeTab === "consultas" && (
          <button
            onClick={() => exportToCSV(processedConsultas, "solicitudes", [
              { label: "Fecha", accessor: row => row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : "" },
              { label: "Nombre", accessor: row => row.nombre || "" },
              { label: "Apellidos", accessor: row => row.apellidos || "" },
              { label: "Email", accessor: row => row.email || "" },
              { label: "Teléfono", accessor: row => row.telefono || "" },
              { label: "Motivo", accessor: row => row.motivo || "" },
              { label: "Mensaje", accessor: row => row.mensaje || "" },
              { label: "Estado", accessor: row => row.estado || "pendiente" },
              { label: "Registrado", accessor: row => row.isRegistered ? "Sí" : "No" },
              { label: "Activo", accessor: row => row.isActive ? "Sí" : "No" }
            ])}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-200 flex items-center justify-center gap-1 shrink-0"
          >
            📥 Exportar Solicitudes (CSV)
          </button>
        )}

        {activeTab === "usuarios" && (
          <button
            onClick={() => exportToCSV(processedUsuarios, "usuarios_autorizados", [
              { label: "Email/ID", accessor: row => row.id || "" },
              { label: "Nombre", accessor: row => row.nombre || "" },
              { label: "Teléfono", accessor: row => row.telefono || "" },
              { label: "Último Acceso", accessor: row => mapaUltimoAcceso[row.id.toLowerCase()] ? mapaUltimoAcceso[row.id.toLowerCase()].toLocaleString() : "Sin accesos" },
              { label: "Origen", accessor: row => row.origenEncuentro || "" },
              { label: "Observaciones", accessor: row => row.observaciones || "" },
              { label: "Estado", accessor: row => row.activo !== false ? "Activo" : "Inactivo" },
              { label: "Acepta Política", accessor: row => row.aceptaPolitica ? "Sí" : "No" },
              { label: "Última Modificación", accessor: row => row.updatedAt?.toDate ? row.updatedAt.toDate().toLocaleString() : (row.createdAt?.toDate ? row.createdAt.toDate().toLocaleString() : "") },
              { label: "Roles", accessor: row => row.roles ? row.roles.join(", ") : "" }
            ])}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-200 flex items-center justify-center gap-1 shrink-0"
          >
            📥 Exportar Usuarios (CSV)
          </button>
        )}

        {activeTab === "articulos" && (
          <button
            onClick={() => exportToCSV(processedArticles, "recursos_blog", [
              { label: "Título", accessor: row => row.title || "" },
              { label: "Slug", accessor: row => row.slug || "" },
              { label: "Categorías", accessor: row => row.categoryIds ? row.categoryIds.map(cId => categoriesMap[cId] || cId).join(", ") : "" },
              { label: "URL PDF", accessor: row => row.pdfUrl || "" }
            ])}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-200 flex items-center justify-center gap-1 shrink-0"
          >
            📥 Exportar Recursos (CSV)
          </button>
        )}

        {activeTab === "historial" && (
          <button
            onClick={() => {
              // Aplanamos todos los accesos para la exportación completa
              const listaExportar = [];
              processedHistorial.forEach(u => {
                u.accesos.forEach(acc => {
                  listaExportar.push({ email: u.email, ...acc });
                });
              });
              exportToCSV(listaExportar, "historial_accesos", [
                { label: "Usuario (Email)", accessor: row => row.email || "" },
                { label: "Fecha y Hora", accessor: row => row.fecha ? new Date(row.fecha).toLocaleString() : "" },
                { label: "IP", accessor: row => row.ip || "" },
                { label: "Dispositivo", accessor: row => row.dispositivo || "" },
                { label: "Sistema Operativo", accessor: row => row.detallesSO || "" },
                { label: "User Agent", accessor: row => row.userAgent || "" }
              ]);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-200 flex items-center justify-center gap-1 shrink-0"
          >
            📥 Exportar Accesos (CSV)
          </button>
        )}
      </div>

      {/* Alertas globales */}
      {mensaje && <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl text-sm">{mensaje}</div>}
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

      {/* ==================== PESTAÑA 1: CONSULTAS ==================== */}
      {activeTab === "consultas" && (
        <section className="space-y-6">
          <div id="solicitudes" className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-primary-custom">Gestión de Solicitudes</h2>
            <button onClick={fetchConsultas} className="text-xs text-primary-custom hover:underline font-semibold">
              🔄 Actualizar lista
            </button>
          </div>

          {loadingConsultas ? (
            <p className="text-center py-12 text-slate-500">Cargando solicitudes...</p>
          ) : processedConsultas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-100 shadow-sm">
              No hay solicitudes que coincidan con la búsqueda o filtro seleccionado.
            </div>
          ) : (
            <div>
              {/* VISTA TARJETAS (Móvil) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {processedConsultas.map((item) => (
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
                        item.estado === "completada" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
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

                    <div className="flex gap-2 pt-1 text-xs">
                      {item.isRegistered ? (
                        <span title="Usuario registrado" className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold text-[11px] border border-blue-200">
                          👤 Registrado
                        </span>
                      ) : (
                        <span title="No registrado" className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[11px] border border-slate-200">
                          ⚪ No registrado
                        </span>
                      )}

                      {item.isActive ? (
                        <span title="Cuenta activa" className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold text-[11px] border border-emerald-200">
                          🟢 Activo
                        </span>
                      ) : (
                        <span title="Cuenta inactiva" className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-semibold text-[11px] border border-rose-200">
                          🔴 Inactivo
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Motivo</span>
                      <span className="inline-block px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                        {item.motivo}
                      </span>
                    </div>

                    {item.mensaje && (
                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-100 line-clamp-3">
                        "{item.mensaje}"
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => setSelectedConsultaModal(item)}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                      >
                        👁️ Ver detalle
                      </button>
                      {item.estado !== "completada" && (
                        <button
                          onClick={() => completarSolicitud(item.id)}
                          className="flex-1 py-2.5 bg-green-700 hover:bg-[#266360] text-white text-xs font-bold rounded-xl transition"
                        >
                          Completar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* VISTA TABLA (Escritorio) */}
              <div className="hidden md:block bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-sm uppercase select-none">
                        <th onClick={() => handleSort('createdAt')} className="p-4 cursor-pointer hover:bg-slate-200">
                          Fecha {sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </th>
                        <th onClick={() => handleSort('nombre')} className="p-4 cursor-pointer hover:bg-slate-200">
                          Paciente {sortConfig.key === 'nombre' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </th>
                        <th onClick={() => handleSort('email')} className="p-4 cursor-pointer hover:bg-slate-200">
                          Contacto {sortConfig.key === 'email' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </th>
                        <th onClick={() => handleSort('motivo')} className="p-4 cursor-pointer hover:bg-slate-200">
                          Motivo {sortConfig.key === 'motivo' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </th>
                        <th className="p-4">Mensaje</th>
                        <th onClick={() => handleSort('estado')} className="p-4 cursor-pointer hover:bg-slate-200">
                          Estado {sortConfig.key === 'estado' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {processedConsultas.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 text-slate-500 whitespace-nowrap">
                            {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : "Reciente"}
                          </td>
                          <td className="p-4 font-semibold">
                            {item.nombre} {item.apellidos}
                          </td>
                          <td className="p-4">
                             {item.isRegistered && item.isActive ? (<div className="px-2.5 py-1 bg-emerald-100 text-green-700 rounded-full text-xs font-semibold">{item.email}</div>) : ''}
                             {item.isRegistered && !item.isActive ? (<div className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">{item.email}</div>) : ''}
                             {!item.isRegistered ? (<div className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{item.email}</div>) : ''}

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
                              item.estado === "completada" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {item.estado || "pendiente"}
                            </span>
                          </td>
                          <td className="p-4 text-center whitespace-nowrap space-x-2">
                            <button
                              onClick={() => setSelectedConsultaModal(item)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                            >
                              Ver detalle
                            </button>
                            {item.estado !== "completada" && (
                              <button
                                onClick={() => completarSolicitud(item.id)}
                                className="px-3 py-1.5 bg-green-700 hover:bg-[#266360] text-white text-xs font-bold rounded-lg transition"
                              >
                                Completar
                              </button>
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
        <section id="usuarios" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-primary-custom">Gestión de Usuarios</h2>
            <button
              onClick={() => setActiveUserModal("create")}
              className="px-4 py-2 bg-primary-custom hover:bg-[#266360] text-white text-xs font-bold rounded-xl transition"
            >
              + Dar de alta nuevo usuario
            </button>
          </div>

          {activeUserModal && (
            <div ref={userFormRef} className="scroll-mt-6">
              <UserFormModal 
                userToEdit={activeUserModal !== "create" ? activeUserModal : null} 
                isGlobalAdmin={isGlobalAdmin} 
                onClose={() => setActiveUserModal(null)} 
                onSubmit={handleUserFormSubmit} 
              />
            </div>
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
          ) : processedUsuarios.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-100 shadow-sm">
              No hay usuarios que coincidan con la búsqueda o filtro seleccionado.
            </div>
          ) : (
            <div>
              {/* VISTA TARJETAS (Móvil) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {processedUsuarios.map((u) => {
                  const fechaUltimoAcceso = mapaUltimoAcceso[u.id.toLowerCase()];

                  return (
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
                          <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Último Acceso</span>
                          <span className="font-semibold text-slate-700">
                            {fechaUltimoAcceso ? fechaUltimoAcceso.toLocaleDateString() : "Sin accesos"}
                          </span>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Política Privacidad</span>
                          <span className={`font-semibold ${u.aceptaPolitica ? "text-green-700" : "text-red-400"}`}>
                            {u.aceptaPolitica ? "✓ Aceptada" : "✗ No aceptada"}
                          </span>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Origen</span>
                          <span className="truncate block">{u.origenEncuentro || "-"}</span>
                        </div>
                      </div>

                      {u.observaciones && (
                        <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900 italic">
                          <span className="block not-italic font-bold text-[10px] uppercase text-amber-700">Observaciones:</span>
                          {u.observaciones}
                        </div>
                      )}

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
                  );
                })}
              </div>

              {/* VISTA TABLA (Escritorio) */}
              <div className="hidden md:block bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-sm uppercase select-none">
                        <th onClick={() => handleSort('id')} className="p-4 cursor-pointer hover:bg-slate-200">
                          Email / ID {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </th>
                        <th onClick={() => handleSort('nombre')} className="p-4 cursor-pointer hover:bg-slate-200">
                          Nombre {sortConfig.key === 'nombre' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </th>
                        <th className="p-4">Teléfono</th>
                        <th className="p-4 whitespace-nowrap">Último Acceso</th>
                        <th className="p-4 text-center">Política</th>
                        <th onClick={() => handleSort('updatedAt')} className="p-4 cursor-pointer hover:bg-slate-200 whitespace-nowrap">
                          Última mod. {sortConfig.key === 'updatedAt' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </th>
                        <th className="p-4">Observaciones</th>
                        <th onClick={() => handleSort('activo')} className="p-4 text-center cursor-pointer hover:bg-slate-200">
                          Estado {sortConfig.key === 'activo' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </th>
                        <th className="p-4">Roles</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {processedUsuarios.map((u) => {
                        const fechaUltimoAcceso = mapaUltimoAcceso[u.id.toLowerCase()];

                        return (
                          <tr key={u.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 font-semibold">{u.id}</td>
                            <td className="p-4">{u.nombre || "-"}</td>
                            <td className="p-4">{u.telefono || "-"}</td>

                            <td className="p-4 text-xs whitespace-nowrap">
                              {fechaUltimoAcceso ? (
                                <span className="font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                  🕒 {fechaUltimoAcceso.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">Sin accesos</span>
                              )}
                            </td>

                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.aceptaPolitica !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {u.aceptaPolitica !== false ? "Si" : "No"}
                              </span>
                            </td>
                            <td className="p-4 text-xs whitespace-nowrap text-slate-500">
                              {u.updatedAt?.toDate 
                                ? u.updatedAt.toDate().toLocaleString() 
                                : (u.createdAt?.toDate ? u.createdAt.toDate().toLocaleString() : "-")}
                            </td>
                            <td className="p-4 text-xs max-w-xs truncate text-slate-600" title={u.observaciones}>
                              {u.observaciones || "-"}
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================== PESTAÑA 3: RECURSOS BLOG ==================== */}
      {activeTab === "articulos" && (
        <section id="recursos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-primary-custom">Gestión de Recursos</h2>
            <button
              onClick={() => setActiveArticleModal("create")}
              className="px-4 py-2 bg-primary-custom hover:bg-[#266360] text-white text-xs font-bold rounded-xl transition"
            >
              + Crear nuevo recurso
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
                <h3 className="text-xl font-bold text-red-600">¿Estás seguro de eliminar este recurso?</h3>
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
            <p className="text-center py-12 text-slate-500">Cargando recursos...</p>
          ) : processedArticles.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-100 shadow-sm">
              No hay recursos que coincidan con la búsqueda o categoría seleccionada.
            </div>
          ) : (
            <div>
              {/* VISTA TARJETAS (Móvil) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {processedArticles.map((art) => (
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

              {/* VISTA TABLA (Escritorio) */}
              <div className="hidden md:block bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-sm uppercase select-none">
                        <th className="p-4">Portada</th>
                        <th onClick={() => handleSort('title')} className="p-4 cursor-pointer hover:bg-slate-200">
                          Título / Slug {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </th>
                        <th className="p-4">Categorías</th>
                        <th className="p-4 text-center">PDF</th>
                        <th onClick={() => handleSort('updatedAt')} className="p-4 cursor-pointer hover:bg-slate-200">
                          Modificación {sortConfig.key === 'updatedAt' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {processedArticles.map((art) => (
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

      {/* ==================== PESTAÑA 4: HISTORIAL DE ACCESOS (AGRUPADO) ==================== */}
      {activeTab === "historial" && (
        <section id="historial-accesos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-primary-custom">Histórico de Accesos por Usuario</h2>
            <button onClick={fetchHistorialAccesos} className="text-xs text-primary-custom hover:underline font-semibold">
              🔄 Actualizar lista
            </button>
          </div>

          {loadingHistorial ? (
            <p className="text-center py-12 text-slate-500">Cargando registros de acceso...</p>
          ) : processedHistorial.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-100 shadow-sm">
              No hay registros de acceso que coincidan con la búsqueda por correo.
            </div>
          ) : (
            <div>
              {/* VISTA TARJETAS COLLAPSIBLE (Móvil) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {processedHistorial.map((u) => {
                  const isExpanded = !!expandedEmails[u.email];
                  const ultimoAccesoStr = u.ultimoAccesoDate ? u.ultimoAccesoDate.toLocaleString() : "Sin fecha";

                  return (
                    <div key={u.email} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3 text-sm">
                      <div 
                        onClick={() => toggleExpandEmail(u.email)}
                        className="flex justify-between items-start gap-2 cursor-pointer select-none"
                      >
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-base break-all">
                            {u.email}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Último acceso: <strong className="text-slate-700">{ultimoAccesoStr}</strong>
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-100 text-primary-custom rounded-full text-xs font-bold shrink-0 flex items-center gap-1">
                          <span>{u.totalAccesos} accesos</span>
                          <span>{isExpanded ? '▲' : '▼'}</span>
                        </span>
                      </div>

                      {/* Lista desplegable móvil */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-slate-100 space-y-2 animate-in fade-in">
                          <span className="block text-[10px] font-bold uppercase text-slate-400">Desglose de Accesos (Descendente)</span>
                          {u.accesos.map((acc, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                              <div className="flex justify-between text-slate-700 font-semibold">
                                <span>🕒 {acc.fecha ? new Date(acc.fecha).toLocaleString() : 'Reciente'}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  acc.dispositivo === 'Móvil' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {acc.dispositivo}
                                </span>
                              </div>
                              <div className="text-slate-500 flex gap-4 text-[11px]">
                                <span>IP: <strong className="font-mono text-slate-700">{acc.ip}</strong></span>
                                <span>S.O.: <strong className="text-slate-700">{acc.detallesSO}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* VISTA TABLA ACCORDION / COLLAPSE (Escritorio) */}
              <div className="hidden md:block bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-sm uppercase select-none">
                        <th className="p-4 w-12 text-center"></th>
                        <th onClick={() => handleSort('email')} className="p-4 cursor-pointer hover:bg-slate-200">
                          Usuario (Email) {sortConfig.key === 'email' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </th>
                        <th className="p-4 text-center">Total Accesos</th>
                        <th onClick={() => handleSort('ultimoAcceso')} className="p-4 cursor-pointer hover:bg-slate-200">
                          Último Acceso {sortConfig.key === 'ultimoAcceso' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                        </th>
                        <th className="p-4 text-center">Último Dispositivo</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {processedHistorial.map((u) => {
                        const isExpanded = !!expandedEmails[u.email];
                        const ultimoAccesoStr = u.ultimoAccesoDate ? u.ultimoAccesoDate.toLocaleString() : "Sin fecha";
                        const ultimoAccesoObj = u.accesos[0] || {};

                        return (
                          <React.Fragment key={u.email}>
                            <tr 
                              onClick={() => toggleExpandEmail(u.email)} 
                              className="hover:bg-slate-50 transition cursor-pointer select-none"
                            >
                              <td className="p-4 text-center text-slate-400 font-bold">
                                {isExpanded ? '▲' : '▼'}
                              </td>
                              <td className="p-4 font-semibold text-slate-800">
                                {u.email}
                              </td>
                              <td className="p-4 text-center">
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-full text-xs">
                                  {u.totalAccesos}
                                </span>
                              </td>
                              <td className="p-4 text-xs whitespace-nowrap text-slate-600">
                                🕒 {ultimoAccesoStr}
                              </td>
                              <td className="p-4 text-center">
                                {ultimoAccesoObj.dispositivo ? (
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    ultimoAccesoObj.dispositivo === 'Móvil' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {ultimoAccesoObj.dispositivo === 'Móvil' ? '📱 Móvil' : '💻 Escritorio'}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="p-4 text-right">
                                <button className="text-xs font-bold text-primary-custom hover:underline">
                                  {isExpanded ? 'Ocultar historial' : 'Ver todos los accesos'}
                                </button>
                              </td>
                            </tr>

                            {/* FILA DESPLEGABLE CON DETALLES DE ACCESO */}
                            {isExpanded && (
                              <tr className="bg-slate-50/70">
                                <td colSpan="6" className="p-4 pl-12 border-t border-b border-slate-200">
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">
                                      Histórico Completo de Accesos para <span className="text-slate-800">{u.email}</span> ({u.accesos.length})
                                    </h4>

                                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                      <table className="w-full text-left text-xs">
                                        <thead>
                                          <tr className="bg-slate-100/70 text-slate-600 uppercase border-b border-slate-200">
                                            <th className="p-2.5">Fecha y Hora</th>
                                            <th className="p-2.5">IP</th>
                                            <th className="p-2.5">Dispositivo</th>
                                            <th className="p-2.5">Sistema Operativo</th>
                                            <th className="p-2.5">User Agent</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-600">
                                          {u.accesos.map((acc, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                              <td className="p-2.5 font-medium whitespace-nowrap text-slate-700">
                                                {acc.fecha ? new Date(acc.fecha).toLocaleString() : 'Reciente'}
                                              </td>
                                              <td className="p-2.5 font-mono text-slate-700">{acc.ip || '-'}</td>
                                              <td className="p-2.5">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                  acc.dispositivo === 'Móvil' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                }`}>
                                                  {acc.dispositivo}
                                                </span>
                                              </td>
                                              <td className="p-2.5">{acc.detallesSO || '-'}</td>
                                              <td className="p-2.5 font-mono text-[10px] text-slate-400 max-w-xs truncate" title={acc.userAgent}>
                                                {acc.userAgent || '-'}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
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