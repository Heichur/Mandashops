// src/components/MegastoneSelect.tsx
'use client'

import { useState, useEffect } from 'react'
import { getDb } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

interface Megastone {
  id: string
  nome: string
  valor: number
  estoque: number
}

export default function MegastoneSelect() {
  const [selectedMegastone, setSelectedMegastone] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [megastones, setMegastones] = useState<Megastone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMegastones = async () => {
      try {
        const db = getDb()
        const megastonesRef = collection(db, 'megapedras')
        
        // Buscar todas as megapedras
        const querySnapshot = await getDocs(megastonesRef)
        
        console.log('🔍 Total de documentos no Firebase:', querySnapshot.size)
        
        const megastonesData: Megastone[] = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          
          // Aceita tanto 'nome' quanto 'name', com fallback para o ID do documento
          const nome = data.nome || data.name || doc.id
          
          const megastone: Megastone = {
            id: doc.id,
            nome: nome,
            valor: Number(data.valor) || Number(data.value) || 0,
            estoque: Number(data.estoque) || Number(data.stock) || 0
          }
          
          console.log('📦', megastone.nome, '- Estoque:', megastone.estoque, '- Valor:', megastone.valor)
          
          // Só adiciona se tiver estoque
          if (megastone.estoque > 0) {
            megastonesData.push(megastone)
          }
        })

        console.log('✅ Megapedras com estoque:', megastonesData.length)

        // Ordenar alfabeticamente
        megastonesData.sort((a, b) => a.nome.localeCompare(b.nome))
        
        setMegastones(megastonesData)
        setLoading(false)
      } catch (error) {
        console.error('❌ Erro ao buscar megapedras:', error)
        setMegastones([])
        setLoading(false)
      }
    }

    fetchMegastones()
  }, [])

  // Filtrar megapedras baseado na busca
  const filteredMegastones = megastones.filter(stone =>
    stone.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (megastone: Megastone) => {
    setSelectedMegastone(megastone.nome)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="pokemon-select" id="megastoneSelect">
      <input 
        type="hidden" 
        id="MegastoneSelect" 
        value={selectedMegastone}
      />
      <div 
        className="pokemon-select-trigger" 
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedMegastone ? "pokemon-select-selected" : "pokemon-select-placeholder"}>
          {loading 
            ? 'Carregando megapedras...' 
            : selectedMegastone || `Selecione uma Megapedra (${megastones.length} disponíveis)...`
          }
        </span>
        <div className="pokemon-select-arrow"></div>
      </div>
      
      {isOpen && (
        <div className="pokemon-select-options">
          <input 
            type="text" 
            className="pokemon-search-input" 
            placeholder="Buscar Megapedra..." 
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="pokemon-options-list">
            {loading ? (
              <div className="pokemon-option" style={{opacity: 0.6, cursor: 'default'}}>
                <span className="pokemon-name">Carregando...</span>
              </div>
            ) : filteredMegastones.length > 0 ? (
              filteredMegastones.map((stone) => (
                <div 
                  key={stone.id} 
                  className="pokemon-option"
                  onClick={() => handleSelect(stone)}
                >
                  <span className="pokemon-name">
                    {stone.nome} 
                    <span style={{fontSize: '0.85em', opacity: 0.7, marginLeft: '8px'}}>
                      (Estoque: {stone.estoque})
                    </span>
                  </span>
                  <span className="pokemon-id">{Math.round(stone.valor / 1000)}k</span>
                </div>
              ))
            ) : (
              <div className="pokemon-option" style={{opacity: 0.6, cursor: 'default'}}>
                <span className="pokemon-name">
                  {searchTerm 
                    ? 'Nenhuma megapedra encontrada' 
                    : 'Nenhuma megapedra disponível em estoque'
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}