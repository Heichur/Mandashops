// src/app/pokepedia/[name]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { pokemonAPI } from '@/lib/pokemonAPI'

import dropsJson from '@/data/pokemon_drops.json'

const drops = dropsJson as unknown as DropsData

type DropItem = {
  item: string | null
  drop: string | null
}

type SpawnSpecificDrop = {
  item: string | null
  drop: string | null
  biome: string | null
}

type DropsData = Record<
  string,
  {
    Drops: DropItem[]
    "Spawn Specific Drops": SpawnSpecificDrop[]
  }
>

interface PokemonData {
  id: number
  name: string
  height: number
  weight: number
  sprites: {
    front_default: string
    other: {
      'official-artwork': {
        front_default: string
      }
    }
  }
  types: Array<{
    type: { name: string }
  }>
  abilities: Array<{
    ability: { name: string }
    is_hidden: boolean
  }>
  stats: Array<{
    stat: { name: string }
    base_stat: number
  }>
  moves: Array<{
    move: { name: string; url: string }
    version_group_details: Array<{
      level_learned_at: number
      move_learn_method: { name: string }
    }>
  }>
}

interface SpeciesData {
  egg_groups: Array<{ name: string }>
  flavor_text_entries: Array<{
    flavor_text: string
    language: { name: string }
  }>
}

interface TypeEffectiveness {
  double_damage_from: Array<{ name: string }>
  half_damage_from: Array<{ name: string }>
  no_damage_from: Array<{ name: string }>
}

const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
}

