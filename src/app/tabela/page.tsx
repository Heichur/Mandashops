// src/app/tabela/page.tsx
import Image from 'next/image'
import Link from 'next/link'

export default function TabelaPage() {
  return (
    <section id="Tabela">
      <Link href="/">
        <Image 
          src="/img/Exit.png" 
          alt="Fechar"
          id="FecharTabela"
          width={40}
          height={40}
        />
      </Link>
      
      <Image 
        src="/img/Tabela.png" 
        alt="Tabela de Preços"
        width={1200}
        height={800}
        style={{ 
          maxWidth: '100%', 
          height: 'auto',
          objectFit: 'contain'
        }}
        priority
      />
    </section>
  )
}