// src/lib/types.ts
'use client'

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicializa Firebase (evita múltiplas inicializações)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializa serviços
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics apenas no cliente
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };

export interface Pokemon {
  id: number
  name: string
  originalName: string
  url?: string
}

export interface PokemonDetails {
  id: number
  name: string
  height: number
  weight: number
  types: string[]
  sprite: string
  abilities: Ability[]
  stats: Stat[]
}

export interface Ability {
  name: string
  isHidden: boolean
}

export interface Stat {
  name: string
  value: number
}

export interface EggMove {
  name: string
  displayName: string
}

export interface Megastone {
  id: string
  name: string
  displayName: string
  valor: number
  estoque: number
}

export interface Pedido {
  nomeUsuario: string
  nickDiscord: string
  pokemon: string
  tipoCompra?: 'normal' | 'competitivo' | 'genderless'
  castradoOuBreedavel: string
  natureza: string
  habilidades: string
  sexo?: string
  ivsSolicitados: string
  ivsZerados: string
  informacoesAdicionais: string
  ivsFinal: string
  ivsUpgradado: boolean
  detalhesUpgrade: string
  eggMoves: string
  hiddenHabilidade: boolean
  evsDistribuicao?: string
  totalVitaminas?: number
  levelPokemon?: string
  precoLevel?: number
  megapedra?: string
  precoMegapedra?: number
  megapedraDocId?: string
  precoBase?: number
  precoTotal: number
  timestamp: Date
  status: string
}

export interface IVsData {
  valido: boolean
  tipo?: string
  tipoIV?: string
  mensagem?: string
  statsZerados: string[]
  informacoesAdicionais: string[]
  qtdStatsZerados: number
}

export interface IVsCalculation {
  preco: number
  tipoFinal: string
  foiUpgradado: boolean
  detalhesUpgrade: string
}

export interface EVs {
  hp: number
  atk: number
  def: number
  spa: number
  spd: number
  spe: number
}

export interface UserData {
  nickname: string
  discord: string
  isAdmin?: boolean
}