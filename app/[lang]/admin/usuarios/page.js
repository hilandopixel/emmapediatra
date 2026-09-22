"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import UserFormModal from "@/components/UserFormModal";

export default function GestionUsuariosAdmin() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [canDeleteUsers, setCanDeleteUsers] = useState(false);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [confirmEmailInput, setConfirmEmailInput] = useState("");
  
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
            const permisos = data.permisos || [];
            const isActivo = data.activo === true;

            const esAdminValido = isActivo && (roles.includes("administrador_global") || roles.includes("administrador"));

            if (esAdminValido) {
              setHasAccess(true);
              const esGlobal = roles.includes("administrador_global");
              setIsGlobalAdmin(esGlobal);
              const tienePermisoBorrar = esGlobal || permisos.includes("borrar_usuarios");
              setCanDeleteUsers(tienePermisoBorrar);
              fetchUsuarios();
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

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios_autorizados"));
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUsuarios(data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData, isEditing) => {
  setMensaje("");
  setError("");

  try {
    const userRef = doc(db, "usuarios_autorizados", formData.email);

    const dataPayload = {
      nombre: formData.nombre,
      telefono: formData.telefono,
      origenEncuentro: formData.origenEncuentro,
      activo: formData.activo,
      aceptaPolitica: formData.aceptaPolitica,
      roles: formData.roles,
      permisos: formData.permisos,
      recursosPermitidos: formData.recursosPermitidos,
      updatedAt: serverTimestamp(),
    };

    if (isEditing) {
      await updateDoc(userRef, dataPayload);
      setMensaje(`¡Usuario ${formData.email} actualizado con éxito!`);
    } else {
      dataPayload.createdAt = serverTimestamp();
      await setDoc(userRef, dataPayload);
      setMensaje(`¡Usuario ${formData.email} creado con éxito!`);
    }

    setActiveModal(null);
    fetchUsuarios();
  } catch (err) {
    console.error("Error al guardar usuario:", err);
    setError("Hubo un error al guardar los datos en Firebase.");
  }
};
  const handleDeleteUserConfirm = async (e) => {
    e.preventDefault();
    if (!userToDelete) return;

    if (confirmEmailInput.trim().toLowerCase() !== userToDelete.id.toLowerCase()) {
      setError("El correo introducido no coincide. Operación cancelada.");
      setUserToDelete(null);
      setConfirmEmailInput("");
      return;
    }

    try {
      await deleteDoc(doc(db, "usuarios_autorizados", userToDelete.id));
      setMensaje(`Usuario ${userToDelete.id} eliminado correctamente.`);
      setUserToDelete(null);
      setConfirmEmailInput("");
      fetchUsuarios();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setError("Hubo un error al eliminar el usuario de Firebase.");
      setUserToDelete(null);
      setConfirmEmailInput("");
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
        <h1 className="text-3xl font-extrabold text-primary-custom">Gestión de Usuarios Autorizados</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveModal("create")}
            className="px-4 py-2 bg-primary-custom hover:bg-[#266360] text-white text-sm font-bold rounded-xl transition"
          >
            + Dar de alta nuevo usuario
          </button>
          <button onClick={() => signOut(auth)} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition">
            Cerrar sesión
          </button>
        </div>
      </div>

      {mensaje && <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl text-sm">{mensaje}</div>}
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

      {activeModal === "create" && (
        <UserFormModal 
          isGlobalAdmin={isGlobalAdmin} 
          onClose={() => setActiveModal(null)} 
          onSubmit={handleFormSubmit} 
        />
      )}

      {activeModal && activeModal !== "create" && (
        <UserFormModal 
          userToEdit={activeModal} 
          isGlobalAdmin={isGlobalAdmin} 
          onClose={() => setActiveModal(null)} 
          onSubmit={handleFormSubmit} 
        />
      )}

      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-lg border border-slate-200 space-y-4">
            <h3 className="text-xl font-bold text-red-600">¿Estás seguro de eliminar este usuario?</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              Esta acción es irreversible. Para confirmar, escribe el correo electrónico exacto del registro: <strong className="text-slate-900">{userToDelete.id}</strong>
            </p>

            <form onSubmit={handleDeleteUserConfirm} className="space-y-4">
              <input 
                type="email" 
                value={confirmEmailInput} 
                onChange={(e) => setConfirmEmailInput(e.target.value)}
                placeholder="Introduce el correo para confirmar"
                required
                className="w-full border rounded-lg p-3 text-slate-700 bg-white text-sm"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => { setUserToDelete(null); setConfirmEmailInput(""); }}
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
        <p className="text-center py-12 text-slate-700">Cargando usuarios...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-sm uppercase">
                  <th className="p-4">Email / ID</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Teléfono</th>
                  <th className="p-4">Origen</th>
                  <th className="p-4">Última modificación</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4">Roles asignados</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-slate-700">No hay usuarios autorizados registrados.</td>
                  </tr>
                ) : (
                  usuarios.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-semibold text-slate-700">{user.id}</td>
                      <td className="p-4 text-slate-700">{user.nombre || "-"}</td>
                      <td className="p-4 text-slate-700">{user.telefono || "-"}</td>
                      <td className="p-4 text-slate-700 text-xs">{user.origenEncuentro || "-"}</td>
                      <td className="p-4 text-slate-700 text-xs">
                        {user.updatedAt?.toDate 
                          ? user.updatedAt.toDate().toLocaleString() 
                          : (user.createdAt?.toDate ? user.createdAt.toDate().toLocaleString() : "Reciente")}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.activo !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {user.activo !== false ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700">
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((r) => (
                              <span key={r} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-700 text-xs">Sin roles</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setActiveModal(user)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                        >
                          Modificar
                        </button>

                        {canDeleteUsers && (
                          <button
                            onClick={() => { setUserToDelete(user); setConfirmEmailInput(""); }}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition"
                          >
                            Eliminar
                          </button>
                        )}
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