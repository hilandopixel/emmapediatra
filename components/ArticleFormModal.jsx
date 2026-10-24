// components/ArticleFormModal.jsx
'use client';

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

// Función helper para convertir un texto a formato Slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export default function ArticleFormModal({ articleToEdit, onClose, onSubmit }) {
  const isEditing = Boolean(articleToEdit);

  const [title, setTitle] = useState(articleToEdit?.title || "");
  const [slug, setSlug] = useState(articleToEdit?.slug || "");
  const [isSlugCustomized, setIsSlugCustomized] = useState(isEditing); // Si edita, mantiene el slug existente
  
  const [content, setContent] = useState(articleToEdit?.content || "");
  const [selectedCategories, setSelectedCategories] = useState(articleToEdit?.categoryIds || []);
  const [coverImageUrl, setCoverImageUrl] = useState(articleToEdit?.coverImageUrl || "");
  const [pdfUrl, setPdfUrl] = useState(articleToEdit?.pdfUrl || "");

  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  // Cargar categorías desde Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const docs = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          name: docSnap.data().name || docSnap.id,
        }));
        setCategories(docs);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };
    fetchCategories();
  }, []);

  // Manejar cambio en el título y auto-generar el slug si no ha sido personalizado
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    if (!isSlugCustomized) {
      setSlug(generateSlug(newTitle));
    }
  };

  // Manejar cambio directo en el campo Slug
  const handleSlugChange = (e) => {
    setIsSlugCustomized(true);
    setSlug(generateSlug(e.target.value));
  };

  // Helper para subir archivos a Vercel Blob
  const uploadToVercelBlob = async (file) => {
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: "POST",
      body: file,
    });

    if (!response.ok) {
      throw new Error("Error al subir el archivo a Vercel Blob");
    }

    const blobData = await response.json();
    return blobData.url;
  };

  const handleCategoryToggle = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = coverImageUrl;
      let finalPdfUrl = pdfUrl;

      // 1. Subir nueva imagen si fue seleccionada
      if (imageFile) {
        setUploadStatus("Subiendo imagen...");
        finalImageUrl = await uploadToVercelBlob(imageFile);
      }

      // 2. Subir nuevo PDF si fue seleccionado
      if (pdfFile) {
        setUploadStatus("Subiendo PDF...");
        finalPdfUrl = await uploadToVercelBlob(pdfFile);
      }

      setUploadStatus("Guardando artículo...");

      // 3. Garantizar que el slug esté limpio antes de guardar
      const finalSlug = generateSlug(slug || title);

      const formData = {
        id: articleToEdit?.id,
        title: title.trim(),
        slug: finalSlug,
        content,
        categoryIds: selectedCategories,
        coverImageUrl: finalImageUrl,
        pdfUrl: finalPdfUrl,
      };

      await onSubmit(formData, isEditing);
    } catch (err) {
      console.error("Error al procesar el formulario de artículo:", err);
      alert("Hubo un error al subir los archivos o guardar el artículo.");
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  return (
    <div className="mb-8 bg-white p-8 rounded-2xl shadow-md border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-secondary-custom">
          {isEditing ? `Editando artículo: ${articleToEdit.title}` : "Crear nuevo artículo"}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título y Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Título del Artículo *</label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              required
              placeholder="Ej: Guía completa de nutrición"
              className="w-full border rounded-lg p-3 text-slate-700 bg-white"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">URL / Slug *</label>
              {isSlugCustomized && !isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSlugCustomized(false);
                    setSlug(generateSlug(title));
                  }}
                  className="text-[11px] text-primary-custom hover:underline font-semibold"
                >
                  Regenerar desde título
                </button>
              )}
            </div>
            <div className="flex items-center border rounded-lg overflow-hidden bg-white">
              <span className="bg-slate-100 text-slate-500 text-xs px-3 py-3 border-r select-none">
                /blog/
              </span>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                required
                placeholder="guia-completa-de-nutricion"
                className="w-full p-3 text-slate-700 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="p-4 bg-slate-50 rounded-xl space-y-2">
          <label className="block text-sm font-bold text-slate-700 mb-1">Categorías asociadas:</label>
          {categories.length === 0 ? (
            <p className="text-xs text-slate-500">No hay categorías registradas en Firestore.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="w-4 h-4 text-primary-custom rounded"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Archivos (Imagen y PDF) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Imagen de Portada</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 border rounded-lg p-2.5 bg-white"
            />
            {coverImageUrl && !imageFile && (
              <p className="text-[11px] text-green-700 mt-1 truncate">Imagen actual: {coverImageUrl}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Archivo PDF Adjunto</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 border rounded-lg p-2.5 bg-white"
            />
            {pdfUrl && !pdfFile && (
              <p className="text-[11px] text-green-700 mt-1 truncate">PDF actual: {pdfUrl}</p>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Contenido del Artículo</label>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe aquí el texto del artículo..."
            className="w-full border rounded-lg p-3 text-slate-700 bg-white"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary-custom hover:bg-[#266360] text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
          >
            {loading ? (uploadStatus || "Guardando...") : (isEditing ? "Actualizar artículo" : "Publicar artículo")}
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