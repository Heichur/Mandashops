// src/components/MegastoneSelect.tsx
'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase' // ajuste o caminho conforme sua configuração

interface Megastone {
  id: string
  name?: string
  nome?: string
  value?: number
  valor?: number
  estoque?: number
  stock?: number
}

interface MegastoneSelectProps {
  onSelect?: (megastoneName: string, price: number) => void // ✅ ADICIONADO: Prop para callback
}

export default function MegastoneSelect({ onSelect }: MegastoneSelectProps) { // ✅ ADICIONADO: Receber prop
  const [selectedMegastone, setSelectedMegastone] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [megastones, setMegastones] = useState<Megastone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMegastones = async () => {
      try {
        const megapedrasRef = collection(db, 'megapedras')
        const snapshot = await getDocs(megapedrasRef)
        
        const stonesData: Megastone[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          stonesData.push({
            id: doc.id,
            name: data.name || data.nome,
            nome: data.nome || data.name,
            value: data.value || data.valor,
            valor: data.valor || data.value,
            estoque: data.estoque || data.stock,
            stock: data.stock || data.estoque
          })
        })
        
        // Ordenar por preço (do maior para o menor)
        stonesData.sort((a, b) => {
          const priceA = a.value || a.valor || 0
          const priceB = b.value || b.valor || 0
          return priceB - priceA
        })
        
        setMegastones(stonesData)
      } catch (error) {
        console.error('Erro ao buscar megapedras:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMegastones()
  }, [])

  const filteredMegastones = megastones.filter(stone => {
    const stoneName = stone.name || stone.nome || ''
    return stoneName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleSelect = (megastone: Megastone) => {
    const name = megastone.name || megastone.nome || ''
    const price = megastone.value || megastone.valor || 0
    
    setSelectedMegastone(name)
    setIsOpen(false)
    setSearchTerm('')
    
    // ✅ ADICIONADO: Chamar callback com nome e preço da megastone
    if (onSelect) {
      onSelect(name, price)
    }
  }

  const getPrice = (stone: Megastone) => {
    const price = stone.value || stone.valor || 0
    return price / 1000 // Converte para "k" (ex: 700000 -> 700k)
  }

  return (
    <div className="pokemon-select" id="megastoneSelect">
      <div 
        className="pokemon-select-trigger" 
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedMegastone ? "pokemon-select-selected" : "pokemon-select-placeholder"}>
          {selectedMegastone || 'Selecione uma Megapedra...'}
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
              <div className="pokemon-option" style={{ textAlign: 'center', color: '#888' }}>
                Carregando megapedras...
              </div>
            ) : filteredMegastones.length === 0 ? (
              <div className="pokemon-option" style={{ textAlign: 'center', color: '#888' }}>
                Nenhuma megapedra encontrada
              </div>
            ) : (
              filteredMegastones.map((stone) => (
                <div 
                  key={stone.id} 
                  className="pokemon-option"
                  onClick={() => handleSelect(stone)}
                >
                  <span className="pokemon-name">{stone.name || stone.nome}</span>
                  <span className="pokemon-id">{getPrice(stone)}k</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}