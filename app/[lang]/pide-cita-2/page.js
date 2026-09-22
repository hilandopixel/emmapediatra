"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export default function FormularioConsulta({ lang }) {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target);
    
    try {
      await addDoc(collection(db, "consultas"), {
        nombre: formData.get("nombre"),
        apellidos: formData.get("apellidos"),
        email: formData.get("email"),
        telefono: formData.get("telefono"),
        motivo: formData.get("motivo"),
        mensaje: formData.get("mensaje"),
        estado: "pendiente", // Quedará en tu panel como solicitud pendiente
        createdAt: serverTimestamp(),
      });

      setEnviado(true);
    } catch (err) {
      console.error("Error al guardar la consulta:", err);
      setError("Hubo un error al enviar la solicitud. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="p-8 text-center bg-green-50 rounded-2xl max-w-xl mx-auto my-12 text-green-800">
        <h3 className="text-2xl font-bold mb-2">¡Solicitud enviada con éxito!</h3>
        <p>Nos pondremos en contacto contigo muy pronto para revisar tu caso.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6 bg-white p-8 rounded-2xl shadow-md my-12 text-primary-custom">
      <h2 className="text-2xl font-bold text-primary-custom">Solicita tu Videoconsulta</h2>
      
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input type="text" name="nombre" required className="w-full border rounded-lg p-3" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Apellidos</label>
          <input type="text" name="apellidos" required className="w-full border rounded-lg p-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" name="email" required className="w-full border rounded-lg p-3" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input type="tel" name="telefono" required className="w-full border rounded-lg p-3" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Motivo de consulta</label>
        <select name="motivo" className="w-full border rounded-lg p-3 bg-white">
          <option value="videoconsulta">Videoconsulta</option>
          <option value="cursos">Cursos y Formación</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mensaje / Motivo detallado</label>
        <textarea name="mensaje" rows="4" required className="w-full border rounded-lg p-3"></textarea>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 bg-primary-custom hover:bg-[#266360] text-white font-bold rounded-xl transition"
      >
        {loading ? "Enviando..." : "Enviar solicitud"}
      </button>
    </form>
  );
}