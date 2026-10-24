// components/CanvasPdfViewer.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function CanvasPdfViewer({ pdfUrl }) {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  // Escuchar y medir el ancho del contenedor para adaptar el PDF
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Restamos el padding interno (32px si hay p-4) para que no desborde
        const width = containerRef.current.clientWidth - 32;
        setContainerWidth(width > 0 ? width : 300);
      }
    };

    updateWidth(); // Medida inicial
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  return (
    <div 
      ref={containerRef}
      className="w-full flex flex-col items-center select-none overflow-auto max-h-[800px] border border-slate-200 rounded-2xl bg-slate-50 p-4 shadow-inner"
      onContextMenu={(e) => e.preventDefault()}
    >
      {loading && <p className="text-slate-500 text-xs py-4">Cargando documento...</p>}

      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading=""
        error={<p className="text-red-500 text-xs py-4">No se pudo cargar el archivo PDF.</p>}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <div key={`page_${index + 1}`} className="mb-4 shadow-md rounded-lg overflow-hidden">
            <Page 
              pageNumber={index + 1} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={containerWidth || 600} // Se adapta al ancho del contenedor
            />
          </div>
        ))}
      </Document>
    </div>
  );
}