// components/PdfViewerWrapper.jsx
'use client';

import dynamic from 'next/dynamic';

// Aquí sí está permitido ssr: false porque es un Client Component
const CanvasPdfViewer = dynamic(() => import('@/components/CanvasPdfViewer'), {
  ssr: false,
  loading: () => <p className="text-center py-4 text-gray-500">Cargando visor...</p>,
});

export default function PdfViewerWrapper({ pdfUrl }) {
  return <CanvasPdfViewer pdfUrl={pdfUrl} />;
}