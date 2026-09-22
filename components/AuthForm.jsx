"use client";

import { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";

export default function AuthForm({ onSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMensajeExito("");

    const formData = new FormData(e.target);
    const email = formData.get("email").trim().toLowerCase();
    const password = formData.get("password");
    const nombre = formData.get("nombre") || "";

    try {
      if (isRegistering) {
        // 1. Registrar en Firebase Auth
        await createUserWithEmailAndPassword(auth, email, password);

        // 2. Registrar en Firestore (inactivo por defecto para validación manual)
        const userRef = doc(db, "usuarios_autorizados", email);
        await setDoc(userRef, {
          email,
          nombre,
          activo: false,
          roles: [],
          permisos: [],
          recursosPermitidos: [],
          createdAt: serverTimestamp(),
        });

        setMensajeExito("Solicitud de registro completada, revisaremos en la mayor brevedad posible, Muchas gracias.");
        setIsRegistering(false);
        e.target.reset();
      } else {
        // Iniciar sesión
        await signInWithEmailAndPassword(auth, email, password);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("Error en autenticación:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo ya está registrado. Prueba a iniciar sesión.");
      } else if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setError("Credenciales incorrectas. Comprueba tu correo y contraseña.");
      } else {
        setError("Ocurrió un error al procesar tu solicitud.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-md border border-slate-100">
      <h2 className="text-2xl font-bold  mb-2 text-center">
        {isRegistering ? "Crear una cuenta" : "Acceso de Usuario"}
      </h2>
      <p className="text-xs text-slate-500 text-center mb-6">
        {isRegistering 
          ? "Introduce tus datos para solicitar acceso al área privada" 
          : "Introduce tu correo y contraseña para acceder"}
      </p>

      {mensajeExito && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl text-sm leading-relaxed font-medium">
          {mensajeExito}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {isRegistering && (
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Nombre y Apellidos</label>
            <input 
              type="text" 
              name="nombre" 
              required 
              placeholder="Tu nombre completo"
              className="w-full border rounded-lg p-3 text-slate-700 bg-white"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Correo electrónico</label>
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="tucorreo@example.com"
            className="w-full border rounded-lg p-3 text-slate-700 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Contraseña</label>
          <input 
            type="password" 
            name="password" 
            required 
            placeholder="••••••••"
            className="w-full border rounded-lg p-3 text-slate-700 bg-white"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-primary-custom hover:bg-[#266360] text-white font-bold rounded-xl transition text-sm"
        >
          {loading ? "Procesando..." : (isRegistering ? "Enviar solicitud de registro" : "Iniciar sesión")}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          type="button"
          onClick={() => { setIsRegistering(!isRegistering); setError(""); setMensajeExito(""); }}
          className="text-sm text-pink-600 hover:underline font-medium"
        >
          {isRegistering 
            ? "¿Ya tienes una cuenta? Inicia sesión aquí" 
            : "Si es la primera vez que accedes, pincha aquí para registrarte"}
        </button>
      </div>
    </div>
  );
}