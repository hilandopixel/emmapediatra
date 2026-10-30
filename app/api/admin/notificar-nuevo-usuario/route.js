// app/api/notificar-registro/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { email, nombre, telefono, origenEncuentro } = await request.json();

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
        activo: false, // Por defecto inactivo hasta que el administrador lo active
        roles: ['usuario'],
        fechaSolicitud: new Date().toISOString(),
      });
    }

    // 2. Enviar notificación por correo al administrador mediante Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${process.env.GMAIL_FROM_NAME || 'EmmaPediatra'}" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `📥 Nueva solicitud de registro: ${nombre || cleanEmail}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #d01156;">Nueva solicitud de registro en el Área Privada</h2>
          <p>Se ha creado el registro inactivo en Firestore para el siguiente usuario:</p>
          <ul>
            <li><strong>Email:</strong> ${cleanEmail}</li>
            <li><strong>Nombre completo:</strong> ${nombre || 'No proporcionado'}</li>
            <li><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</li>
            <li><strong>Origen:</strong> ${origenEncuentro || 'No indicado'}</li>
            <li><strong>Estado:</strong> Inactivo (pendiente de activación)</li>
          </ul>
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