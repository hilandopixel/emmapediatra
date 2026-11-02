// app/api/admin/notificar-nueva-consulta/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request) {
  try {
    const { 
      nombre, 
      apellidos, 
      email, 
      telefono, 
      motivo, 
      mensaje, 
      aceptaPolitica, 
      tokenTurnstile 
    } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'El correo electrónico es obligatorio.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Comprobar si el usuario existe en "usuarios_autorizados" y si está activo
    const userRef = adminDb.collection('usuarios_autorizados').doc(cleanEmail);
    const userSnap = await userRef.get();

    const isRegistered = userSnap.exists;
    const isActive = isRegistered ? userSnap.data()?.activo === true : false;

    // 2. Guardar la consulta en la colección "consultas" con las dos nuevas propiedades
    let saved = await adminDb.collection('consultas').add({
      nombre: nombre || '',
      apellidos: apellidos || '',
      email: cleanEmail,
      telefono: telefono || '',
      motivo: motivo || 'videoconsulta',
      mensaje: mensaje || '',
      aceptaPolitica: !!aceptaPolitica,
      estado: 'pendiente',
      isRegistered,
      isActive,
      createdAt: FieldValue.serverTimestamp(),
    });

    if(saved){
      console.log('consulta guardada')
    }else{
      error = 'ERROR: consulta no guardada'
      console.log('ERROR: consulta no guardada')
    }

    // 3. Configurar y enviar el correo electrónico al administrador
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    */

    // 1. Crear el transporte SMTP para IONOS
    /*
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ionos.es',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // false para puerto 587 (usa STARTTLS); true para puerto 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        // Configuración opcional si estás probando en entornos locales complejos:
        tls: {
          rejectUnauthorized: false,
        },
      });*/


    const nombreCompleto = `${nombre || ''} ${apellidos || ''}`.trim() || 'No proporcionado';
    
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
      subject: `📥 Nueva solicitud de consulta: ${nombreCompleto} (${cleanEmail})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #d01156;">Nueva solicitud de contacto | consulta</h2>
          <p>Se ha registrado una nueva solicitud con los siguientes datos:</p>
          <ul>
            <li><strong>Email:</strong> ${cleanEmail}</li>
            <li><strong>Nombre completo:</strong> ${nombreCompleto}</li>
            <li><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</li>
            <li><strong>Motivo:</strong> ${motivo || 'No especificado'}</li>
            <li><strong>Mensaje / Detalle:</strong> ${mensaje || 'Sin mensaje'}</li>
          </ul>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <h3 style="color: #d01156; font-size: 14px;">Estado del usuario en el sistema:</h3>
          <ul>
            <li><strong>¿Está registrado en la web?:</strong> ${isRegistered ? 'Sí' : 'No'}</li>
            <li><strong>¿Está activo?:</strong> ${isActive ? 'Sí (Activo)' : 'No (Inactivo/No registrado)'}</li>
          </ul>

          <p style="margin-top: 20px;">Puedes revisar y gestionar las solicitudes desde el panel de administración:</p>
          <a href="https://emmapediatra.com/admin" target="_blank" style="color: #d01156; font-weight: bold;">Acceder al Panel de Administración</a>
        </div>
      `,
    };

    let sendMail = await transporter.sendMail(mailOptions);
    if(!sendMail) {error = 'Not mail sent ' + sendMail}
    return NextResponse.json({ 
      success: true, 
      message: 'Solicitud de consulta notificada y guardada correctamente.',
      isRegistered,
      isActive
    });

  } catch (error) {
    console.error('Error al notificar y guardar la nueva consulta:', error);
    return NextResponse.json({ error: 'Error interno al procesar la solicitud de consulta.' }, { status: 500 });
  }
}