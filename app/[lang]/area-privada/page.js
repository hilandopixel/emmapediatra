"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import AuthForm from "@/components/AuthForm";

export default function AreaPrivadaPage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

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

  if (loadingAuth) {
    return <div className="text-center py-24 text-slate-700">Cargando área privada...</div>;
  }

  // 1. Si no hay sesión, mostramos el formulario reutilizable
  if (!user) {
    return (
      <div className="py-16">
        <AuthForm />
      </div>
    );
  }

  // 2. Si está logueado pero inactivo (pendiente de validación)
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

  // 3. Si está logueado y activo -> Panel privado
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 space-y-8">
      <div className="flex justify-between items-center bg-white p-8 rounded-2xl shadow-md border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-custom">Área Privada</h1>
          <p className="text-slate-700 mt-1">Bienvenido/a, <strong className="text-primary-custom">{userData?.nombre || user.email}</strong></p>
        </div>
        <button 
          onClick={() => signOut(auth)} 
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 button-primary-custom text-xs font-bold rounded-lg transition"
        >
          Cerrar sesión
        </button>
      </div>

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
    </main>
  );
}