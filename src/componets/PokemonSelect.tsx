// src/components/PokemonSelect.tsx
'use client'

import { useState, useEffect } from 'react'
import { pokemonAPI } from '@/lib/pokemonAPI'
import type { Pokemon } from '@/lib/types'

interface PokemonSelectProps {
  onSelect: (pokemon: string) => void
  id?: string
}

export default function PokemonSelect({ onSelect, id = 'pokemonSelect' }: PokemonSelectProps) {
  const [selectedPokemon, setSelectedPokemon] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPokemon = async () => {
      try {
        const list = await pokemonAPI.loadPokemonList()
        setPokemonList(list)
      } catch (error) {
        console.error('Erro ao carregar Pokémon:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPokemon()
  }, [])

  const handleSelect = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon.name)
    onSelect(pokemon.name)
    setIsOpen(false)
    setSearchTerm('')
  }

  const filteredPokemon = searchTerm
    ? pokemonAPI.searchPokemon(searchTerm).slice(0, 50)
    : pokemonList.slice(0, 50)

  return (
    <div className="pokemon-select" id={id}>
      <div 
        className="pokemon-select-trigger" 
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedPokemon ? "pokemon-select-selected" : "pokemon-select-placeholder"}>
          {selectedPokemon || 'Selecione um Pokémon...'}
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
            {loading ? (
              <div className="pokemon-no-results">Carregando...</div>
            ) : filteredPokemon.length === 0 ? (
              <div className="pokemon-no-results">
                Nenhum Pokémon encontrado
              </div>
            ) : (
              filteredPokemon.map((pokemon: Pokemon) => (
                <div 
                  key={pokemon.id} 
                  className="pokemon-option"
                  onClick={() => handleSelect(pokemon)}
                >
                  <span className="pokemon-name">{pokemon.name}</span>
                  <span className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}