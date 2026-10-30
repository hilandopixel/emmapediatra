// app/api/admin/activar-usuario/route.js
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    console.log("In")
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

    // 3. Verificar en Firestore que el solicitante sea un administrador activo
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
      return NextResponse.json({ error: "Acceso denegado. Permisos insuficientes." }, { status: 403 });
    }

    // 4. Leer el email objetivo desde el cuerpo de la petición
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Falta el correo electrónico del usuario a activar." }, { status: 400 });
    }

    const targetEmail = email.trim().toLowerCase();

    // 5. Crear usuario en Firebase Auth si no existe
    try {
      await adminAuth.createUser({
        email: targetEmail,
        emailVerified: false,
      });
    } catch (authError) {
      if (authError.code !== "auth/email-already-exists") {
        throw authError;
      }
    }

    console.log("Get users")
    // 7. Obtener los datos del usuario a activar y cambiar estado a activo
    const userRef = adminDb.collection("usuarios_autorizados").doc(targetEmail);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "El usuario no existe en la base de datos." }, { status: 404 });
    }

    const userData = userSnap.data();
    const userName = userData.nombre || targetEmail;

    await userRef.update({
      activo: true,
      updatedAt: new Date(),
    });

    console.log("Set Area Privada")
    const userAreaPrivadaRef = adminDb.collection('usuarios_areaprivada').doc(targetEmail);
    await userAreaPrivadaRef.set({
      email: targetEmail,
      fechaActivacion: new Date().toISOString(),
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // 8. Enviar notificación por correo mediante Nodemailer
    const mailOptions = {
      from: `"${process.env.GMAIL_FROM_NAME || 'EmmaPediatra'}" <${process.env.GMAIL_USER}>`,
      to: [targetEmail],
      subject: `${userName}, tu cuenta en EmmaPediatra ha sido activada`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #ffffff; color: #d01156; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="background-color: #ffffff; color: #d01156; text-align: center;">¡Bienvenido/a al Área Privada!</h2>
          <p>Hola ${userName},</p>
          <p>Tu solicitud ha sido aprobada. Ya puedes acceder haciendo clic en el siguiente botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/area-privada" style="background-color: #d01156; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Acceder al área privada
            </a>
          </div>
          <p style="font-size: 12px; background-color: #ffffff; color: #d01156; text-align: center;">Si no has solicitado este acceso, puedes ignorar este mensaje.</p>
        </div>
      `,
    };

    console.log("Send email")
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: `Usuario ${targetEmail} activado y correo enviado correctamente.` 
    });

  } catch (error) {
    console.error("Error en la API de activación:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}