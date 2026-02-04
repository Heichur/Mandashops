//src/app/comprar/lendarios/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getDb } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import ModalAnuncio from '@/componets/admins/ModalAnuncio'
import ModalTipoAnuncio from '@/componets/admins/ModalTipoAnuncio'

interface ItemAnuncio {
  id: string
  nome: string
  preco: number
  imagem?: string
  descricao?: string
  tipo: 'lendario' | 'shiny'
  estaNoOvo?: boolean
}

export default function ComprarLendarios() {
  const router = useRouter()
  const { isAdmin, userNickname, userDiscord } = useAuth()
  const [itemSelecionado, setItemSelecionado] = useState<ItemAnuncio | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [todosItens, setTodosItens] = useState<ItemAnuncio[]>([])
  const [carregando, setCarregando] = useState(true)
  
  const [mostrarModalTipo, setMostrarModalTipo] = useState(false)
  const [mostrarModalAnuncio, setMostrarModalAnuncio] = useState(false)
  const [tipoAnuncio, setTipoAnuncio] = useState<'lendarios' | 'shinys' | null>(null)
  const [itemEditar, setItemEditar] = useState<any>(null)
  const [menuAberto, setMenuAberto] = useState<string | null>(null)

  // Carregar SHINYS E LENDÁRIOS juntos
  useEffect(() => {
    carregarTodosItens()
  }, [])

  const carregarTodosItens = async () => {
    try {
      console.log('🔍 Carregando lendários e shinys...')
      const db = getDb()
      
      // Buscar lendários
      const lendariosRef = collection(db, 'lendarios')
      const lendariosSnapshot = await getDocs(lendariosRef)
      
      const lendarios: ItemAnuncio[] = []
      lendariosSnapshot.forEach((doc) => {
        lendarios.push({
          id: doc.id,
          tipo: 'lendario',
          ...doc.data()
        } as ItemAnuncio)
      })
      
      console.log('🔥 Lendários:', lendarios)
      
      // Buscar shinys
      const shinysRef = collection(db, 'shinys')
      const shinysSnapshot = await getDocs(shinysRef)
      
      const shinys: ItemAnuncio[] = []
      shinysSnapshot.forEach((doc) => {
        shinys.push({
          id: doc.id,
          tipo: 'shiny',
          ...doc.data()
        } as ItemAnuncio)
      })
      
      console.log('✨ Shinys:', shinys)
      
      // Juntar tudo e ordenar por data de criação (mais recente primeiro)
      const todosItens = [...lendarios, ...shinys].sort((a: any, b: any) => {
        const dataA = a.criadoEm?.toDate?.() || new Date(0)
        const dataB = b.criadoEm?.toDate?.() || new Date(0)
        return dataB.getTime() - dataA.getTime()
      })
      
      console.log('📦 Total de itens:', todosItens.length)
      setTodosItens(todosItens)
      
    } catch (error) {
      console.error('❌ Erro ao carregar itens:', error)
    } finally {
      setCarregando(false)
    }
  }

  const abrirModal = (item: ItemAnuncio) => {
    setItemSelecionado(item)
    setMostrarModal(true)
  }

  const fecharModal = () => {
    setMostrarModal(false)
    setItemSelecionado(null)
  }

  const handleCompra = async () => {
    if (!itemSelecionado) return
    
    setProcessando(true)
    try {
      const db = getDb()
      
      // Nome do comprador para exibir
      const nomeComprador = userNickname || userDiscord || 'Usuário desconhecido'
      
      // Salvar pedido no Firebase
      await addDoc(collection(db, 'pedidos'), {
        tipo: itemSelecionado.tipo,
        item: itemSelecionado.nome,
        preco: itemSelecionado.preco,
        data: new Date().toISOString(),
        status: 'pendente',
        comprador: nomeComprador,
        discord: userDiscord
      })

      // Enviar para Discord
      const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_LENDSHINYS_WEBHOOK_URL
      
      if (webhookUrl) {
        const tipoEmoji = itemSelecionado.tipo === 'lendario' ? '🔥' : '✨'
        const tipoNome = itemSelecionado.tipo === 'lendario' ? 'Lendário' : 'Shiny'
        const ovoInfo = itemSelecionado.estaNoOvo ? ' 🥚 (No Ovo)' : ''
        
        const embed = {
          embeds: [{
            title: `${tipoEmoji} Nova Compra de ${tipoNome}!`,
            color: itemSelecionado.tipo === 'lendario' ? 0xFF6B35 : 0xFFD700,
            fields: [
              {
                name: '👤 Comprador',
                value: nomeComprador,
                inline: true
              },
              {
                name: '💬 Discord',
                value: userDiscord || 'Não informado',
                inline: true
              },
              {
                name: '🎯 Item',
                value: `${itemSelecionado.nome}${ovoInfo}`,
                inline: false
              },
              {
                name: '💰 Preço',
                value: `${itemSelecionado.preco}KK`,
                inline: true
              }
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: 'MandaShop - Sistema de Pedidos'
            }
          }]
        }

        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(embed)
        })
      }

        const colecao = itemSelecionado.tipo === 'lendario' ? 'lendarios' : 'shinys'
    const itemRef = doc(db, colecao, itemSelecionado.id)
    await deleteDoc(itemRef)
    
    console.log(`✅ Item ${itemSelecionado.nome} deletado da coleção ${colecao}`)

    alert('Compra realizada com sucesso!')
    fecharModal()
    } catch (error) {
      console.error('Erro ao processar compra:', error)
      alert('Erro ao processar compra. Tente novamente.')
    } finally {
      setProcessando(false)
    }
  }

  // Funções Admin
  const abrirCriarAnuncio = () => {
    setMostrarModalTipo(true)
  }

  const handleSelecionarTipo = (tipo: 'lendarios' | 'shinys') => {
    setTipoAnuncio(tipo)
    setMostrarModalTipo(false)
    setItemEditar(null)
    setMostrarModalAnuncio(true)
  }

  const abrirEditarAnuncio = (item: ItemAnuncio) => {
    setItemEditar(item)
    setTipoAnuncio(item.tipo === 'lendario' ? 'lendarios' : 'shinys')
    setMostrarModalAnuncio(true)
    setMenuAberto(null)
  }

  const handleAnuncioSalvo = () => {
    carregarTodosItens()
    setMostrarModalAnuncio(false)
    setItemEditar(null)
    setTipoAnuncio(null)
  }

  const toggleMenu = (itemId: string) => {
    setMenuAberto(menuAberto === itemId ? null : itemId)
  }

  return (
    <div className="lendarios-container">
      {/* Header */}
      <div className="lendarios-header">
        <Link href="/" className="lendarios-voltar">
          ← Voltar
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Lendários & Shinys</h1>
            <p>Selecione um item para comprar</p>
          </div>
          
          {isAdmin && (
            <button onClick={abrirCriarAnuncio} className="btn-criar-anuncio">
              + Criar Anúncio
            </button>
          )}
        </div>
      </div>

      {/* Grid de Cards */}
      {carregando ? (
        <div className="loading-container">
          <p>Carregando itens...</p>
        </div>
      ) : (
        <div className="lendarios-grid">
          {todosItens.map((item) => (
            <div key={`${item.tipo}-${item.id}`} className="lendario-card-wrapper">
              {/* Menu de 3 pontos para admin */}
              {isAdmin && (
                <div className="admin-menu-container">
                  <button 
                    className="admin-menu-trigger"
                    onClick={() => toggleMenu(item.id)}
                  >
                    ⋮
                  </button>
                  
                  {menuAberto === item.id && (
                    <div className="admin-menu-dropdown">
                      <button onClick={() => abrirEditarAnuncio(item)}>
                        ✏️ Modificar anúncio
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div
                onClick={() => abrirModal(item)}
                className="lendario-card"
              >
                {/* Badge de tipo */}
                <div className="badge-tipo">
                  {item.tipo === 'lendario' ? '🔥 Lendário' : '✨ Shiny'}
                </div>

                <div className="lendario-imagem">
                  {item.imagem ? (
                    <img src={item.imagem} alt={item.nome} />
                  ) : (
                    <div className="lendario-imagem-placeholder">
                      {item.tipo === 'lendario' ? '🔥' : '✨'}
                    </div>
                  )}
                </div>
                
                <div className="lendario-info">
                  <h3 className="lendario-nome">{item.nome}</h3>
                  {item.descricao && (
                    <p className="lendario-descricao">{item.descricao}</p>
                  )}
                  {item.estaNoOvo && (
                    <span className="badge-ovo">🥚 No Ovo</span>
                  )}
                </div>

                <div className="lendario-footer">
                  <span className="lendario-preco">{item.preco}KK</span>
                  <button className="lendario-btn-comprar">Comprar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Compra */}
      {mostrarModal && itemSelecionado && (
        <div className="lendario-modal-overlay" onClick={fecharModal}>
          <div className="lendario-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirmar Compra</h2>
            
            <div className="lendario-modal-detalhes">
              <p><strong>Tipo:</strong> {itemSelecionado.tipo === 'lendario' ? '🔥 Lendário' : '✨ Shiny'}</p>
              <p><strong>Item:</strong> {itemSelecionado.nome}</p>
              <p><strong>Descrição:</strong> {itemSelecionado.descricao}</p>
              {itemSelecionado.estaNoOvo && <p><strong>🥚 Este Pokémon está no ovo</strong></p>}
              <p className="lendario-modal-total">
                Total: {itemSelecionado.preco}KK
              </p>
            </div>

            <div className="lendario-modal-acoes">
              <button
                onClick={handleCompra}
                disabled={processando}
                className="lendario-btn lendario-btn-confirmar"
              >
                {processando ? 'Processando...' : 'Confirmar'}
              </button>
              <button
                onClick={fecharModal}
                disabled={processando}
                className="lendario-btn lendario-btn-cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals Admin */}
      {mostrarModalTipo && (
        <ModalTipoAnuncio
          onSelecionarTipo={handleSelecionarTipo}
          onClose={() => setMostrarModalTipo(false)}
        />
      )}

      {mostrarModalAnuncio && (
        <ModalAnuncio
          tipo={tipoAnuncio}
          itemEditar={itemEditar}
          onClose={() => {
            setMostrarModalAnuncio(false)
            setItemEditar(null)
            setTipoAnuncio(null)
          }}
          onSalvo={handleAnuncioSalvo}
        />
      )}
    </div>
  )
}