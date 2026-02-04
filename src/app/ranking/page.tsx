// src/app/ranking/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { doc, getDoc } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'

interface Comprador {
  nome: string
  pedidos: number
}

export default function RankingPage() {
  const [compradores, setCompradores] = useState<Comprador[]>([])
  const [loading, setLoading] = useState(true)
  const [mesAtual, setMesAtual] = useState('')

  useEffect(() => {
    // Definir mês atual
    const agora = new Date()
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    setMesAtual(`${meses[agora.getMonth()]} ${agora.getFullYear()}`)

    // Carregar dados do Firebase
    carregarCompradores()
  }, [])

  const carregarCompradores = async () => {
    try {
      const db = getDb()
      
      // Obter mês e ano atual
      const agora = new Date()
      const ano = agora.getFullYear()
      const mes = String(agora.getMonth() + 1).padStart(2, '0') // "01", "02", etc.
      
      // Nome do documento: compradores_YYYY_MM
      const nomeDocumento = `compradores_${ano}_${mes}`
      
      // Buscar o documento específico
      const docRef = doc(db, 'compradores', nomeDocumento)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const dados = docSnap.data()
        
        // Converter o objeto em array e ordenar
        const compradoresArray: Comprador[] = Object.entries(dados)
          .map(([nome, pedidos]) => ({
            nome,
            pedidos: Number(pedidos)
          }))
          .sort((a, b) => b.pedidos - a.pedidos)
        
        setCompradores(compradoresArray)
      } else {
        console.log('Documento não encontrado para este mês')
        setCompradores([])
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar compradores:', error)
      setLoading(false)
    }
  }

  const obterMedalha = (index: number): string => {
    switch (index) {
      case 0: return '🥇'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return `${index + 1}º`
    }
  }

  return (
    <section id="TopCompradores">
      <div id="SaidaCompradores">
        <Link href="/" aria-label="Voltar para página inicial">
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
        <p>{mesAtual}</p>
      </div>
      
      <div id="ListaCompradores">
        {loading ? (
          <div className="loading-container">
            <p>Carregando dados dos compradores...</p>
          </div>
        ) : compradores.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum comprador encontrado este mês.</p>
          </div>
        ) : (
          <div className="ranking-lista">
            {compradores.map((comprador, index) => (
              <div 
                key={`${comprador.nome}-${index}`} 
                className={`comprador-item ${index < 3 ? 'top-tres' : ''}`}
              >
                <span className="posicao">
                  {obterMedalha(index)}
                </span>
                <span className="nome">{comprador.nome}</span>
                <span className="pedidos">
                  {comprador.pedidos} pedido{comprador.pedidos !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Link href="/">
        <button className="btn-voltar">Voltar</button>
      </Link>
    </section>
  )
}