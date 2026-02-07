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
  const [todosCompradores, setTodosCompradores] = useState<Comprador[]>([])
  const [usuarioAtual, setUsuarioAtual] = useState<string>('')
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

    // Obter nome do usuário do localStorage
    const nomeUsuario = localStorage.getItem('nomeUsuario') || ''
    setUsuarioAtual(nomeUsuario)

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
        
        // Converter o objeto em array completo e ordenar
        const compradoresArray: Comprador[] = Object.entries(dados)
          .map(([nome, pedidos]) => ({
            nome,
            pedidos: Number(pedidos)
          }))
          .sort((a, b) => b.pedidos - a.pedidos)
        
        // Guardar lista completa
        setTodosCompradores(compradoresArray)
        
        // Pegar apenas os 10 primeiros para exibir
        setCompradores(compradoresArray.slice(0, 10))
      } else {
        console.log('Documento não encontrado para este mês')
        setCompradores([])
        setTodosCompradores([])
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

  // Encontrar posição do usuário atual
  const encontrarPosicaoUsuario = () => {
    if (!usuarioAtual) return null
    
    const index = todosCompradores.findIndex(c => c.nome === usuarioAtual)
    if (index === -1) return null
    
    return {
      posicao: index + 1,
      comprador: todosCompradores[index]
    }
  }

  const posicaoUsuario = encontrarPosicaoUsuario()
  const usuarioNoTop10 = posicaoUsuario && posicaoUsuario.posicao <= 10

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
          <>
            <div className="ranking-lista">
              {compradores.map((comprador, index) => (
                <div 
                  key={`${comprador.nome}-${index}`} 
                  className={`comprador-item ${index < 3 ? 'top-tres' : ''} ${comprador.nome === usuarioAtual ? 'usuario-atual' : ''}`}
                >
                  <span className="posicao">
                    {obterMedalha(index)}
                  </span>
                  <span className="nome">
                    {comprador.nome}
                    {comprador.nome === usuarioAtual && ' (Você)'}
                  </span>
                  <span className="pedidos">
                    {comprador.pedidos} pedido{comprador.pedidos !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Mostrar posição do usuário se não estiver no top 10 */}
            {posicaoUsuario && !usuarioNoTop10 && (
              <div className="sua-posicao">
                <div className="divisor">
                  <span>• • •</span>
                </div>
                <div className="comprador-item usuario-atual destaque">
                  <span className="posicao">
                    {posicaoUsuario.posicao}º
                  </span>
                  <span className="nome">
                    {posicaoUsuario.comprador.nome} (Você)
                  </span>
                  <span className="pedidos">
                    {posicaoUsuario.comprador.pedidos} pedido{posicaoUsuario.comprador.pedidos !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <Link href="/">
        <button className="btn-voltar">Voltar</button>
      </Link>
    </section>
  )
}