// src/components/GenderlessPokemonSelect.tsx
'use client'

import { useState } from 'react'
import { Pokes_Genderless } from '@/lib/GenderlessPokes'

interface GenderlessPokemonSelectProps {
  onSelect: (pokemon: string) => void
}

export default function GenderlessPokemonSelect({ onSelect }: GenderlessPokemonSelectProps) {
  const [selectedPokemon, setSelectedPokemon] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSelect = (pokemon: string) => {
    setSelectedPokemon(pokemon)
    onSelect(pokemon)
    setIsOpen(false)
  }

  const filteredPokemon = Pokes_Genderless.filter((pokemon: string) =>
    pokemon.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="pokemon-select" id="pokemonSelectGenderless">
      <div 
        className="pokemon-select-trigger" 
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedPokemon ? "pokemon-select-selected" : "pokemon-select-placeholder"}>
          {selectedPokemon || 'Selecione um Pokémon Genderless...'}
        </span>
        <div className="pokemon-select-arrow"></div>
      </div>
      
      {isOpen && (
        <div className="pokemon-select-options">
          <input 
            type="text" 
            className="pokemon-search-input" 
            placeholder="Buscar Pokémon..." 
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="pokemon-options-list">
            {filteredPokemon.length === 0 ? (
              <div className="pokemon-no-results">
                Nenhum Pokémon Genderless encontrado
              </div>
            ) : (
              filteredPokemon.map((pokemon: string) => (
                <div 
                  key={pokemon} 
                  className="pokemon-option"
                  onClick={() => handleSelect(pokemon)}
                >
                  <span className="pokemon-name">{pokemon}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}