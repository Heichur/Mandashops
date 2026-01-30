// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
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

let firebaseApp: FirebaseApp | undefined
let firebaseAuth: Auth | undefined
let firebaseDb: Firestore | undefined
let firebaseStorage: FirebaseStorage | undefined
let firebaseAnalytics: Analytics | undefined

function initializeFirebase() {
  if (!firebaseApp) {
    firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  }
  return firebaseApp
}

export function getDb(): Firestore {
  if (typeof window === 'undefined') {
    throw new Error('Firestore só pode ser acessado no lado do cliente')
  }
  
  if (!firebaseDb) {
    const app = initializeFirebase()
    firebaseDb = getFirestore(app)
  }
  
  return firebaseDb
}

export function getAuthInstance(): Auth {
  if (typeof window === 'undefined') {
    throw new Error('Auth só pode ser acessado no lado do cliente')
  }
  
  if (!firebaseAuth) {
    const app = initializeFirebase()
    firebaseAuth = getAuth(app)
  }
  
  return firebaseAuth
}

export function getStorageInstance(): FirebaseStorage {
  if (typeof window === 'undefined') {
    throw new Error('Storage só pode ser acessado no lado do cliente')
  }
  
  if (!firebaseStorage) {
    const app = initializeFirebase()
    firebaseStorage = getStorage(app)
  }
  
  return firebaseStorage
}

if (typeof window !== 'undefined') {
  const app = initializeFirebase()
  isSupported().then((supported) => {
    if (supported) {
      firebaseAnalytics = getAnalytics(app)
    }
  })
}

export const app = typeof window !== 'undefined' ? initializeFirebase() : undefined
export { getAuthInstance as auth, getStorageInstance as storage, firebaseAnalytics as analytics }