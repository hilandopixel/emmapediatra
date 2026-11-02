// components/ConsultaDetailForm.jsx
'use client';

export default function ConsultaDetailForm({ consulta, onClose, onCompletar }) {
  if (!consulta) return null;

  const fechaFormateada = consulta.createdAt?.toDate 
    ? consulta.createdAt.toDate().toLocaleString() 
    : "Reciente";

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white max-w-lg w-full p-6 rounded-2xl shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">
              Detalle de Solicitud
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">ID: {consulta.id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Información General y Datos de Contacto */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Paciente</span>
            <span className="font-semibold text-slate-800 text-sm block">
              {consulta.nombre} {consulta.apellidos}
            </span>
          </div>

          <div>
            <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Estado de la Solicitud</span>
            <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
              consulta.estado === "completada" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
            }`}>
              {consulta.estado || "pendiente"}
            </span>
          </div>

          <div>
            <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Correo Electrónico</span>
            <a href={`mailto:${consulta.email}`} className="text-primary-custom font-semibold hover:underline break-all">
              {consulta.email}
            </a>
          </div>

          <div>
            <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Teléfono</span>
            <a href={`tel:${consulta.telefono}`} className="text-slate-700 font-semibold hover:underline">
              {consulta.telefono || "-"}
            </a>
          </div>

          <div>
            <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Fecha de Envío</span>
            <span className="text-slate-600">{fechaFormateada}</span>
          </div>

          <div>
            <span className="block font-bold text-slate-400 uppercase text-[10px] mb-0.5">Motivo</span>
            <span className="inline-block px-2.5 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
              {consulta.motivo}
            </span>
          </div>
        </div>

        {/* Estado del Usuario en la Web (isRegistered / isActive) */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
          <span className="block font-bold text-slate-500 uppercase text-[10px]">Cuenta en el Sistema</span>
          <div className="flex flex-wrap gap-2 text-xs">
                            {consulta.isRegistered && consulta.isActive ? 
                              <div>
                                <div title="Cuenta activa" className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-semibold text-[11px] border border-rose-200">
                                    🟢  Cuenta activa
                                  </div>
                                </div>
                            : ''}

                            {consulta.isRegistered && !consulta.isActive ? 
                              <div>
                                <div title="Cuenta no activa" className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-semibold text-[11px] border border-rose-200">
                                    🟠  Cuenta inactiva
                                  </div>
                                </div>
                            : ''}

                            {!consulta.isRegistered ? 
                            <div>
                                <div title="No registrado" className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-semibold text-[11px] border border-rose-200">
                                  🔴 No registrado
                                </div>

                              </div>
                            : ''}
          </div>
        </div>

        {/* Mensaje Detallado */}
        <div>
          <span className="block font-bold text-slate-400 uppercase text-[10px] mb-1">Mensaje / Detalle</span>
          <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100 max-h-48 overflow-y-auto whitespace-pre-wrap">
            {consulta.mensaje || "Sin mensaje proporcionado."}
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-3 border-t border-slate-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Cerrar
          </button>
          {consulta.estado !== "completada" && onCompletar && (
            <button
              onClick={() => {
                onCompletar(consulta.id);
                onClose();
              }}
              className="px-4 py-2 bg-green-700 hover:bg-[#266360] text-white text-xs font-bold rounded-xl transition"
            >
              Completar solicitud
            </button>
          )}
        </div>
      </div>
    </div>
  );
}