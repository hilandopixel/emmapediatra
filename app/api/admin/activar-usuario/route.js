import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, adminEmail } = body;

    if (!email || !adminEmail) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    // 1. Verificar administrador
    const adminRef = adminDb.collection("usuarios_autorizados").doc(adminEmail.toLowerCase());
    const adminSnap = await adminRef.get();

    if (!adminSnap.exists || !adminSnap.data().activo) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    // 2. Crear usuario en Auth si no existe
    try {
      await adminAuth.createUser({
        email: email.toLowerCase(),
        emailVerified: false,
      });
    } catch (authError) {
      if (authError.code !== "auth/email-already-exists") {
        throw authError;
      }
    }

    // 3. Generar el enlace de restablecimiento de Firebase
    const firebaseLink = await adminAuth.generatePasswordResetLink(email.toLowerCase());

    // MAGIA AQUÍ: Extraemos el "oobCode" del enlace que genera Firebase automáticamente
    const urlObj = new URL(firebaseLink);
    const oobCode = urlObj.searchParams.get("oobCode");

    // Construimos un enlace que apunta DIRECTAMENTE a tu página de Next.js
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const customPasswordLink = `${baseUrl}/es/area-privada/actualizar-password?oobCode=${oobCode}`;

    // 4. Actualizar Firestore a activo
    const userRef = adminDb.collection("usuarios_autorizados").doc(email.toLowerCase());
    await userRef.update({
      activo: true,
      updatedAt: new Date(),
    });

    // 5. Enviar el correo con Resend usando TU enlace directo
    const { error: emailError } = await resend.emails.send({
      from: 'Asistencia <onboarding@resend.dev>',
      to: [email.toLowerCase()],
      subject: '¡Tu cuenta ha sido activada!',
      html: `
        <div style="font-family: Arial, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f766e; text-align: center;">¡Bienvenido/a al Área Privada!</h2>
          <p>Hola,</p>
          <p>Tu solicitud ha sido aprobada. Ya puedes configurar tu contraseña de acceso haciendo clic en el siguiente botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${customPasswordLink}" style="background-color: #0f766e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Establecer mi contraseña
            </a>
          </div>
          <p style="font-size: 12px; color: #64748b; text-align: center;">Si no has solicitado este acceso, puedes ignorar este mensaje.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Error al enviar el correo con Resend:", emailError);
      return NextResponse.json({ error: "Usuario activado, pero falló el envío del correo." }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Usuario ${email} activado y correo enviado correctamente.` 
    });

  } catch (error) {
    console.error("Error en la API de activación:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}