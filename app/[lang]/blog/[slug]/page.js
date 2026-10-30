// app/blog/[slug]/page.jsx
'use client';

import { useState, useEffect, use } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig';
import AuthSimpleForm from '@/components/AuthSimpleForm';
import PdfViewerWrapper from '@/components/PdfViewerWrapper';
import ProtectedImage from '@/components/ProtectedImage';

export default function BlogPostPage({ params }) {
  // En Next.js 15+, params es una promesa que se desempaqueta con React.use()
  const { slug } = use(params);

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [post, setPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // 1. Verificar autenticación y permisos de usuario activo
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        try {
          const userRef = doc(db, 'usuarios_autorizados', currentUser.email.toLowerCase());
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            setUserData({ activo: false, roles: [] });
          }
        } catch (err) {
          console.error('Error al verificar autorización:', err);
          setUserData({ activo: false, roles: [] });
        }
      } else {
        setUserData(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Cargar datos del post si el usuario está autenticado y activo
  useEffect(() => {
    if (!user || userData?.activo === false) return;

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
        console.error('Error al obtener el artículo:', err);
        setNotFound(true);
      } finally {
        setLoadingPost(false);
      }
    };

    fetchPost();
  }, [slug, user, userData]);

  // A. Estado de Carga Inicial
  if (loadingAuth) {
    return (
      <div className="text-center py-24 text-primary-custom font-medium">
        Verificando permisos de acceso...
      </div>
    );
  }

  // B. Si NO está logueado -> Formulario de Login / Registro
  if (!user) {
    return (
      <div className="py-16">
        <p className="text-center text-primary-custom mb-6 text-sm">
          Debes iniciar sesión con tu cuenta para ver este artículo del área privada.
        </p>
        <AuthSimpleForm />
      </div>
    );
  }

  // C. Si está logueado pero su cuenta está INACTIVA (pendiente de activación por el admin)
  if (userData && userData.activo === false) {
    return (
      <div className="max-w-lg mx-auto my-24 bg-white p-8 rounded-2xl shadow-md border border-slate-100 text-center space-y-6">
        <h2 className="text-2xl font-bold text-primary-custom">Cuenta pendiente de validación</h2>
        <p className="text-primary-custom leading-relaxed text-sm">
          Hola <strong className="text-primary-custom">{userData.nombre || user.email}</strong>, tu cuenta ha sido registrada pero <strong className="text-primary-custom">aún no ha sido activada</strong> por un administrador para leer artículos.
        </p>
        <button 
          onClick={() => signOut(auth)} 
          className="px-6 py-2.5 button-primary-custom text-xs font-bold rounded-xl transition"
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  // D. Carga del artículo en progreso
  if (loadingPost) {
    return (
      <div className="text-center py-24 text-primary-customfont-medium">
        Cargando artículo...
      </div>
    );
  }

  // E. Artículo no encontrado
  if (notFound || !post) {
    return (
      <div className="max-w-md mx-auto my-24 bg-white p-8 rounded-2xl shadow-md border border-slate-100 text-center space-y-4">
        <h2 className="text-xl font-bold text-primary-custom">Artículo no encontrado</h2>
        <p className="text-primary-custom text-sm">
          El artículo que buscas no existe o ha sido eliminado.
        </p>
      </div>
    );
  }

  // F. Usuario AUTENTICADO y ACTIVO -> Muestra el contenido del artículo
  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold text-primary-custom mb-4">{post.title}</h1>

      {!post.pdfUrl && post.coverImageUrl && (
        <ProtectedImage src={post.coverImageUrl} alt={post.title} />
      )}

      {post.content && (
        <div className="prose text-slate-700 leading-relaxed mb-8 whitespace-pre-wrap">
          {post.content}
        </div>
      )}

      {post.pdfUrl && (
        <section className="mt-8 border-t border-slate-100 pt-6">
          <PdfViewerWrapper pdfUrl={post.pdfUrl} />
        </section>
      )}
    </article>
  );
}