// components/ProtectedImage.jsx
'use client';

export default function ProtectedImage({ src, alt }) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-auto rounded-2xl mb-6 select-none shadow-sm"
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}