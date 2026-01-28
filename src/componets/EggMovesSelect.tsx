// src/components/EggMovesSelect.tsx
'use client'

import { useState, useEffect } from 'react'

interface EggMovesSelectProps {
  pokemonName: string
  id?: string
}

export default function EggMovesSelect({ pokemonName, id = 'eggMovesSelect' }: EggMovesSelectProps) {
  const [selectedMoves, setSelectedMoves] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [eggMoves] = useState<string[]>(['Move 1', 'Move 2', 'Move 3']) // Placeholder

  const toggleMove = (move: string) => {
    if (selectedMoves.includes(move)) {
      setSelectedMoves(selectedMoves.filter((m: string) => m !== move))
    } else {
      setSelectedMoves([...selectedMoves, move])
    }
  }

  return (
    <div className="pokemon-select" id={id}>
      <div 
        className="pokemon-select-trigger" 
        tabIndex={0}
        onClick={() => pokemonName && setIsOpen(!isOpen)}
      >
        <span className={selectedMoves.length > 0 ? "pokemon-select-selected" : "pokemon-select-placeholder"}>
          {selectedMoves.length > 0 
            ? `${selectedMoves.length} egg moves (+${selectedMoves.length * 10}k)`
            : (pokemonName ? 'Selecione egg moves...' : 'Selecione um Pokémon primeiro...')
          }
        </span>
        <div className="pokemon-select-arrow"></div>
      </div>
      
      {isOpen && pokemonName && (
        <div className="pokemon-select-options">
          <input 
            type="text" 
            className="pokemon-search-input" 
            placeholder="Buscar Egg Move..." 
            autoComplete="off"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="pokemon-options-list">
            {eggMoves.map((move: string) => (
              <div 
                key={move} 
                className={`pokemon-option egg-move-option ${selectedMoves.includes(move) ? 'selected' : ''}`}
                onClick={() => toggleMove(move)}
              >
                {move}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}