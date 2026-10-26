// components/ArticleFormModal.jsx
'use client';

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig"; // 1. Importar auth de Firebase
import * as pdfjs from "pdfjs-dist";

// Worker de CDN para pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const generatePdfThumbnailBase64 = async (pdfFile, quality = 0.6) => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 1.0 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport }).promise;

  return canvas.toDataURL("image/webp", quality);
};

export default function ArticleFormModal({ articleToEdit, onClose, onSubmit }) {
  const isEditing = Boolean(articleToEdit);

  const [title, setTitle] = useState(articleToEdit?.title || "");
  const [slug, setSlug] = useState(articleToEdit?.slug || "");
  const [isSlugCustomized, setIsSlugCustomized] = useState(isEditing);

  const [content, setContent] = useState(articleToEdit?.content || "");
  const [selectedCategories, setSelectedCategories] = useState(articleToEdit?.categoryIds || []);
  const [coverImageUrl, setCoverImageUrl] = useState(articleToEdit?.coverImageUrl || "");
  const [pdfUrl, setPdfUrl] = useState(articleToEdit?.pdfUrl || "");

  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

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

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isSlugCustomized) setSlug(generateSlug(newTitle));
  };

  const handleSlugChange = (e) => {
    setIsSlugCustomized(true);
    setSlug(generateSlug(e.target.value));
  };

  // 2. Función actualizada para enviar el ID Token de Firebase en la cabecera Authorization
  const uploadToVercelBlob = async (file) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No hay una sesión activa para realizar la subida de archivos.");
    }

    const token = await user.getIdToken();

    const response = await fetch(`/api/admin/upload-blob?filename=${encodeURIComponent(file.name)}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`, // 👈 Cabecera de autenticación con el Bearer token
      },
      body: file,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Error al subir el archivo a Vercel Blob");
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

      if (pdfFile) {
        setUploadStatus("Subiendo archivo PDF...");
        finalPdfUrl = await uploadToVercelBlob(pdfFile);

        if (!imageFile && !coverImageUrl) {
          setUploadStatus("Generando miniatura Base64...");
          finalImageUrl = await generatePdfThumbnailBase64(pdfFile, 0.6);
        }
      }

      if (imageFile) {
        setUploadStatus("Procesando imagen de portada...");
        const reader = new FileReader();
        finalImageUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageFile);
        });
      }

      setUploadStatus("Guardando documento...");

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
      console.error("Error al procesar el formulario:", err);
      alert(err.message || "Hubo un error al generar la miniatura o guardar el artículo.");
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Imagen de Portada (Opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 border rounded-lg p-2.5 bg-white"
            />
            {coverImageUrl && !imageFile && (
              <p className="text-[11px] text-green-700 mt-1 truncate">Imagen en Base64 cargada</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              * Si adjuntas un PDF, la primera página se guardará automáticamente como miniatura Base64.
            </p>
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

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">
            Contenido del Artículo <span className="text-xs text-slate-400 font-normal">(opcional)</span>
          </label>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe aquí el texto del artículo (opcional)..."
            className="w-full border rounded-lg p-3 text-slate-700 bg-white"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary-custom hover:bg-[#266360] text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
          >
            {loading ? (uploadStatus || "Procesando...") : (isEditing ? "Actualizar artículo" : "Publicar artículo")}
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