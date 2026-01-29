// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  isLoggedIn: boolean
  userNickname: string | null
  userDiscord: string | null
  login: (nickname: string, discord: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userNickname: null,
  userDiscord: null,
  login: () => {},
  logout: () => {}
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userNickname, setUserNickname] = useState<string | null>(null)
  const [userDiscord, setUserDiscord] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const nickname = localStorage.getItem('userNickname')
    const discord = localStorage.getItem('userDiscord')

    if (nickname && discord) {
      setIsLoggedIn(true)
      setUserNickname(nickname)
      setUserDiscord(discord)
    } else {
      setIsLoggedIn(false)
      setUserNickname(null)
      setUserDiscord(null)

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
    setIsLoggedIn(true)
    setUserNickname(nickname)
    setUserDiscord(discord)
  }

  const logout = () => {
    localStorage.removeItem('userNickname')
    localStorage.removeItem('userDiscord')
    setIsLoggedIn(false)
    setUserNickname(null)
    setUserDiscord(null)
    router.push('/')
  }

  if (isChecking) {
    return <div>Carregando...</div>
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userNickname, userDiscord, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}