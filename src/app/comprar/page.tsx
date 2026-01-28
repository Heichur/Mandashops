// src/app/comprar/page.tsx
import Link from 'next/link'

export default function EscolherCompra() {
  return (
    <div id="opcaoCompra" style={{ display: 'block' }}>
      <h2>Escolha o tipo de compra:</h2>
      
      <Link href="/comprar/competitivo">
        <button>Compra Competitiva</button>
      </Link>
      
      <Link href="/comprar/normal">
        <button>Compra Normal</button>
      </Link>
      
      <Link href="/comprar/genderless">
        <button>Compra Genderless</button>
      </Link>
      
      <Link href="/">
        <button>Voltar</button>
      </Link>
    </div>
  )
}