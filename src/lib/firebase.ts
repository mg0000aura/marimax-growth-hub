import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Configuração do projeto Firebase da MARIMAX.
 * A apiKey de um app web do Firebase é pública (publishable) por definição —
 * a proteção real vem das regras de segurança do Firestore/Auth.
 */
export const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] ?? "",
  authDomain: "mg-ia-a7ca6.firebaseapp.com",
  databaseURL: "https://mg-ia-a7ca6-default-rtdb.firebaseio.com",
  projectId: "mg-ia-a7ca6",
  storageBucket: "mg-ia-a7ca6.firebasestorage.app",
  messagingSenderId: "202376014292",
  appId: "1:202376014292:web:be7ee04af906ce44b94e41",
  measurementId: "G-W643BFZ3KG",
};

export const firebaseEnabled = Boolean(firebaseConfig.apiKey);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function getApp(): FirebaseApp | null {
  if (!firebaseEnabled || typeof window === "undefined") return null;
  if (!app) app = getApps()[0] ?? initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const a = getApp();
  if (!a) return null;
  if (!authInstance) {
    authInstance = getAuth(a);
    // Mantém o login salvo no dispositivo — não precisa logar toda vez.
    void setPersistence(authInstance, browserLocalPersistence);
  }
  return authInstance;
}

export function getDb(): Firestore | null {
  const a = getApp();
  if (!a) return null;
  if (!dbInstance) dbInstance = getFirestore(a);
  return dbInstance;
}
