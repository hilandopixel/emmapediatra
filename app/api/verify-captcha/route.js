// app/api/verify-captcha/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token de captcha no proporcionado' }, { status: 400 });
    }

    // Verificar el token con la API de Cloudflare Turnstile
    const formData = new FormData();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await result.json();

    if (outcome.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Validación de captcha fallida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error al verificar captcha:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}