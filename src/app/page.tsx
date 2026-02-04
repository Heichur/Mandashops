'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function ComprarPage() {
  return (
    <div className="mandashop-container">
      {/* Header com Logo */}
      <div className="mandashop-header">
        <Image 
          src="/img/MandashopLogoTop.png" 
          alt="MandaShop Logo"
          width={600}
          height={150}
          className="mandashop-logo-top"
          priority
        />
      </div>

      {/* Grid de Categorias */}
      <div className="categorias-grid">
        {/* Card 1 - Encomendas Normais */}
        <Link href="/comprar/normal" className="categoria-card">
          <h3 className="categoria-titulo">
            Encomendas<br/>Normais
          </h3>
          <p className="categoria-descricao">
            Solicite Pokémon personalizados de acordo com seu gosto. Nature e Ivs Perfeitos!
          </p>
        </Link>

        {/* Card 2 - Encomendas Competitivas */}
        <Link href="/comprar/competitivo" className="categoria-card">
          <h3 className="categoria-titulo">
            Encomendas<br/>Competitivas
          </h3>
          <p className="categoria-descricao">
            Pokémon prontos para o competitivo, focados em desempenho máximo. IVs perfeitos, Level, EVs treinados e nature correta para batalhas PvP, torneios e ranked.
          </p>
        </Link>

        {/* Card 3 - Encomendas Genderless */}
        <Link href="/comprar/genderless" className="categoria-card">
          <h3 className="categoria-titulo">
            Encomendas<br/>Genderless
          </h3>
          <p className="categoria-descricao">
            Encomenda exclusiva de Pokémon sem gênero. Perfeito para quem busca espécies raras, com total personalização disponível.
          </p>
        </Link>

        {/* Card 4 - Venda de Lendários e Shinys */}
        <Link href="/comprar/lendarios" className="categoria-card">
          <h3 className="categoria-titulo">
            Venda de<br/>Lendários e<br/>Shinys
          </h3>
          <p className="categoria-descricao">
            Adquira Pokémon lendários e shinys selecionados. Opções raras, e Pokémon diferenciados para deixar sua coleção ainda mais única.
          </p>
        </Link>

        {/* Card 5 - PokéPédia */}
        <Link href="/pokepedia" className="categoria-card">
          <h3 className="categoria-titulo">
            PokéPédia
          </h3>
          <p className="categoria-descricao">
            Acesse nossa PokéPédia completa. Informações sobre Pokémon, habilidades, golpes, biomas, treine evs antes de encomendar e muito mais para te ajudar na jornada
          </p>
        </Link>

        {/* Card 6 - Chibis (decorativo) */}
        <div className="categoria-card categoria-card-chibis">
          <div className="chibis-container">
            <Image
              src="/img/PamelaEMandaleri.png"
              alt="Pamela e Mandaleri"
              width={300}
              height={300}
              className="chibi-img"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}