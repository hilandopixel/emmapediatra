// app/api/admin/get-page-default-json/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    if (!pageId) {
      return NextResponse.json({ error: 'Se requiere el ID de la página' }, { status: 400 });
    }

    // Ruta física a la carpeta de la página dentro de app/[lang]/[pageId]/data.json
    const filePath = path.join(process.cwd(), 'app', '[lang]', pageId, 'data.json');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `No se encontró el archivo data.json en la ruta: app/[lang]/${pageId}/data.json` },
        { status: 404 }
      );
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContents);

    return NextResponse.json({ success: true, data: jsonData });
  } catch (error) {
    console.error('Error leyendo data.json local:', error);
    return NextResponse.json({ error: 'Error al leer el archivo de configuración local' }, { status: 500 });
  }
}