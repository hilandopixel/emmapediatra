// app/api/verify-access/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es obligatorio.' }, 
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRef = adminDb.collection('usuarios_autorizados').doc(cleanEmail);
    const userSnap = await userRef.get();

    // 1. Si no existe el documento en la colección
    if (!userSnap.exists) {
      return NextResponse.json({ 
        permitido: false, 
        mensaje: 'Este correo electrónico no está registrado. Puedes solicitar el registro gratuito a continuación.' 
      }, { status: 200 }); // Devolvemos 200 para manejarlo amigablemente en el cliente
    }

    const userData = userSnap.data();

    // 2. Si existe pero NO está activo
    if (userData.activo !== true) {
      return NextResponse.json({ 
        permitido: false, 
        mensaje: 'Tu cuenta ya está registrada, pero aún no ha sido activada por un administrador.' 
      }, { status: 200 });
    }

    // 3. Usuario activo y permitido
    return NextResponse.json({ 
      permitido: true, 
      userData: {
        email: cleanEmail,
        nombre: userData.nombre || cleanEmail,
        roles: userData.roles || [],
      } 
    });

  } catch (error) {
    console.error('Error al verificar acceso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' }, 
      { status: 500 }
    );
  }
}