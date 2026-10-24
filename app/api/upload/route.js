// app/api/upload/route.js
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename || !request.body) {
      return NextResponse.json(
        { error: 'Falta el nombre del archivo o el cuerpo de la petición' },
        { status: 400 }
      );
    }

    // Subida directa del stream a Vercel Blob
    const blob = await put(filename, request.body, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error interno en Vercel Blob:', error);
    return NextResponse.json(
      { error: error.message || 'Error en el servidor' },
      { status: 500 }
    );
  }
}