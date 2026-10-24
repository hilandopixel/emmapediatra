// app/blog/[slug]/page.jsx
import { db } from '@/lib/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import PdfViewerWrapper from '@/components/PdfViewerWrapper';
import ProtectedImage from '@/components/ProtectedImage'; // 1. Importar el componente cliente

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  const q = query(collection(db, 'posts'), where('slug', '==', slug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return <div className="p-8 text-center text-primary-custom">Artículo no encontrado</div>;
  }

  const post = querySnapshot.docs[0].data();

  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold text-primary-custom mb-4">{post.title}</h1>

      {/* 2. Usar el componente de imagen protegida en lugar de <img> con event handlers */}
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