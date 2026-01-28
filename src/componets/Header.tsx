// src/components/Header.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <div id="Opções">
      <Image 
        src="/img/MandaShop.png" 
        alt="Manda Shop Icon" 
        width={200} 
        height={100}
        priority
      />
      <div id="LinksTopo">
        <Link href="/ranking">
          <p id="Compradores">Top Compradores</p>
        </Link>
        <Link href="/sobre">
          <p id="SobreNos">Sobre nós</p>
        </Link>
        <Link href="/tabela">
          <p>Tabela de Valores</p>
        </Link>
        <Link href="/login">
          <p>Login</p>
        </Link>
        <Link href="/login?admin=true">
          <p>Adm</p>
        </Link>
      </div>
    </div>
  )
}