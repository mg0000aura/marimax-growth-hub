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
  apiKey: "AIzaSyAov8lQc9GKeV-SokT5gjv-aLCew2C6M-A",
  authDomain: "mg00-ed424.firebaseapp.com",
  databaseURL: "https://mg00-ed424-default-rtdb.firebaseio.com",
  projectId: "mg00-ed424",
  storageBucket: "mg00-ed424.firebasestorage.app",
  messagingSenderId: "877652383572",
  appId: "1:877652383572:web:96cd6ad86344741ad31ac1",
  measurementId: "G-6FV3VCC1D3",
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
