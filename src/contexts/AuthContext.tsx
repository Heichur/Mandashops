// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getDb } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

interface AuthContextType {
  isLoggedIn: boolean
  userNickname: string | null
  userDiscord: string | null
  isAdmin: boolean
  login: (nickname: string, discord: string) => void
  loginAdmin: (nickname: string, senha: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userNickname: null,
  userDiscord: null,
  isAdmin: false,
  login: () => {},
  loginAdmin: async () => false,
  logout: () => {}
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userNickname, setUserNickname] = useState<string | null>(null)
  const [userDiscord, setUserDiscord] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const nickname = localStorage.getItem('userNickname')
    const discord = localStorage.getItem('userDiscord')
    const adminStatus = localStorage.getItem('isAdmin') === 'true'

    if (nickname && discord) {
      setIsLoggedIn(true)
      setUserNickname(nickname)
      setUserDiscord(discord)
      setIsAdmin(adminStatus)
    } else {
      setIsLoggedIn(false)
      setUserNickname(null)
      setUserDiscord(null)
      setIsAdmin(false)

      const protectedRoutes = ['/comprar', '/ranking', '/tabela']
      const isProtectedRoute = protectedRoutes.some(route => 
        pathname?.startsWith(route)
      )

      if (isProtectedRoute && pathname !== '/login') {
        router.push('/login')
      }
    }
    
    setIsChecking(false)
  }, [pathname, router])

  const login = (nickname: string, discord: string) => {
    localStorage.setItem('userNickname', nickname)
    localStorage.setItem('userDiscord', discord)
    localStorage.setItem('isAdmin', 'false')
    setIsLoggedIn(true)
    setUserNickname(nickname)
    setUserDiscord(discord)
    setIsAdmin(false)
  }

  const loginAdmin = async (nickname: string, senha: string): Promise<boolean> => {
    try {
      const db = getDb()
      const configRef = doc(db, 'configuracoes', 'admin')
      const configSnap = await getDoc(configRef)
      
      if (configSnap.exists()) {
        const senhaCorreta = configSnap.data().senhaAdm
        
        if (senha === senhaCorreta) {
          localStorage.setItem('userNickname', nickname)
          localStorage.setItem('userDiscord', 'Admin')
          localStorage.setItem('isAdmin', 'true')
          setIsLoggedIn(true)
          setUserNickname(nickname)
          setUserDiscord('Admin')
          setIsAdmin(true)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Erro ao verificar senha de admin:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('userNickname')
    localStorage.removeItem('userDiscord')
    localStorage.removeItem('isAdmin')
    setIsLoggedIn(false)
    setUserNickname(null)
    setUserDiscord(null)
    setIsAdmin(false)
    router.push('/')
  }

  if (isChecking) {
    return <div>Carregando...</div>
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userNickname, userDiscord, isAdmin, login, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}