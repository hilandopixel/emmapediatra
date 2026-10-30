// app/api/verify-access/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'El correo electrónico es obligatorio.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Validar si el email existe en "usuarios_areaprivada"
    const activeUserSnap = await adminDb.collection('usuarios_areaprivada').doc(cleanEmail).get();

    if (activeUserSnap.exists) {
      return NextResponse.json({ 
        permitido: true, 
        userData: {
          email: cleanEmail,
        } 
      });
    }

    // 2. Si no está en "usuarios_areaprivada", comprobar si está pendiente en la lista de solicitudes
    const pendingUserSnap = await adminDb.collection('usuarios_areaprivada').doc(cleanEmail).get();

    if (pendingUserSnap.exists) {
      return NextResponse.json({ 
        permitido: false, 
        mensaje: 'Tu cuenta ya ha sido registrada, pero aún no ha sido activada por el administrador.' 
      }, { status: 200 });
    }

    // 3. Si no existe en ninguna colección
    return NextResponse.json({ 
      permitido: false, 
      mensaje: 'Este correo electrónico no está registrado. Solicita tu acceso gratuito a continuación.' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error al verificar acceso:', error);
    return NextResponse.json({ error: 'Error interno al comprobar el acceso.' }, { status: 500 });
  }
}