// app/api/verify-access/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

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

      // 1. Obtener la dirección IP desde las cabeceras HTTP
      const forwardedFor = request.headers.get('x-forwarded-for');
      const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (request.headers.get('x-real-ip') || 'IP desconocida');

      // 2. Obtener y parsear el User-Agent (Tipo de dispositivo)
      const userAgent = request.headers.get('user-agent') || '';
      let dispositivo = 'Escritorio (PC/Mac)';

      if (/mobile/i.test(userAgent)) {
        dispositivo = 'Móvil';
      } else if (/ipad|tablet/i.test(userAgent)) {
        dispositivo = 'Tablet';
      }

      // Detectar sistema operativo/navegador simple opcional
      let detallesSO = 'Desconocido';
      if (/android/i.test(userAgent)) detallesSO = 'Android';
      else if (/iphone|ipad|ipod/i.test(userAgent)) detallesSO = 'iOS';
      else if (/windows/i.test(userAgent)) detallesSO = 'Windows';
      else if (/macintosh|mac os x/i.test(userAgent)) detallesSO = 'macOS';
      else if (/linux/i.test(userAgent)) detallesSO = 'Linux';

      const nuevoAcceso = {
            fecha: new Date().toISOString(), // Guardamos string ISO para fácil manejo dentro del array
            ip: ip || 'Desconocida',
            dispositivo: dispositivo || 'Desconocido',
            detallesSO: detallesSO || 'Desconocido',
            userAgent: userAgent || '',
          };

          const docRef = adminDb.collection('historial_accesos').doc(cleanEmail);

          // 3. Actualización atómica en el documento del usuario
          await docRef.set({
            email: cleanEmail,
            ultimoAcceso: FieldValue.serverTimestamp(),
            totalAccesos: FieldValue.increment(1),
            accesos: FieldValue.arrayUnion(nuevoAcceso)
          }, { merge: true });


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