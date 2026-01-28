// src/app/ranking/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function RankingPage() {
  const [compradores, setCompradores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carregar dados do Firebase
    carregarCompradores()
  }, [])

  const carregarCompradores = async () => {
    try {
      // Lógica de buscar do Firebase
      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <section id="TopCompradores">
      <div id="SaidaCompradores">
        <Link href="/">
          <Image 
            src="/img/Exit.png" 
            alt="Fechar"
            width={40}
            height={40}
          />
        </Link>
      </div>
      
      <h1>🏆 Top Compradores do Mês</h1>
      
      <div id="MesAtual">
        {/* Nome do mês atual */}
      </div>
      
      <div id="ListaCompradores">
        {loading ? (
          <p>Carregando dados dos compradores...</p>
        ) : (
          <div className="ranking-lista">
            {compradores.map((comprador, index) => (
              <div key={comprador.nome} className="comprador-item">
                <span className="posicao">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                </span>
                <span className="nome">{comprador.nome}</span>
                <span className="pedidos">
                  {comprador.pedidos} pedido{comprador.pedidos > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Link href="/">
        <button>Voltar</button>
      </Link>
    </section>
  )
}