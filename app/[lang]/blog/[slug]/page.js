// app/blog/[slug]/page.jsx
'use client';

import { useState, useEffect, use } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import AuthSimpleForm from '@/components/AuthSimpleForm';
import PdfViewerWrapper from '@/components/PdfViewerWrapper';
import ProtectedImage from '@/components/ProtectedImage';

export default function BlogPostPage({ params }) {
  // Desempaquetar slug en Next.js 15+
  const { slug } = use(params);

  // Estados de verificación de sesión (vía localStorage)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  // Estados del recurso
  const [post, setPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // 1. Comprobar sesión guardada en localStorage sin mostrar parpadeos
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('areaPrivadaUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser) {
          setUserData(parsedUser);
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.error('Error al comprobar sesión guardada:', e);
      localStorage.removeItem('areaPrivadaUser');
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  // 2. Cargar únicamente el artículo solicitado por `slug` si el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPost = async () => {
      try {
        setLoadingPost(true);
        const q = query(collection(db, 'posts'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setNotFound(true);
        } else {
          setPost(querySnapshot.docs[0].data());
        }
      } catch (err) {
        console.error('Error al obtener el recurso del blog:', err);
        setNotFound(true);
      } finally {
        setLoadingPost(false);
      }
    };

    fetchPost();
  }, [slug, isAuthenticated]);

  const handleVerifySuccess = (user) => {
    const userToSave = user || { email: 'Usuario' };
    setUserData(userToSave);
    setIsAuthenticated(true);
    localStorage.setItem('areaPrivadaUser', JSON.stringify(userToSave));
  };

  const handleLogout = () => {
    localStorage.removeItem('areaPrivadaUser');
    setIsAuthenticated(false);
    setUserData(null);
    setPost(null);
  };

  // --------------------------------------------------------------------------
  // PASO A: Comprobando autenticación (evita que aparezca el formulario antes de tiempo)
  // --------------------------------------------------------------------------
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary-custom" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-semibold text-slate-500">Verificando acceso...</span>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // PASO B: Si NO está autenticado -> Formulario de login/registro
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <p className="text-center text-xs text-slate-500">
            Debes acceder para ver este recurso exclusivo.
          </p>
          <AuthSimpleForm onVerifySuccess={handleVerifySuccess} />
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // PASO C: Cargando recurso del post
  // --------------------------------------------------------------------------
  if (loadingPost) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary-custom text-sm font-medium">
          <svg className="animate-spin h-5 w-5 text-primary-custom" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Cargando artículo...</span>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // PASO D: Recurso no encontrado
  // --------------------------------------------------------------------------
  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border border-slate-100 text-center space-y-4">
          <h2 className="text-xl font-bold text-primary-custom">Recurso no encontrado</h2>
          <p className="text-slate-600 text-xs">
            El recurso que buscas no existe o ha sido eliminado.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // PASO E: AUTENTICADO -> Muestra el artículo del blog específico
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Cabecera superior con email y cerrar sesión */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <span className="text-xs text-slate-600">
            Acceso activo: <strong className="text-slate-800">{userData?.email || 'Verificado'}</strong>
          </span>
          <button
            onClick={handleLogout}
            type="button"
            className="text-xs text-red-600 font-bold hover:underline bg-red-50 px-2.5 py-1 rounded-lg transition"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Cuerpo del artículo */}
        <article className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-custom leading-snug">
            {post.title}
          </h1>

          {!post.pdfUrl && post.coverImageUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-100">
              <ProtectedImage src={post.coverImageUrl} alt={post.title} />
            </div>
          )}

          {post.content && (
            <div className="prose text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
              {post.content}
            </div>
          )}

          {post.pdfUrl && (
            <section className="pt-4 border-t border-slate-100">
              <PdfViewerWrapper pdfUrl={post.pdfUrl} />
            </section>
          )}
        </article>

      </div>
    </div>
  );
}