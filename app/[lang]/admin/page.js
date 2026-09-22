"use client";

import { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import { collection, getDocs, updateDoc, doc, query, orderBy, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Estados del formulario de login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Estados del panel de administración
  const [consultas, setConsultas] = useState([]);
  const [loadingConsultas, setLoadingConsultas] = useState(false);

  // 1. Escuchar cambios de sesión en Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        // Verificar si el usuario tiene el permiso "gestionar_solicitudes" en Firebase
        try {
          const q = query(
            collection(db, "usuarios_autorizados"), 
            where("email", "==", currentUser.email.toLowerCase())
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            // Comprobamos si el array de permisos incluye "gestionar_solicitudes" (o si es admin total)
            const permisos = userData.permisos || [];
            if (permisos.includes("gestionar_solicitudes") || userData.esAdmin) {
              setHasPermission(true);
              fetchConsultas();
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

  // 2. Función para iniciar sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Error en login:", err);
      setLoginError("Credenciales incorrectas o usuario no autorizado.");
    }
  };

  // 3. Cargar consultas desde Firebase
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

  // 4. Aprobar solicitud
  const aprobarSolicitud = async (id) => {
    try {
      const consultaRef = doc(db, "consultas", id);
      await updateDoc(consultaRef, { estado: "aprobada" });
      setConsultas(consultas.map(c => c.id === id ? { ...c, estado: "aprobada" } : c));
      alert("¡Solicitud aprobada con éxito!");
    } catch (err) {
      console.error("Error al aprobar:", err);
      alert("Hubo un error al aprobar la solicitud.");
    }
  };

  // Pantalla de carga inicial mientras valida la sesión
  if (checkingAuth) {
    return <div className="text-center py-24 text-slate-500">Verificando sesión y permisos...</div>;
  }

  // Si no está logueado o no tiene permisos, mostramos exclusivamente la pantalla de Login
  if (!user || !hasPermission) {
    return (
      <div className="max-w-md mx-auto my-24 bg-white p-8 rounded-2xl shadow-md border border-slate-100">
        <h2 className="text-2xl font-bold text-primary-custom mb-2 text-center">Panel de Administración</h2>
        <p className="text-xs text-slate-400 text-center mb-6">Acceso restringido a personal autorizado</p>

        {user && !hasPermission && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">
            Tu cuenta está autenticada, pero no dispone del permiso <strong>gestionar_solicitudes</strong>.
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
              className="w-full border rounded-lg p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full border rounded-lg p-3"
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-3 bg-primary-custom hover:bg-[#266360] text-white font-bold rounded-xl transition"
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

  // Si pasa las validaciones, se pinta el panel de administración
  return (
    <main className="max-w-7xl mx-auto px-6 py-12 tex primary-custom">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-primary-custom">Panel de Administración - Solicitudes</h1>
        <button 
          onClick={() => signOut(auth)} 
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
        >
          Cerrar sesión
        </button>
      </div>

      {loadingConsultas ? (
        <p className="text-center py-12">Cargando solicitudes...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
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
                {consultas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-slate-500">No hay solicitudes registradas todavía.</td>
                  </tr>
                ) : (
                  consultas.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : "Reciente"}
                      </td>
                      <td className="p-4 font-semibold ">
                        {item.nombre} {item.apellidos}
                      </td>
                      <td className="p-4">
                        <div>{item.email}</div>
                        <div className="text-xs">{item.telefono}</div>
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
                          item.estado === "aprobada" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-amber-100 text-amber-800"
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