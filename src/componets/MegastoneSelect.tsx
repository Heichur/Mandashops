// src/components/MegastoneSelect.tsx
'use client'

import { useState } from 'react'

export default function MegastoneSelect() {
  const [selectedMegastone, setSelectedMegastone] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const megastones = [
    { name: 'Charizardite X', price: 50000 },
    { name: 'Charizardite Y', price: 50000 },
    { name: 'Gengarite', price: 45000 },
  ]

  const handleSelect = (megastone: {name: string, price: number}) => {
    setSelectedMegastone(megastone.name)
    setIsOpen(false)
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
            onClick={(e) => e.stopPropagation()}
          />
          <div className="pokemon-options-list">
            {megastones.map((stone) => (
              <div 
                key={stone.name} 
                className="pokemon-option"
                onClick={() => handleSelect(stone)}
              >
                <span className="pokemon-name">{stone.name}</span>
                <span className="pokemon-id">{stone.price / 1000}k</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}