export default function PokemonDetailPage() {
  const params = useParams()
  const [pokemon, setPokemon] = useState<PokemonData | null>(null)
  const [species, setSpecies] = useState<SpeciesData | null>(null)
  const [typeEffectiveness, setTypeEffectiveness] = useState<TypeEffectiveness | null>(null)
  const [flavorText, setFlavorText] = useState<string>('Carregando descrição...')
  const [loading, setLoading] = useState(true)
  const [showMoves, setShowMoves] = useState(false)

  useEffect(() => {
    if (params.name) {
      fetchPokemonData(params.name as string)
    }
  }, [params.name])

  const fetchPokemonData = async (name: string) => {
    try {
      const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      const pokemonData = await pokemonRes.json()
      setPokemon(pokemonData)

      const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`)
      const speciesData = await speciesRes.json()
      setSpecies(speciesData)

      // Busca a descrição em português usando o método do pokemonAPI
      const descricao = await pokemonAPI.getPokemonFlavorText(pokemonData.id)
      setFlavorText(descricao)

      const typeRes = await fetch(pokemonData.types[0].type.url)
      const typeData = await typeRes.json()
      setTypeEffectiveness(typeData.damage_relations)

      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar Pokémon:', error)
      setFlavorText('Descrição não disponível.')
      setLoading(false)
    }
  }

  const getFlavorText = () => {
    return flavorText
  }

  const getLevelUpMoves = () => {
    if (!pokemon) return []
    return pokemon.moves
      .filter(m => m.version_group_details.some(v => v.move_learn_method.name === 'level-up'))
      .map(m => {
        const levelData = m.version_group_details.find(v => v.move_learn_method.name === 'level-up')
        return {
          name: m.move.name,
          level: levelData?.level_learned_at || 0
        }
      })
      .sort((a, b) => a.level - b.level)
      .slice(0, 16)
  }

  const getTMMoves = () => {
    if (!pokemon) return []
    return pokemon.moves
      .filter(m => m.version_group_details.some(v => v.move_learn_method.name === 'machine'))
      .map(m => ({ name: m.move.name }))
      .slice(0, 16)
  }

  if (loading) {
    return (
      <div className="pokepedia-loading">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!pokemon) {
    return (
      <div className="pokepedia-loading">
        <p style={{ color: '#ff4444' }}>Pokémon não encontrado</p>
      </div>
    )
  }
  const pokemonKey = pokemon.name.toLowerCase()

  const dropEntry = drops[pokemonKey]
  
  const pokemonDrops = dropEntry?.Drops ?? []
  const spawnSpecificDrops = dropEntry?.["Spawn Specific Drops"] ?? []
  
  return (
    <div className="pokemon-detail-wrapper">
      <div className="pokemon-detail-container">
        <Link href="/pokepedia" className="pokemon-detail-back">
          ← Voltar para Pokédex
        </Link>

        {/* Card Principal */}
        <div className="pokemon-detail-card">
          <div className="pokemon-detail-header">
            <div className="pokemon-detail-image-container">
              <div className="pokemon-detail-image">
                <img
                  src={pokemon.sprites.other['official-artwork'].front_default}
                  alt={pokemon.name}
                />
              </div>
            </div>

            <div className="pokemon-detail-info">
              <h1 className="pokemon-detail-title">
                {pokemon.name} #{pokemon.id.toString().padStart(3, '0')}
              </h1>

              {/* Tipos */}
              <div className="pokemon-types">
                {pokemon.types.map(t => (
                  <span
                    key={t.type.name}
                    className="pokemon-type-badge"
                    style={{ backgroundColor: TYPE_COLORS[t.type.name] || '#777' }}
                  >
                    {t.type.name}
                  </span>
                ))}
              </div>

              {/* Egg Groups */}
              {species && (
                <div className="pokemon-egg-section">
                  <h3 className="pokemon-egg-title">🥚 Egg Groups:</h3>
                  <div className="egg-groups-list">
                    {species.egg_groups.map(eg => (
                      <span key={eg.name} className="egg-group-badge">
                        {eg.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="pokemon-content-section">
          <h3 className="pokemon-section-header">📖 Sobre {pokemon.name}</h3>
          <p className="pokemon-description-text">{getFlavorText()}</p>
        </div>

        {/* Efetividade de Tipos */}
        {typeEffectiveness && (
          <div className="pokemon-content-section">
            <h3 className="pokemon-section-header">⚔️ Tabela de Efetividade de Tipos</h3>

            {typeEffectiveness.double_damage_from.length > 0 && (
              <div className="effectiveness-group">
                <h4 className="effectiveness-label damage-effective">⚡ Dano x2 (Super Efetivo!)</h4>
                <div className="pokemon-types">
                  {typeEffectiveness.double_damage_from.map(t => (
                    <span
                      key={t.name}
                      className="pokemon-type-badge-small"
                      style={{ backgroundColor: TYPE_COLORS[t.name] || '#777' }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {typeEffectiveness.half_damage_from.length > 0 && (
              <div className="effectiveness-group">
                <h4 className="effectiveness-label damage-resistant">🛡️ Dano x0.5 (Resistente)</h4>
                <div className="pokemon-types">
                  {typeEffectiveness.half_damage_from.map(t => (
                    <span
                      key={t.name}
                      className="pokemon-type-badge-small"
                      style={{ backgroundColor: TYPE_COLORS[t.name] || '#777' }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {typeEffectiveness.no_damage_from.length > 0 && (
              <div className="effectiveness-group">
                <h4 className="effectiveness-label damage-immune">⭕ Dano x0 (Imune)</h4>
                <div className="pokemon-types">
                  {typeEffectiveness.no_damage_from.map(t => (
                    <span
                      key={t.name}
                      className="pokemon-type-badge-small"
                      style={{ backgroundColor: TYPE_COLORS[t.name] || '#777' }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Habilidades */}
        <div className="pokemon-content-section">
          <h3 className="pokemon-section-header">✨ Habilidades</h3>
          {pokemon.abilities.map(a => (
            <div
              key={a.ability.name}
              className={`ability-list-item ${a.is_hidden ? 'is-hidden' : ''}`}
            >
              {a.ability.name.replace('-', ' ')}
              {a.is_hidden && (
                <span className="hidden-ability-label">(Hidden Ability)</span>
              )}
            </div>
          ))}
        </div>

        {/* Movimentos */}
        <div className="pokemon-content-section">
          <div className="moves-toggle-header">
            <h3 className="pokemon-section-header">⚔️ Moves (Movimentos)</h3>
            <button
              onClick={() => setShowMoves(!showMoves)}
              className="moves-toggle-btn"
            >
              {showMoves ? '▲ Ocultar' : '▼ Mostrar'}
            </button>
          </div>

          {showMoves && (
            <>
              {/* Level-up */}
              <div className="moves-category">
                <h4 className="moves-category-title levelup-category-title">
                  📚 Level-up (Aprende ao subir de nível)
                </h4>
                <div className="moves-grid-container">
                  {getLevelUpMoves().map(m => (
                    <div key={m.name} className="move-item-card move-item-levelup">
                      <div className="move-item-name">{m.name.replace('-', ' ')}</div>
                      <div className="move-item-level">Nível {m.level}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TM/HM */}
              <div className="moves-category">
                <h4 className="moves-category-title tm-category-title">
                  💿 TM/HM (Máquinas Técnicas)
                </h4>
                <div className="moves-grid-container">
                  {getTMMoves().map(m => (
                    <div key={m.name} className="move-item-card move-item-tm">
                      <div className="move-item-name">{m.name.replace('-', ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Drops */}
        <div className="pokemon-content-section">
          <h3 className="pokemon-section-header">Drops</h3>

          {/* Drops normais */}
          {pokemonDrops.length > 0 && (
            <div className="drops-group">
              <h4 className="drops-subtitle">Drops Comuns</h4>

              {pokemonDrops.map((drop, i) => (
                <div key={i} className="drop-item">
                  <span className="drop-item-name">{drop.item}</span>
                  {drop.drop && (
                    <span className="drop-item-value"> — {drop.drop}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Drops específicos de spawn */}
          {spawnSpecificDrops.length > 0 && (
            <div className="drops-group">
              <h4 className="drops-subtitle">Drops por Bioma</h4>

              {spawnSpecificDrops.map((drop, i) => (
                <div key={i} className="drop-item">
                  <span className="drop-item-name">{drop.item}</span>

                  {drop.drop && (
                    <span className="drop-item-value"> — {drop.drop}</span>
                  )}

                  {drop.biome && (
                    <span className="drop-item-biome">
                      {' '}
                      ({drop.biome})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {pokemonDrops.length === 0 && spawnSpecificDrops.length === 0 && (
            <p>Este Pokémon não possui drops.</p>
          )}
        </div>
      </div>
    </div>
  )
}
