{/* Modal o Vista del Histórico de Accesos */}
<div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 mt-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-bold text-slate-800">📋 Histórico de Accesos</h3>
    <button 
      onClick={fetchHistorialAccesos} 
      className="text-xs text-primary-custom hover:underline font-semibold"
    >
      🔄 Actualizar historial
    </button>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse text-sm">
      <thead>
        <tr className="bg-slate-100 text-slate-700 uppercase text-xs">
          <th className="p-3">Fecha y Hora</th>
          <th className="p-3">Usuario (Email)</th>
          <th className="p-3">IP</th>
          <th className="p-3">Dispositivo</th>
          <th className="p-3">Sistema Operativo</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-600">
        {historialAccesos.map((log) => (
          <tr key={log.id} className="hover:bg-slate-50">
            <td className="p-3 whitespace-nowrap text-xs text-slate-500">
              {log.fecha?.toDate ? log.fecha.toDate().toLocaleString() : 'Reciente'}
            </td>
            <td className="p-3 font-semibold text-slate-800">{log.email}</td>
            <td className="p-3 font-mono text-xs">{log.ip}</td>
            <td className="p-3">
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                log.dispositivo === 'Móvil' 
                  ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {log.dispositivo === 'Móvil' ? '📱 Móvil' : '💻 Escritorio'}
              </span>
            </td>
            <td className="p-3 text-xs">{log.detallesSO}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>