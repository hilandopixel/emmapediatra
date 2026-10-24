// components/PdfViewerWrapper.jsx
'use client';

import dynamic from 'next/dynamic';

const CanvasPdfViewer = dynamic(() => import('@/components/CanvasPdfViewer'), {
  ssr: false,
  loading: () => <p className="text-center py-4 text-slate-500 text-xs">Cargando visor...</p>,
});

export default function PdfViewerWrapper({ pdfUrl }) {
  return <CanvasPdfViewer pdfUrl={pdfUrl} />;
}