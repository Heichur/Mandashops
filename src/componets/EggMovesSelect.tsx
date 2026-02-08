// src/componets/EggMovesSelect.tsx
'use client'

import { useState, useEffect } from 'react'

interface EggMovesSelectProps {
  pokemonName: string
  id?: string
  onMovesChange?: (moves: string[]) => void
}

interface EggMove {
  name: string
  displayName: string
}

export default function EggMovesSelect({ 
  pokemonName, 
  id = 'eggMovesSelect',
  onMovesChange 
}: EggMovesSelectProps) {
  const [selectedMoves, setSelectedMoves] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [eggMoves, setEggMoves] = useState<EggMove[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Função para converter nome formatado de volta para o formato da API
  const convertToApiFormat = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')  // Substitui espaços por hífens
  }

  // Função para obter o nome base (sem formas específicas) para buscar a espécie
  const getSpeciesName = (name: string): string => {
    const apiName = convertToApiFormat(name)
    
    // Lista de sufixos de formas que devem ser removidos para buscar a espécie
    const formSuffixes = [
      '-disguised', '-busted',  // Mimikyu
      '-midday', '-midnight', '-dusk',  // Lycanroc
      '-red-striped', '-blue-striped', '-white-striped',  // Basculin
      '-standard', '-zen',  // Darmanitan
      '-incarnate', '-therian',  // Forças da Natureza
      '-altered', '-origin',  // Giratina
      '-land', '-sky',  // Shaymin
      '-aria', '-pirouette',  // Meloetta
      '-ordinary', '-resolute',  // Keldeo
      '-baile', '-pom-pom', '-pau', '-sensu',  // Oricorio
      '-solo', '-school',  // Wishiwashi
      '-shield', '-blade',  // Aegislash
      '-plant', '-sandy', '-trash',  // Wormadam
      '-red-meteor', '-orange-meteor', '-yellow-meteor', '-green-meteor', '-blue-meteor', '-indigo-meteor', '-violet-meteor'  // Minior
    ]
    
    // Remove o sufixo de forma se existir
    for (const suffix of formSuffixes) {
      if (apiName.endsWith(suffix)) {
        return apiName.replace(suffix, '')
      }
    }
    
    return apiName
  }

  useEffect(() => {
    if (!pokemonName) {
      setEggMoves([])
      setSelectedMoves([])
      return
    }

    const fetchEggMoves = async () => {
      setLoading(true)
      try {
        // Obtém o nome base da espécie (sem sufixos de forma)
        const speciesName = getSpeciesName(pokemonName)
        
        // Log para debug
        console.log('🔍 Pokemon name recebido:', pokemonName)
        console.log('🔍 Nome da espécie:', speciesName)
        
        // Busca dados da espécie do Pokémon
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${speciesName}`
        console.log('🔍 URL da requisição:', speciesUrl)
        
        const speciesResponse = await fetch(speciesUrl)
        
        if (!speciesResponse.ok) {
          throw new Error('Espécie não encontrada')
        }

        const speciesData = await speciesResponse.json()
        
        // Busca todos os egg moves de todas as versões
        const eggMovesSet = new Set<string>()
        
        for (const variety of speciesData.varieties) {
          try {
            const pokemonResponse = await fetch(variety.pokemon.url)
            const pokemonData = await pokemonResponse.json()
            
            // Busca moves que são aprendidos por egg
            for (const moveEntry of pokemonData.moves) {
              const learnMethods = moveEntry.version_group_details
              
              const hasEggMove = learnMethods.some(
                (detail: any) => detail.move_learn_method.name === 'egg'
              )
              
              if (hasEggMove) {
                eggMovesSet.add(moveEntry.move.name)
              }
            }
          } catch (error) {
            console.error('Erro ao buscar variedade:', error)
          }
        }

        // Converte para array e formata os nomes
        const movesArray = Array.from(eggMovesSet).map(move => ({
          name: move,
          displayName: formatMoveName(move)
        }))

        // Ordena alfabeticamente
        movesArray.sort((a, b) => a.displayName.localeCompare(b.displayName))
        
        setEggMoves(movesArray)
      } catch (error) {
        console.error('Erro ao buscar egg moves:', error)
        setEggMoves([])
      } finally {
        setLoading(false)
      }
    }

    fetchEggMoves()
  }, [pokemonName])

  const formatMoveName = (name: string): string => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const toggleMove = (move: EggMove) => {
    let newSelectedMoves: string[]
    
    if (selectedMoves.includes(move.name)) {
      newSelectedMoves = selectedMoves.filter((m) => m !== move.name)
    } else {
      newSelectedMoves = [...selectedMoves, move.name]
    }
    
    setSelectedMoves(newSelectedMoves)
    onMovesChange?.(newSelectedMoves)
  }

  const filteredMoves = searchTerm
    ? eggMoves.filter(move =>
        move.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : eggMoves

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="pokemon-options-list">
            {loading ? (
              <div className="pokemon-no-results">Carregando egg moves...</div>
            ) : filteredMoves.length === 0 ? (
              <div className="pokemon-no-results">
                {searchTerm 
                  ? 'Nenhum egg move encontrado' 
                  : 'Este Pokémon não possui egg moves'
                }
              </div>
            ) : (
              filteredMoves.map((move) => (
                <div 
                  key={move.name} 
                  className={`pokemon-option egg-move-option ${selectedMoves.includes(move.name) ? 'selected' : ''}`}
                  onClick={() => toggleMove(move)}
                >
                  <span>{move.displayName}</span>
                  {selectedMoves.includes(move.name) && (
                    <span style={{ marginLeft: 'auto', color: '#4CAF50' }}>✓</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}