"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function ActualizarPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get("oobCode"); 


  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oobCode) {
      setError("Código de verificación no válido o caducado.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Confirmar el cambio de contraseña con Firebase Auth
      await confirmPasswordReset(auth, oobCode, password);
      setMensaje("¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.");
      setTimeout(() => {
        router.push("/es/area-privada");
      }, 3000);
    } catch (err) {
      console.error("Error al actualizar contraseña:", err);
      setError("El enlace ha caducado o no es válido. Solicita uno nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-24 bg-white p-8 rounded-2xl shadow-md border border-slate-100">
      <h2 className="text-2xl font-bold text-secondary-custom mb-2 text-center">
        Establece tu nueva contraseña
      </h2>
      <p className="text-xs text-slate-500 text-center mb-6">
        Introduce tu nueva contraseña de acceso para el área privada.
      </p>

      {mensaje && <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl text-sm font-medium">{mensaje}</div>}
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Nueva contraseña</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
            className="w-full border rounded-lg p-3 text-slate-700 bg-white text-sm"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !oobCode}
          className="w-full py-3 bg-primary-custom hover:bg-[#266360] disabled:opacity-50 text-white font-bold rounded-xl transition text-sm"
        >
          {loading ? "Actualizando..." : "Guardar nueva contraseña"}
        </button>
      </form>
    </div>
  );
}