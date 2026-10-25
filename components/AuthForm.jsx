// components/AuthForm.jsx
"use client";

import { useState, useRef } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import { Turnstile } from "@marsidev/react-turnstile";

export default function AuthForm({ onSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  // Estado y referencia para el Captcha
  const [captchaToken, setCaptchaToken] = useState(null);
  const turnstileRef = useRef(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isRegistering && !aceptaPolitica) return;

    // 1. Validar que el captcha se haya resuelto
    if (!captchaToken) {
      setError("Por favor, completa la verificación de seguridad (Captcha).");
      return;
    }

    setLoading(true);
    setError("");
    setMensajeExito("");

    const formData = new FormData(e.target);
    const email = formData.get("email").trim().toLowerCase();
    const password = formData.get("password");
    
    const nombre = formData.get("nombre") || "";
    const telefono = formData.get("telefono") || "";
    const origenEncuentro = formData.get("origenEncuentro") || "";

    try {
      // 2. Verificar el token del Captcha en la API Route de la app
      const captchaRes = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      });

      const captchaData = await captchaRes.json();

      if (!captchaData.success) {
        throw new Error("CAPTCHA_FAILED");
      }

      // 3. Procesar autenticación o registro en Firebase
      if (isRegistering) {
        const userRef = doc(db, "usuarios_autorizados", email);
        await setDoc(userRef, {
          email,
          nombre,
          telefono,
          origenEncuentro,
          aceptaPolitica: true,
          activo: false,
          roles: [],
          permisos: [],
          recursosPermitidos: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Notificación por email
        try {
          await fetch("/api/notificar-registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, nombre, telefono, origenEncuentro }),
          });
        } catch (mailErr) {
          console.error("Error al enviar notificación por email:", mailErr);
        }

        setMensajeExito("Hemos recibido su solicitud y pronto tendrá acceso al área privada.");
        setIsRegistering(false);
        setAceptaPolitica(false);
        e.target.reset();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("Error en autenticación:", err);
      if (err.message === "CAPTCHA_FAILED") {
        setError("Fallo en la verificación anti-bot. Por favor, reintenta.");
      } else if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setError("Credenciales incorrectas o cuenta pendiente de aprobación por el administrador.");
      } else {
        setError("Ocurrió un error al procesar tu solicitud.");
      }
    } finally {
      setLoading(false);
      // Reiniciar el widget del captcha después de intentar enviar
      setCaptchaToken(null);
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-md border border-slate-100">
      <h2 className="text-2xl font-bold text-secondary-custom mb-2 text-center">
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
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Nombre y Apellidos</label>
              <input 
                type="text" 
                name="nombre" 
                required 
                placeholder="Tu nombre y apellidos completos"
                className="w-full border rounded-lg p-3 text-slate-700 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Número de teléfono</label>
              <input 
                type="tel" 
                name="telefono" 
                required 
                placeholder="666666666"
                className="w-full border rounded-lg p-3 text-slate-700 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">¿Cómo conociste esta área privada?</label>
              <select 
                name="origenEncuentro" 
                required
                defaultValue=""
                className="w-full border rounded-lg p-3 text-slate-700 bg-white"
              >
                <option value="">Selecciona una opción...</option>
                <option value="Referencia de amigos/familiares">Referencia de amigos/familiares</option>
                <option value="Buscando en la web">Buscando en la web</option>
                <option value="Me informaron durante la consulta">Me informaron durante la consulta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <input 
                type="checkbox" 
                id="aceptaPoliticaCheck"
                checked={aceptaPolitica}
                onChange={(e) => setAceptaPolitica(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-primary-custom rounded"
              />
              <label htmlFor="aceptaPoliticaCheck" className="text-sm font-medium text-slate-700">
                Al enviar este formulario, usted acepta la <a className="text-primary-custom" target="_blank" href="/assets/politica-privacidad-es.pdf">política de privacidad</a> para poder utilizar estos contenidos.
              </label>
            </div>
          </>
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

        { !isRegistering ? 
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Contraseña</label>
          <input 
            type="password" 
            name="password" 
            required 
            placeholder="••••••••"
            className="w-full border rounded-lg p-3 text-slate-700 bg-white"
          />
        </div> : ""}

        {/* Widget del Captcha */}
        <div className="flex justify-center py-2">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !captchaToken || (isRegistering && !aceptaPolitica)}
          className="w-full py-3 bg-primary-custom hover:bg-[#266360] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-sm"
        >
          {loading ? "Procesando..." : (isRegistering ? "Enviar solicitud de registro" : "Iniciar sesión")}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          type="button"
          onClick={() => { 
            setIsRegistering(!isRegistering); 
            setError(""); 
            setMensajeExito(""); 
            setAceptaPolitica(false); 
          }}
          className="text-sm text-pink-600 hover:underline font-medium"
        >
          {isRegistering 
            ? "¿Ya tienes una cuenta? Inicia sesión aquí" 
            : "Si es la primera vez que accede, debes registrarte aquí"}
        </button>
      </div>
    </div>
  );
}