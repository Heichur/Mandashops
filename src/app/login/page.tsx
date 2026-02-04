// src/app/login/page.tsx
'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loginAdmin } = useAuth()
  const isAdmin = searchParams.get('admin') === 'true'

  const [nickname, setNickname] = useState('')
  const [discord, setDiscord] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleLogin = async () => {
    if (isAdmin) {
      if (!nickname || !senha) {
        alert('Por favor, preencha todos os campos!')
        return
      }
      
      setCarregando(true)
      const success = await loginAdmin(nickname, senha)
      setCarregando(false)
      
      if (success) {
        alert('Login admin realizado com sucesso!')
        router.push('/')
      } else {
        alert('Senha incorreta!')
      }
    } else {
      if (!nickname || !discord) {
        alert('Por favor, preencha os dois campos!')
        return
      }
      
      login(nickname, discord)
      alert(`Seja bem-vindo ${nickname}!`)
      router.push('/')
    }
  }

  return (
    <div id="TelaLogin">
      <div id="Saida">
        <Link href="/">
          <Image 
            src="/img/Exit.png" 
            alt="Fechar" 
            width={40} 
            height={40}
          />
        </Link>
      </div>

      {!isAdmin ? (
        <div id="Login">
          <h1>Faça o Login</h1>
          <input 
            type="text" 
            id="Nickname" 
            placeholder="Digite seu nick do Minecraft"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <input 
            type="text" 
            id="Discord" 
            placeholder="Digite seu nick do Discord"
            value={discord}
            onChange={(e) => setDiscord(e.target.value)}
          />
          <Image 
            src="/img/MandaShopIcone.png" 
            alt="Logo"
            width={200}
            height={200}
          />
          <button onClick={handleLogin}>Entrar</button>
        </div>
      ) : (
        <div id="LoginAdm">
          <h1>Login adm</h1>
          <input 
            type="text" 
            id="NicknameAdm" 
            placeholder="Nick"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <input 
            type="password" 
            id="SenhaAdm" 
            placeholder="Digite a senha de admin"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <Image 
            src="/img/MandaShopIcone.png" 
            alt="Logo"
            width={200}
            height={200}
          />
          <button onClick={handleLogin} disabled={carregando}>
            {carregando ? 'Verificando...' : 'Entrar'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginForm />
    </Suspense>
  )
}