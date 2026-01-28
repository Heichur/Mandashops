// src/app/page.tsx
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div id="Site_Container">
      <h1 className="NomeManda">MandaShop</h1>
      <h4 className="TextoManda">O lugar onde pokémons se tornam tudo!</h4>
      
      <Image 
        src="/img/MandaShopIcone.png" 
        alt="Logo Manda Shop"
        width={300}
        height={300}
        id="Logo"
        priority
      />
      
      <Link href="/comprar">
        <button id="Compra">Faça sua compra aqui!</button>
      </Link>
    </div>
  )
}