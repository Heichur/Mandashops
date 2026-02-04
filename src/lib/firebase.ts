// src/lib/firebase.ts
import { initializeApp, getApps, getApp as getFirebaseApp, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"
import { getStorage, FirebaseStorage } from "firebase/storage"
import { getAnalytics, Analytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyAfRSdeNWR7CFtj5XA_5_Gm_z_BS--Dvw0",
  authDomain: "manda-shop.firebaseapp.com",
  projectId: "manda-shop",
  storageBucket: "manda-shop.firebasestorage.app",
  messagingSenderId: "874318178210",
  appId: "1:874318178210:web:a0ea9f9bc1b5a1a1abb4fb",
  measurementId: "G-CLQ13B615D",
}

// Inicializar Firebase App
let app: FirebaseApp
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getFirebaseApp()
}

// Inicializar serviços
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

let analytics: Analytics | undefined

// Analytics só no cliente
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  })
}

// Funções getter
export const getDb = (): Firestore => {
  return db
}

export const getAuthInstance = (): Auth => {
  return auth
}

export const getStorageInstance = (): FirebaseStorage => {
  return storage
}

export const getAnalyticsInstance = (): Analytics | undefined => {
  return analytics
}

export const getAppInstance = (): FirebaseApp => {
  return app
}

// Exports diretos
export { app, auth, db, storage, analytics }