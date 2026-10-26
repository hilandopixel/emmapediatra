// lib/authAdmin.js
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Inicializar Firebase Admin SDK si no se ha hecho antes
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function verifyAdminRequest(request) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }

  const token = authHeader.split("Bearer ")[1];
  
  // 1. Verificar si el token es válido y no ha expirado
  const decodedToken = await getAuth().verifyIdToken(token);
  const email = decodedToken.email?.toLowerCase();

  if (!email) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Comprobar en Firestore si el usuario está activo y tiene rol de admin
  const userDoc = await getFirestore()
    .collection("usuarios_autorizados")
    .doc(email)
    .get();

  if (!userDoc.exists) {
    throw new Error("FORBIDDEN");
  }

  const userData = userDoc.data();
  const roles = userData.roles || [];
  const permisos = userData.permisos || [];
  const isActivo = userData.activo === true;

  const esAdmin = isActivo && (
    roles.includes("administrador_global") || 
    roles.includes("administrador") || 
    permisos.includes("gestionar_solicitudes") ||
    userData.esAdmin === true
  );

  if (!esAdmin) {
    throw new Error("FORBIDDEN");
  }

  return { email, userData };
}