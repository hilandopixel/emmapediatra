// app/api/notificar-registro/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email, nombre, telefono, origenEncuentro } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Falta el correo del usuario' }, { status: 400 });
    }

    // Configurar el transportador SMTP de Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Plantilla del correo electrónico
    const mailOptions = {
      from: `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Te lo envías a ti mismo
      subject: `📥 Nueva solicitud de área privada: ${nombre || email}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #ffffff; color: #d01156;;">
          <h2 style="background-color: #ffffff; color: #d01156;">Nueva solicitud de registro en el Área Privada</h2>
          <p>Un usuario ha completado el formulario de registro y está a la espera de ser activado:</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
          <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Nombre:</strong> ${nombre || 'No proporcionado'}</li>
            <li><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</li>
            <li><strong>Origen / ¿Cómo nos conoció?:</strong> ${origenEncuentro || 'No indicado'}</li>
          </ul>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
          <p style="font-size: 13px; background-color: #ffffff; color: #d01156;">
            Accede al panel de administración para activarlo <a href="https://emmapediatra.com/admin/usuarios" target="_blank">pulsando aquí</a>
          </p>
        </div>
      `,
    };

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Notificación enviada con éxito' });
  } catch (error) {
    console.error('Error al enviar correo con Nodemailer:', error);
    return NextResponse.json(
      { error: 'Error al procesar el envío del correo de notificación' },
      { status: 500 }
    );
  }
}