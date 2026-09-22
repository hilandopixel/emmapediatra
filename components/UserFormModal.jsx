"use client";

import { useState } from "react";
import { serverTimestamp } from "firebase/firestore";

const ROLES_DISPONIBLES = [
  { id: "administrador_global", label: "Administrador Global", restricted: true }, // Solo para Global
  { id: "administrador", label: "Administrador", restricted: false },
  { id: "paciente", label: "Paciente", restricted: false }
];

export default function UserFormModal({ userToEdit, isGlobalAdmin, onClose, onSubmit }) {
  const isEditing = Boolean(userToEdit);

  const [nombre, setNombre] = useState(userToEdit?.nombre || "");
  const [email, setEmail] = useState(userToEdit?.id || "");
  const [activo, setActivo] = useState(isEditing ? (userToEdit.activo !== false) : false);
  const [rolesSeleccionados, setRolesSeleccionados] = useState(userToEdit?.roles || ["paciente"]);
  
  // Convertimos los permisos de array a string plano (ej: "gestionar_solicitudes, borrar_usuarios")
  const [permisos, setPermisos] = useState(userToEdit?.permisos ? userToEdit.permisos.join(", ") : "");
  
  const [recursosPermitidos, setRecursosPermitidos] = useState(userToEdit?.recursosPermitidos ? userToEdit.recursosPermitidos.join(", ") : "");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (roleId) => {
    // Si no es admin global e intenta tocar el rol de admin global, lo bloqueamos
    if (roleId === "administrador_global" && !isGlobalAdmin) return;

    if (rolesSeleccionados.includes(roleId)) {
      setRolesSeleccionados(rolesSeleccionados.filter(r => r !== roleId));
    } else {
      setRolesSeleccionados([...rolesSeleccionados, roleId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let permisosArray = permisos ? permisos.split(",").map(p => p.trim()).filter(Boolean) : [];

    // SEGURIDAD EXTRA EN EL CLIENTE: Si el usuario actual NO es global, nos aseguramos por fuerza 
    // de que no se cuele el permiso "borrar_usuarios" aunque lo escriban o manipulen.
    if (!isGlobalAdmin) {
      permisosArray = permisosArray.filter(p => p !== "borrar_usuarios");
    }

    const formData = {
      email: email.trim().toLowerCase(),
      nombre: nombre.trim(),
      activo,
      roles: rolesSeleccionados,
      permisos: permisosArray,
      recursosPermitidos: recursosPermitidos ? recursosPermitidos.split(",").map(r => r.trim()).filter(Boolean) : [],
    };

    await onSubmit(formData, isEditing);
    setLoading(false);
  };

  return (
    <div className="mb-8 bg-white p-8 rounded-2xl shadow-md border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-primary-custom">
          {isEditing ? `Editando usuario: ${userToEdit.id}` : "Dar de alta nuevo usuario"}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Correo electrónico (ID)</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={isEditing}
              placeholder="correo@example.com" 
              className="w-full border rounded-lg p-3 text-slate-700 bg-white disabled:bg-slate-100" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Nombre y Apellidos</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
              placeholder="Nombre completo" 
              className="w-full border rounded-lg p-3 text-slate-700 bg-white" 
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <input 
            type="checkbox" 
            id="activoCheck"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="w-4 h-4 text-primary-custom rounded" 
          />
          <label htmlFor="activoCheck" className="text-sm font-medium text-slate-700">Usuario Activo (Permite acceso)</label>
        </div>

        {/* Roles Múltiples */}
        <div className="p-4 bg-slate-50 rounded-xl space-y-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">Roles asignados:</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ROLES_DISPONIBLES.map((rol) => {
              // Si es administrador estándar y este rol es restringido (administrador_global), no lo mostramos o lo deshabilitamos
              const isDisabled = rol.restricted && !isGlobalAdmin;
              if (isDisabled && !isGlobalAdmin) return null; // Ocultamos la opción por completo si no es global

              return (
                <div key={rol.id} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id={`form-rol-${rol.id}`}
                    checked={rolesSeleccionados.includes(rol.id)}
                    onChange={() => handleRoleChange(rol.id)}
                    disabled={isDisabled}
                    className="w-4 h-4 text-primary-custom rounded disabled:opacity-50"
                  />
                  <label htmlFor={`form-rol-${rol.id}`} className={`text-sm font-medium ${isDisabled ? "text-slate-400" : "text-slate-700"}`}>
                    {rol.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Permisos específicos (separados por comas)</label>
          <input 
            type="text" 
            value={permisos} 
            onChange={(e) => setPermisos(e.target.value)} 
            placeholder="ej: gestionar_solicitudes" 
            className="w-full border rounded-lg p-3 text-slate-700 bg-white text-sm" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Recursos / Materiales permitidos (IDs separados por comas)</label>
          <input 
            type="text" 
            value={recursosPermitidos} 
            onChange={(e) => setRecursosPermitidos(e.target.value)} 
            placeholder="ej: taller-tca, guia-nutricion" 
            className="w-full border rounded-lg p-3 text-slate-700 bg-white text-sm" 
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-3 bg-primary-custom hover:bg-[#266360] text-white font-bold rounded-xl text-sm transition"
          >
            {loading ? "Guardando..." : (isEditing ? "Actualizar usuario" : "Crear usuario")}
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}