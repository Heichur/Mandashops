// src/components/MegastoneSelect.tsx
'use client'

import { useState, useEffect } from 'react'
import { getDb } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

interface Megastone {
  id: string
  nome: string
  preco: number
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
        
        // Buscar apenas megapedras com estoque > 0
        const q = query(megastonesRef, where('estoque', '>', 0))
        const querySnapshot = await getDocs(q)
        
        const megastonesData: Megastone[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          
          // Validar se os campos obrigatórios existem
          if (data.nome && typeof data.preco === 'number' && typeof data.estoque === 'number') {
            megastonesData.push({
              id: doc.id,
              nome: data.nome,
              preco: data.preco,
              estoque: data.estoque
            })
          } else {
            console.warn(`Megapedra com ID ${doc.id} possui dados incompletos:`, data)
          }
        })

        // Ordenar alfabeticamente apenas se houver dados válidos
        if (megastonesData.length > 0) {
          megastonesData.sort((a, b) => {
            const nomeA = a.nome || ''
            const nomeB = b.nome || ''
            return nomeA.localeCompare(nomeB)
          })
        }
        
        setMegastones(megastonesData)
        setLoading(false)
      } catch (error) {
        console.error('Erro ao buscar megapedras:', error)
        setMegastones([])
        setLoading(false)
      }
    }

    fetchMegastones()
  }, [])

  // Filtrar megapedras baseado na busca
  const filteredMegastones = megastones.filter(stone =>
    stone.nome && stone.nome.toLowerCase().includes(searchTerm.toLowerCase())
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
            : selectedMegastone || 'Selecione uma Megapedra (opcional)...'
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
                  <span className="pokemon-id">{stone.preco / 1000}k</span>
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