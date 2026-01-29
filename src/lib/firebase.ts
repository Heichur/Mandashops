// src/lib/firebase.ts
import { FirebaseApp } from "firebase/app"
import { Auth } from "firebase/auth"
import { Firestore } from "firebase/firestore"
import { FirebaseStorage } from "firebase/storage"
import { Analytics } from "firebase/analytics"

// Exporta como undefined inicialmente
let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined
let analytics: Analytics | undefined

// Apenas inicializa no cliente
if (typeof window !== 'undefined') {
  const { initializeApp, getApps, getApp } = require('firebase/app')
  const { getAuth } = require('firebase/auth')
  const { getFirestore } = require('firebase/firestore')
  const { getStorage } = require('firebase/storage')
  const { getAnalytics, isSupported } = require('firebase/analytics')

  const firebaseConfig = {
    apiKey: "AIzaSyAfRSdeNWR7CFtj5XA_5_Gm_z_BS--Dvw0",
    authDomain: "manda-shop.firebaseapp.com",
    projectId: "manda-shop",
    storageBucket: "manda-shop.firebasestorage.app",
    messagingSenderId: "874318178210",
    appId: "1:874318178210:web:a0ea9f9bc1b5a1a1abb4fb",
    measurementId: "G-CLQ13B615D",
  }

  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)

  isSupported().then((supported: boolean) => {
    if (supported) {
      analytics = getAnalytics(app!)
    }
  })
}

export { app, auth, db, storage, analytics }