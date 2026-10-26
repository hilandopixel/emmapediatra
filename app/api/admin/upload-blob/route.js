// app/api/upload/route.js
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    // 1. Extraer el token de autorización de la cabecera
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado. Token no proporcionado." }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    // 2. Verificar el ID Token con Firebase Admin SDK
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (tokenErr) {
      console.error("Token de autenticación inválido:", tokenErr);
      return NextResponse.json({ error: "Sesión inválida o expirada." }, { status: 401 });
    }

    const adminEmail = decodedToken.email?.toLowerCase();
    if (!adminEmail) {
      return NextResponse.json({ error: "Token no válido." }, { status: 401 });
    }

    // 3. Verificar en Firestore que el usuario esté activo y tenga rol de admin
    const adminRef = adminDb.collection("usuarios_autorizados").doc(adminEmail);
    const adminSnap = await adminRef.get();

    if (!adminSnap.exists) {
      return NextResponse.json({ error: "Acceso denegado. Registro no encontrado." }, { status: 403 });
    }

    const adminData = adminSnap.data();
    const roles = adminData.roles || [];
    const esAdminValido = adminData.activo === true && (
      roles.includes("administrador_global") || 
      roles.includes("administrador") ||
      adminData.permisos?.includes("gestionar_solicitudes") ||
      adminData.esAdmin === true
    );

    if (!esAdminValido) {
      return NextResponse.json({ error: "Acceso denegado. Se requieren permisos de administrador." }, { status: 403 });
    }

    // 4. Procesar la subida del archivo a Vercel Blob
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