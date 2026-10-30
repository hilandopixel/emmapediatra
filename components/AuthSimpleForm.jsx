// components/AuthForm.jsx
'use client';

import { useState } from 'react';

export default function AuthSimpleForm({ onVerifySuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Campos del formulario
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [origenEncuentro, setOrigenEncuentro] = useState('');
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  
  // Estados y mensajes
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Manejo del acceso rápido por Email
  const handleAccessSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/simple-verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.permitido) {
        onVerifySuccess(data.userData);
      } else {
        setMessage({
          type: 'error',
          text: data.mensaje || data.error || 'Correo no encontrado o cuenta no activada.',
        });
      }
    } catch (err) {
      console.error('Error al verificar acceso:', err);
      setMessage({ type: 'error', text: 'Error de conexión al consultar el acceso.' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Manejo de la Solicitud de Registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!aceptaPolitica) {
      setMessage({ type: 'error', text: 'Debes aceptar la política de privacidad.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/notificar-nuevo-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nombre: `${nombre} ${apellidos}`.trim(),
          telefono,
          origenEncuentro,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: '¡Solicitud enviada correctamente! Revisaremos tus datos y activaremos tu cuenta a la brevedad.',
        });
        // Resetear campos
        setNombre('');
        setApellidos('');
        setTelefono('');
        setOrigenEncuentro('');
        setAceptaPolitica(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Hubo un error al procesar tu solicitud.' });
      }
    } catch (err) {
      console.error('Error al enviar registro:', err);
      setMessage({ type: 'error', text: 'Error al conectar con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 text-center space-y-6">
      <h1 className="text-2xl font-bold text-primary-custom">
        {isRegistering ? 'Solicitar Registro Gratuito' : 'Acceso al Área Privada'}
      </h1>
      
      <p className="text-slate-600 text-xs">
        {isRegistering
          ? 'Rellena el siguiente formulario para solicitar tu acceso gratuito al contenido exclusivo.'
          : 'Introduce tu correo electrónico registrado para acceder.'}
      </p>

      <form onSubmit={isRegistering ? handleRegisterSubmit : handleAccessSubmit} className="space-y-4 text-left">
        {/* Campo de Correo (Siempre visible) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Correo electrónico *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu-email@ejemplo.com"
            className="w-full border rounded-xl p-3 text-sm text-slate-800 bg-white border-slate-200 focus:outline-none focus:border-primary-custom"
          />
        </div>

        {/* Campos adicionales de registro */}
        {isRegistering && (
          <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: María"
                  className="w-full border rounded-xl p-3 text-sm text-slate-800 bg-white border-slate-200 focus:outline-none focus:border-primary-custom"
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
                  className="w-full border rounded-xl p-3 text-sm text-slate-800 bg-white border-slate-200 focus:outline-none focus:border-primary-custom"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono *</label>
              <input
                type="tel"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+34 600 000 000"
                className="w-full border rounded-xl p-3 text-sm text-slate-800 bg-white border-slate-200 focus:outline-none focus:border-primary-custom"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ¿Cómo nos has conocido?
              </label>
              <select
                value={origenEncuentro}
                onChange={(e) => setOrigenEncuentro(e.target.value)}
                className="w-full border rounded-xl p-3 text-sm text-slate-800 bg-white border-slate-200 focus:outline-none focus:border-primary-custom"
              >
                <option value="">Selecciona una opción...</option>
                <option value="Referencia de amigos/familiares">Referencia de amigos/familiares</option>
                <option value="Buscando en la web">Buscando en la web</option>
                <option value="Me informaron durante la consulta">Me informaron durante la consulta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Checkbox Política de Privacidad */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="politica"
                required
                checked={aceptaPolitica}
                onChange={(e) => setAceptaPolitica(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-primary-custom focus:ring-primary-custom cursor-pointer"
              />
              <label htmlFor="politica" className="text-[11px] text-slate-600 leading-snug cursor-pointer select-none">
                He leído y acepto la{' '}
                <a href="/politica-de-privacidad" target="_blank" className="text-primary-custom underline font-semibold">
                  Política de Privacidad
                </a>.
              </label>
            </div>
          </div>
        )}

        {/* Mensajes de Alerta Destacados */}
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

        {/* Botón principal con Spinner y deshabilitado dinámico */}
        <button
          type="submit"
          disabled={loading || (isRegistering && !aceptaPolitica)}
          className="w-full py-3 bg-primary-custom hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Procesando...</span>
            </>
          ) : isRegistering ? (
            'Enviar Solicitud de Registro'
          ) : (
            'Acceder al contenido'
          )}
        </button>
      </form>

      {/* Enlace alternativo */}
      <div className="pt-4 border-t border-slate-100">
        {!isRegistering ? (
          <p className="text-xs text-slate-500">
            ¿Aún no tienes acceso?{' '}
            <button
              type="button"
              onClick={() => {
                setMessage({ type: '', text: '' });
                setIsRegistering(true);
              }}
              className="text-primary-custom font-bold hover:underline ml-1"
            >
              Registrarme de forma gratuita
            </button>
          </p>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMessage({ type: '', text: '' });
              setIsRegistering(false);
            }}
            className="text-xs text-slate-500 hover:text-primary-custom font-semibold"
          >
            ← Volver a la pantalla de acceso con correo
          </button>
        )}
      </div>
    </div>
  );
}