// src/componets/AbilitySelect.tsx
'use client'

import { useState, useEffect } from 'react'
import { pokemonAPI } from '@/lib/pokemonAPI'

interface AbilitySelectProps {
  pokemonName: string
  id?: string
  onSelect?: (ability: string, isHidden: boolean) => void
}

export default function AbilitySelect({ 
  pokemonName, 
  id = 'abilitySelect',
  onSelect 
}: AbilitySelectProps) {
  const [selectedAbility, setSelectedAbility] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [abilities, setAbilities] = useState<Array<{name: string, isHidden: boolean}>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (pokemonName) {
      loadAbilities()
    } else {
      setAbilities([])
      setSelectedAbility('')
    }
  }, [pokemonName])

  const loadAbilities = async () => {
    setLoading(true)
    try {
      const details = await pokemonAPI.getPokemonDetails(pokemonName)
      if (details) {
        setAbilities(details.abilities)
      }
    } catch (error) {
      console.error('Erro ao carregar habilidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (ability: {name: string, isHidden: boolean}) => {
    setSelectedAbility(ability.name)
    setIsOpen(false)
    onSelect?.(ability.name, ability.isHidden)
  }

  const normalAbilities = abilities.filter(a => !a.isHidden)
  const hiddenAbilities = abilities.filter(a => a.isHidden)

  return (
    <div className="pokemon-select" id={id}>
      <div 
        className="pokemon-select-trigger" 
        tabIndex={0}
        onClick={() => pokemonName && setIsOpen(!isOpen)}
      >
        <span className={selectedAbility ? "pokemon-select-selected" : "pokemon-select-placeholder"}>
          {selectedAbility || (pokemonName ? 'Selecione uma habilidade...' : 'Selecione um Pokémon primeiro...')}
        </span>
        <div className="pokemon-select-arrow"></div>
      </div>
      
      {isOpen && pokemonName && (
        <div className="pokemon-select-options">
          <input 
            type="text" 
            className="pokemon-search-input" 
            placeholder="Buscar Habilidade..." 
            autoComplete="off"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="pokemon-options-list">
            {loading ? (
              <div className="pokemon-no-results">Carregando...</div>
            ) : (
              <>
                {normalAbilities.length > 0 && (
                  <>
                    <div className="ability-header">Habilidades</div>
                    {normalAbilities.map((ability) => (
                      <div 
                        key={ability.name}
                        className="pokemon-option"
                        onClick={() => handleSelect(ability)}
                      >
                        {ability.name}
                      </div>
                    ))}
                  </>
                )}
                
                {hiddenAbilities.length > 0 && (
                  <>
                    <div className="ability-header hidden">Hidden Ability (+15k)</div>
                    {hiddenAbilities.map((ability) => (
                      <div 
                        key={ability.name}
                        className="pokemon-option hidden"
                        onClick={() => handleSelect(ability)}
                      >
                        {ability.name}
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}