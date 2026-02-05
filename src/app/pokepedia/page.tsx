// src/app/pokepedia/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { pokemonAPI } from '@/lib/pokemonAPI'
import type { Pokemon } from '@/lib/types'

export default function PokepediaPage() {
  const router = useRouter()
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPokemon()
  }, [])

  const loadPokemon = async () => {
    try {
      const list = await pokemonAPI.loadPokemonList()
      setPokemonList(list)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar Pokémon:', error)
      setLoading(false)
    }
  }

  // Mostrar apenas 9 primeiros se não tiver pesquisa
  const filteredPokemon = searchTerm
    ? pokemonAPI.searchPokemon(searchTerm)
    : pokemonList.slice(0, 9)

  if (loading) {
    return (
      <div className="pokepedia-loading">
        <p>Carregando Pokédex...</p>
      </div>
    )
  }

  return (
    <div className="pokepedia-container">
      {/* Botão de voltar */}
      <button 
        onClick={() => router.push('/')}
        className="back-button"
      >
        ← Voltar
      </button>

      <div className="pokepedia-header">
        <h1 className="pokepedia-title">Pokepédia</h1>
        <p className="pokepedia-subtitle">Busque informações sobre qualquer Pokémon</p>
      </div>

      {/* Busca */}
      <div className="pokemon-search-container">
        <input
          type="search"
          placeholder="Buscar Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pokemon-search-main"
        />
      </div>

      {/* Grid de Pokémon */}
      <div className="pokemon-grid">
        {filteredPokemon.map((pokemon) => (
          <div
            key={pokemon.id}
            onClick={() => router.push(`/pokepedia/${pokemon.originalName}`)}
            className="pokemon-card"
          >
            <div className="pokemon-card-image">
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                alt={pokemon.name}
              />
            </div>
            
            <p className="pokemon-number">#{pokemon.id.toString().padStart(3, '0')}</p>
            <h3 className="lendario-nome">{pokemon.name}</h3>
          </div>
        ))}
      </div>

      {filteredPokemon.length === 0 && (
        <p className="pokepedia-no-results">
          Nenhum Pokémon encontrado
        </p>
      )}
    </div>
  )
}