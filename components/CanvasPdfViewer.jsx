'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Estilos requeridos por react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configuración del worker CDN de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function CanvasPdfViewer({ pdfUrl }) {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  return (
    <div 
      className="flex flex-col items-center select-none overflow-auto max-h-[800px] border rounded-lg bg-gray-50 p-4 shadow-inner"
      onContextMenu={(e) => e.preventDefault()} // Deshabilita el clic derecho
    >
      {loading && <p className="text-gray-500 py-4">Cargando documento...</p>}

      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading=""
        error={<p className="text-red-500 py-4">No se pudo cargar el archivo PDF.</p>}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <div key={`page_${index + 1}`} className="mb-4 shadow-md">
            <Page 
              pageNumber={index + 1} 
              renderTextLayer={false}        // Oculta selección de texto
              renderAnnotationLayer={false}  // Oculta enlaces
              width={600}                    // Ancho renderizado en px
            />
          </div>
        ))}
      </Document>
    </div>
  );
}