import { collection, getDocs, updateDoc, doc, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import PdfViewerWrapper from '@/components/PdfViewerWrapper';

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  // Consulta a Firestore
  const q = query(collection(db, 'posts'), where('slug', '==', slug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return <div className="p-8 text-center">Artículo no encontrado</div>;
  }

  const post = querySnapshot.docs[0].data();

  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      {post.coverImageUrl && (
        <img 
          src={post.coverImageUrl} 
          alt={post.title} 
          className="w-full h-auto rounded-lg mb-6 select-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      )}

      <div className="prose mb-8">{post.content}</div>

      {post.pdfUrl && (
        <section className="mt-8">
          {/* Se renderiza el wrapper cliente directamente */}
          <PdfViewerWrapper pdfUrl={post.pdfUrl} />
        </section>
      )}
    </article>
  );
}