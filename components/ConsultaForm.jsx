// components/FormularioConsulta.jsx
'use client';

import { useState, useRef } from 'react';
import { Turnstile } from "@marsidev/react-turnstile";

export default function ConsultaForm({ lang }) {
  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [motivo, setMotivo] = useState('videoconsulta');
  const [mensaje, setMensaje] = useState('');
  const [aceptaPolitica, setAceptaPolitica] = useState(false);

  // Captcha, estados y mensajes de respuesta
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aceptaPolitica) {
      setMessage({ type: 'error', text: 'Debes aceptar la política de privacidad.' });
      return;
    }

    if (!turnstileToken) {
      setMessage({ type: 'error', text: 'Por favor, completa la verificación de seguridad (Captcha).' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Llamada única a la API: Valida Captcha, calcula isRegistered e isActive, guarda en Firestore y envía el correo
      const res = await fetch('/api/admin/notificar-nueva-consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellidos,
          email,
          telefono,
          motivo,
          mensaje,
          aceptaPolitica,
          tokenTurnstile: turnstileToken,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: '¡Solicitud enviada con éxito! Nos pondremos en contacto contigo muy pronto para revisar tu caso.',
        });

        // Resetear formulario
        setNombre('');
        setApellidos('');
        setEmail('');
        setTelefono('');
        setMotivo('videoconsulta');
        setMensaje('');
        setAceptaPolitica(false);
        setTurnstileToken(null);
        if (turnstileRef.current) turnstileRef.current.reset();
      } else {
        setMessage({
          type: 'error',
          text: data.error || data.mensaje || 'Hubo un error al enviar la solicitud.',
        });
      }
    } catch (err) {
      console.error('Error al procesar la consulta:', err);
      setMessage({ type: 'error', text: 'Error de conexión al procesar la solicitud.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-2xl shadow-md border border-slate-100 text-slate-800">
      <h2 className="text-2xl font-bold text-primary-custom mb-6">Solicita tu Videoconsulta</h2>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Nombre y Apellidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: María"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-800 bg-white focus:outline-none focus:border-primary-custom"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Apellidos *</label>
            <input
              type="text"
              required
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              placeholder="Ej: García Pérez"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-800 bg-white focus:outline-none focus:border-primary-custom"
            />
          </div>
        </div>

        {/* Email y Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu-email@ejemplo.com"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-800 bg-white focus:outline-none focus:border-primary-custom"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono *</label>
            <input
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+34 600 000 000"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-800 bg-white focus:outline-none focus:border-primary-custom"
            />
          </div>
        </div>

        {/* Motivo de Consulta */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo de consulta *</label>
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-800 bg-white focus:outline-none focus:border-primary-custom"
          >
            <option value="videoconsulta">Videoconsulta</option>
            <option value="cursos">Cursos y Formación</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Mensaje */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mensaje / Motivo detallado *</label>
          <textarea
            rows="4"
            required
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Describe brevemente el motivo de tu consulta..."
            className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-800 bg-white focus:outline-none focus:border-primary-custom"
          ></textarea>
        </div>

        {/* Checkbox Política de Privacidad */}
        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="politica-consulta"
            required
            checked={aceptaPolitica}
            onChange={(e) => setAceptaPolitica(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-primary-custom focus:ring-primary-custom cursor-pointer"
          />
          <label htmlFor="politica-consulta" className="text-[11px] text-slate-600 leading-snug cursor-pointer select-none">
            He leído y acepto la{' '}
            <a href="/assets/politica-privacidad-es.pdf" target="_blank" className="text-primary-custom underline font-semibold">
              Política de Privacidad
            </a>.
          </label>
        </div>

        {/* Captcha de Cloudflare Turnstile */}
        <div className="flex justify-center py-2">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />
        </div>

        {/* Mensajes de feedback */}
        {message.text && (
          <div
            className={`p-4 rounded-xl text-xs font-medium leading-relaxed shadow-sm transition-all animate-in fade-in ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-300'
                : 'bg-red-50 text-red-700 border border-red-300'
            }`}
          >
            {message.type === 'success' ? '✓ ' : '⚠️ '}
            {message.text}
          </div>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading || !aceptaPolitica || !turnstileToken}
          className="w-full py-3.5 bg-primary-custom hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Enviando solicitud...</span>
            </>
          ) : (
            'Enviar solicitud'
          )}
        </button>
      </form>
    </div>
  );
}