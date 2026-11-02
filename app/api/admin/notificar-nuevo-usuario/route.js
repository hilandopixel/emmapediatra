// app/api/notificar-registro/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { email, nombre, telefono, origenEncuentro, aceptaPolitica } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'El correo electrónico es obligatorio.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Guardar o actualizar la solicitud en Firestore en la colección "usuarios_autorizados"
    const userRef = adminDb.collection('usuarios_autorizados').doc(cleanEmail);
    const existingDoc = await userRef.get();

    if (!existingDoc.exists) {
      await userRef.set({
        email: cleanEmail,
        nombre: nombre || '',
        telefono: telefono || '',
        origenEncuentro: origenEncuentro || '',
        aceptaPolitica: true,
        activo: false,
        roles: [],
        fechaSolicitud: new Date().toISOString(),
      });
    }

    // 2. Enviar notificación por correo al administrador mediante Nodemailer
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ionos.es',
        port: 465, //Number(process.env.SMTP_PORT) || 587,
        secure: true, // false para puerto 587 (usa STARTTLS); true para puerto 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        // Desactivar rechazo de certificados solo si estás en localhost
        tls: {
          rejectUnauthorized: false
        }
      });

    const mailOptions = {
      from: `"${process.env.GMAIL_FROM_NAME || 'EmmaPediatra'}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `📥 Nueva solicitud de registro: ${nombre || cleanEmail}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #d01156;">Nueva solicitud de registro en el Área Privada</h2>
          <p>Se ha creado el registro inactivo para el siguiente usuario:</p>
          <ul>
            <li><strong>Email:</strong> ${cleanEmail}</li>
            <li><strong>Nombre completo:</strong> ${nombre || 'No proporcionado'}</li>
            <li><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</li>
            <li><strong>Origen:</strong> ${origenEncuentro || 'No indicado'}</li>
            <li><strong>Estado:</strong> Inactivo (pendiente de activación)</li>
          </ul>
          <p>Puedes revisarlo en la sección usuarios </p>
          <a href="https://emmapediatra.com/admin" target="_blank" style="color: #d01156;">Pulsa aquí para ir al admin</a>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Solicitud enviada y registrada correctamente.' 
    });

  } catch (error) {
    console.error('Error al notificar y guardar registro:', error);
    return NextResponse.json({ error: 'Error interno al procesar la solicitud.' }, { status: 500 });
  }
}