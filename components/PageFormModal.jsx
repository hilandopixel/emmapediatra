// components/PageFormModal.jsx
'use client';

import { useState } from 'react';

const IDIOMAS = [
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'it', label: '🇮🇹 Italiano' },
];

export default function PageFormModal({ pageToEdit, onClose, onSubmit }) {
  const [langActive, setLangActive] = useState('es');
  const [pageId, setPageId] = useState(pageToEdit?.id || '');
  const [loadingDefault, setLoadingDefault] = useState(false);
  
  // Estructura base
  const [seo, setSeo] = useState(pageToEdit?.seo || {
    es: { title: '', description: '', keywords: '' },
    en: { title: '', description: '', keywords: '' },
    it: { title: '', description: '', keywords: '' },
  });

  const [globalImage, setGlobalImage] = useState(pageToEdit?.content?.image || '');

  const [content, setContent] = useState(pageToEdit?.content || {
    image: '',
    es: { sections: {} },
    en: { sections: {} },
    it: { sections: {} },
  });

  // --- CARGAR CONFIGURACIÓN POR DEFECTO DESDE EL DATA.JSON LOCAL ---
  const handleLoadDefaultConfig = async () => {
    if (!pageId.trim()) {
      alert('Introduce primero el ID / Ruta de la página (ej: dudas-frecuentes)');
      return;
    }

    if (!confirm(`¿Estás seguro de cargar la configuración por defecto de "app/[lang]/${pageId}/data.json"? Se sobreescribirán los datos actuales en pantalla.`)) {
      return;
    }

    setLoadingDefault(true);
    try {
      const res = await fetch(`/api/admin/get-page-default-json?pageId=${encodeURIComponent(pageId.trim())}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Error al obtener el archivo local');
      }

      const defaultData = result.data;

      // Cargar SEO
      if (defaultData.seo) {
        setSeo({
          es: defaultData.seo.es || { title: '', description: '', keywords: '' },
          en: defaultData.seo.en || { title: '', description: '', keywords: '' },
          it: defaultData.seo.it || { title: '', description: '', keywords: '' },
        });
      }

      // Cargar Contenido e Imagen Banner
      if (defaultData.content) {
        setGlobalImage(defaultData.content.image || '');
        setContent(defaultData.content);
      }

      alert('¡Configuración por defecto cargada con éxito en pantalla! Recuerda hacer clic en "Guardar Cambios" para sincronizarla.');
    } catch (err) {
      console.error('Error al cargar datos por defecto:', err);
      alert(err.message || 'Error al conectar con la API');
    } 
    setLoadingDefault(false);
  };

  // Manejar cambio en SEO
  const handleSeoChange = (lang, field, value) => {
    setSeo(prev => ({
      ...prev,
      [lang]: {
        ...(prev[lang] || {}),
        [field]: value
      }
    }));
  };

  // Obtener secciones de un idioma específico
  const getSectionsForLang = (lang) => {
    const secObj = content[lang]?.sections || {};
    return Object.entries(secObj).map(([key, value]) => ({ key, ...value }));
  };

  // Añadir nueva sección al idioma activo
  const addSection = () => {
    const currentSections = getSectionsForLang(langActive);
    const nextKey = String(currentSections.length + 1);
    const newSecId = `seccion-${Date.now().toString().slice(-4)}`;

    setContent(prev => ({
      ...prev,
      [langActive]: {
        ...prev[langActive],
        sections: {
          ...(prev[langActive]?.sections || {}),
          [nextKey]: {
            id: newSecId,
            content: [
              { title: 'Nueva Sección', text: '' }
            ]
          }
        }
      }
    }));
  };

  // Eliminar sección
  const removeSection = (secKey) => {
    setContent(prev => {
      const newSecs = { ...(prev[langActive]?.sections || {}) };
      delete newSecs[secKey];
      return {
        ...prev,
        [langActive]: {
          ...prev[langActive],
          sections: newSecs
        }
      };
    });
  };

  // Cambiar ID de sección
  const handleSectionIdChange = (secKey, newId) => {
    setContent(prev => ({
      ...prev,
      [langActive]: {
        ...prev[langActive],
        sections: {
          ...(prev[langActive]?.sections || {}),
          [secKey]: {
            ...(prev[langActive]?.sections?.[secKey] || {}),
            id: newId
          }
        }
      }
    }));
  };

  // Añadir bloque de contenido
  const addContentBlock = (secKey) => {
    setContent(prev => {
      const currentSec = prev[langActive]?.sections?.[secKey] || { content: [] };
      const updatedContent = Array.isArray(currentSec.content) ? [...currentSec.content] : [];
      updatedContent.push({ title: '', subtitle: '', text: '', htmlEmbbeded: '', image: '', buttonText: '', buttonLink: '' });

      return {
        ...prev,
        [langActive]: {
          ...prev[langActive],
          sections: {
            ...(prev[langActive]?.sections || {}),
            [secKey]: {
              ...currentSec,
              content: updatedContent
            }
          }
        }
      };
    });
  };

  // Modificar campo de bloque
  const handleContentBlockChange = (secKey, index, field, value) => {
    setContent(prev => {
      const currentSec = prev[langActive]?.sections?.[secKey] || { content: [] };
      const updatedContent = Array.isArray(currentSec.content) ? [...currentSec.content] : [];
      updatedContent[index] = { ...updatedContent[index], [field]: value };

      return {
        ...prev,
        [langActive]: {
          ...prev[langActive],
          sections: {
            ...(prev[langActive]?.sections || {}),
            [secKey]: {
              ...currentSec,
              content: updatedContent
            }
          }
        }
      };
    });
  };

  // Eliminar bloque
  const removeContentBlock = (secKey, index) => {
    setContent(prev => {
      const currentSec = prev[langActive]?.sections?.[secKey] || { content: [] };
      const updatedContent = (currentSec.content || []).filter((_, i) => i !== index);

      return {
        ...prev,
        [langActive]: {
          ...prev[langActive],
          sections: {
            ...(prev[langActive]?.sections || {}),
            [secKey]: {
              ...currentSec,
              content: updatedContent
            }
          }
        }
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pageId.trim()) return alert('Introduce un identificador / Slug para la página');

    const finalContent = {
      ...content,
      image: globalImage
    };

    onSubmit({
      id: pageId.trim().toLowerCase(),
      seo,
      content: finalContent
    }, !!pageToEdit);
  };

  const sectionsCurrentLang = getSectionsForLang(langActive);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h3 className="text-xl font-bold text-primary-custom">
            {pageToEdit ? `Editar Página: ${pageToEdit.id}` : '📄 Añadir / Configurar Nueva Página'}
          </h3>
          <p className="text-xs text-slate-400">
            Página asignada a la ruta: <code className="font-mono text-slate-600">app/[lang]/{pageId || '...'}/data.json</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* BOTÓN CARGAR CONFIGURACIÓN POR DEFECTO */}
          <button
            type="button"
            onClick={handleLoadDefaultConfig}
            disabled={loadingDefault || !pageId.trim()}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
            title="Carga el archivo data.json local de la carpeta de esta página"
          >
            {loadingDefault ? '⏳ Leyendo data.json...' : '📁 Cargar data.json por defecto'}
          </button>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg px-2">✕</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificador de página */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
            ID de la Página / Nombre de Carpeta (ej: "dudas-frecuentes", "pide-cita-2")
          </label>
          <input
            type="text"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            disabled={!!pageToEdit}
            placeholder="dudas-frecuentes"
            required
            className="w-full border rounded-xl p-3 text-sm text-slate-800 bg-slate-50 focus:bg-white border-slate-200 font-mono"
          />
        </div>

        {/* Banner Global */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
            URL Imagen Banner Superior (Global)
          </label>
          <input
            type="text"
            value={globalImage}
            onChange={(e) => setGlobalImage(e.target.value)}
            placeholder="/assets/dra-emma-lopez-preguntas.png"
            className="w-full border rounded-xl p-3 text-sm text-slate-800 bg-white border-slate-200"
          />
        </div>

        {/* Pestañas de Idioma */}
        <div className="flex border-b border-slate-200 gap-2 pt-2">
          {IDIOMAS.map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLangActive(lang.code)}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition ${
                langActive === lang.code 
                  ? 'bg-primary-custom text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Sección SEO */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-500">Configuración SEO ({langActive.toUpperCase()})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Título SEO</label>
              <input
                type="text"
                value={seo[langActive]?.title || ''}
                onChange={(e) => handleSeoChange(langActive, 'title', e.target.value)}
                className="w-full border rounded-lg p-2 text-xs text-slate-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Palabras clave (Keywords)</label>
              <input
                type="text"
                value={seo[langActive]?.keywords || ''}
                onChange={(e) => handleSeoChange(langActive, 'keywords', e.target.value)}
                className="w-full border rounded-lg p-2 text-xs text-slate-800 bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-600 mb-1">Descripción SEO</label>
              <textarea
                rows={2}
                value={seo[langActive]?.description || ''}
                onChange={(e) => handleSeoChange(langActive, 'description', e.target.value)}
                className="w-full border rounded-lg p-2 text-xs text-slate-800 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Editor de Secciones */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-800">Secciones Dinámicas ({langActive.toUpperCase()})</h4>
            <button
              type="button"
              onClick={addSection}
              className="px-3 py-1.5 bg-primary-custom text-white font-bold text-xs rounded-lg hover:bg-[#266360] transition"
            >
              + Añadir Sección
            </button>
          </div>

          {sectionsCurrentLang.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 rounded-xl border border-dashed">
              No hay secciones en este idioma. Haz clic en "Cargar data.json por defecto" o "+ Añadir Sección".
            </p>
          ) : (
            sectionsCurrentLang.map((sec) => (
              <div key={sec.key} className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm space-y-4">
                <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded-lg">
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <span className="text-xs font-bold text-slate-500 uppercase">Sección #{sec.key} ID:</span>
                    <input
                      type="text"
                      value={sec.id || ''}
                      onChange={(e) => handleSectionIdChange(sec.key, e.target.value)}
                      placeholder="id-de-la-seccion"
                      className="border rounded px-2 py-1 text-xs font-mono text-slate-800 bg-white w-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSection(sec.key)}
                    className="text-xs font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded transition"
                  >
                    🗑️ Eliminar Sección
                  </button>
                </div>

                {/* Bloques de Contenido */}
                <div className="pl-2 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600">Bloques de Contenido ({sec.content?.length || 0})</span>
                    <button
                      type="button"
                      onClick={() => addContentBlock(sec.key)}
                      className="text-xs text-primary-custom font-bold hover:underline"
                    >
                      + Bloque de Contenido
                    </button>
                  </div>

                  {(sec.content || []).map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                      <div className="flex justify-between items-center border-b pb-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Bloque #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeContentBlock(sec.key, idx)}
                          className="text-red-500 text-xs hover:underline"
                        >
                          Eliminar bloque
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-500 font-medium">Título (Soporta HTML)</label>
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => handleContentBlockChange(sec.key, idx, 'title', e.target.value)}
                            className="w-full border rounded p-1.5 text-xs text-slate-800 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 font-medium">Subtítulo (Soporta HTML)</label>
                          <input
                            type="text"
                            value={item.subtitle || ''}
                            onChange={(e) => handleContentBlockChange(sec.key, idx, 'subtitle', e.target.value)}
                            className="w-full border rounded p-1.5 text-xs text-slate-800 bg-white"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[11px] text-slate-500 font-medium">Texto Principal (Soporta HTML)</label>
                          <textarea
                            rows={3}
                            value={item.text || ''}
                            onChange={(e) => handleContentBlockChange(sec.key, idx, 'text', e.target.value)}
                            className="w-full border rounded p-1.5 text-xs text-slate-800 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 font-medium">URL Imagen del bloque</label>
                          <input
                            type="text"
                            value={item.image || ''}
                            onChange={(e) => handleContentBlockChange(sec.key, idx, 'image', e.target.value)}
                            className="w-full border rounded p-1.5 text-xs text-slate-800 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 font-medium">HTML Incrustado / Embedded</label>
                          <input
                            type="text"
                            value={item.htmlEmbbeded || ''}
                            onChange={(e) => handleContentBlockChange(sec.key, idx, 'htmlEmbbeded', e.target.value)}
                            placeholder="<iframe>...</iframe>"
                            className="w-full border rounded p-1.5 text-xs text-slate-800 bg-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 font-medium">Texto Botón</label>
                          <input
                            type="text"
                            value={item.buttonText || ''}
                            onChange={(e) => handleContentBlockChange(sec.key, idx, 'buttonText', e.target.value)}
                            className="w-full border rounded p-1.5 text-xs text-slate-800 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 font-medium">Enlace Botón (Link)</label>
                          <input
                            type="text"
                            value={item.buttonLink || ''}
                            onChange={(e) => handleContentBlockChange(sec.key, idx, 'buttonLink', e.target.value)}
                            className="w-full border rounded p-1.5 text-xs text-slate-800 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-primary-custom hover:bg-[#266360] text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            💾 Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}