// src/components/EVCalculatorDetail.tsx
'use client'

import { useState } from 'react'

interface BaseStats {
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
}

interface EVCalculatorDetailProps {
  baseStats: BaseStats
}

interface EVs {
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
}

interface IVs {
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
}

const STAT_COLORS: Record<string, string> = {
  hp: '#FF5959',
  attack: '#F5AC78',
  defense: '#FAE078',
  specialAttack: '#9DB7F5',
  specialDefense: '#A7DB8D',
  speed: '#FA92B2'
}

const STAT_LABELS: Record<string, string> = {
  hp: 'Hp',
  attack: 'Attack',
  defense: 'Defense',
  specialAttack: 'Special Attack',
  specialDefense: 'Special Defense',
  speed: 'Speed'
}

const STAT_ICONS: Record<string, string> = {
  hp: '',
  attack: '',
  defense: '',
  specialAttack: '',
  specialDefense: '',
  speed: ''
}

const EVCalculatorDetail = ({ baseStats }: EVCalculatorDetailProps) => {
  const [evs, setEvs] = useState<EVs>({
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0
  })

  const [ivs, setIVs] = useState<IVs>({
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0
  })

  const [nature, setNature] = useState<string>('Hardy')

  const totalEvs = Object.values(evs).reduce((sum, val) => sum + val, 0)

  const handleEVChange = (stat: keyof EVs, value: number) => {
    const newValue = Math.min(Math.max(0, value), 252)
    setEvs({ ...evs, [stat]: newValue })
  }

  const handleIVChange = (stat: keyof IVs, value: number) => {
    const newValue = Math.min(Math.max(0, value), 31)
    setIVs({ ...ivs, [stat]: newValue })
  }

  const calculateFinalStat = (statName: keyof BaseStats) => {
    const base = baseStats[statName]
    const iv = ivs[statName]
    const ev = evs[statName]
    
    if (statName === 'hp') {
      
      return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * 100) / 100) + 100 + 10
    } else {
   
      let stat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * 100) / 100) + 5
      
    
      const natureModifier = getNatureModifier(statName, nature)
      stat = Math.floor(stat * natureModifier)
      
      return stat
    }
  }

  const getNatureModifier = (stat: keyof BaseStats, natureName: string): number => {
    const natures: Record<string, { increased?: string, decreased?: string }> = {
      'Hardy': {},
      'Lonely': { increased: 'attack', decreased: 'defense' },
      'Brave': { increased: 'attack', decreased: 'speed' },
      'Adamant': { increased: 'attack', decreased: 'specialAttack' },
      'Naughty': { increased: 'attack', decreased: 'specialDefense' },
      'Bold': { increased: 'defense', decreased: 'attack' },
      'Docile': {},
      'Relaxed': { increased: 'defense', decreased: 'speed' },
      'Impish': { increased: 'defense', decreased: 'specialAttack' },
      'Lax': { increased: 'defense', decreased: 'specialDefense' },
      'Timid': { increased: 'speed', decreased: 'attack' },
      'Hasty': { increased: 'speed', decreased: 'defense' },
      'Serious': {},
      'Jolly': { increased: 'speed', decreased: 'specialAttack' },
      'Naive': { increased: 'speed', decreased: 'specialDefense' },
      'Modest': { increased: 'specialAttack', decreased: 'attack' },
      'Mild': { increased: 'specialAttack', decreased: 'defense' },
      'Quiet': { increased: 'specialAttack', decreased: 'speed' },
      'Bashful': {},
      'Rash': { increased: 'specialAttack', decreased: 'specialDefense' },
      'Calm': { increased: 'specialDefense', decreased: 'attack' },
      'Gentle': { increased: 'specialDefense', decreased: 'defense' },
      'Sassy': { increased: 'specialDefense', decreased: 'speed' },
      'Careful': { increased: 'specialDefense', decreased: 'specialAttack' },
      'Quirky': {}
    }

    const selectedNature = natures[natureName]
    if (!selectedNature) return 1.0
    
    if (selectedNature.increased === stat) return 1.1
    if (selectedNature.decreased === stat) return 0.9
    return 1.0
  }

  const maxStat = Math.max(
    calculateFinalStat('hp'),
    calculateFinalStat('attack'),
    calculateFinalStat('defense'),
    calculateFinalStat('specialAttack'),
    calculateFinalStat('specialDefense'),
    calculateFinalStat('speed')
  )

  return (
    <div className="ev-calculator-detail">
      <div className="ev-calculator-header">
        <h3 className="pokemon-section-header">📊 Build: IV&apos;s, EV&apos;s e Nature</h3>
        
        <div className="nature-selector-container">
          <label htmlFor="nature">Nature:</label>
          <select 
            id="nature"
            value={nature} 
            onChange={(e) => setNature(e.target.value)}
            className="nature-select"
          >
            <option value="Hardy">Hardy (Neutra)</option>
            <option value="Lonely">Lonely (+Atk, -Def)</option>
            <option value="Brave">Brave (+Atk, -Spe)</option>
            <option value="Adamant">Adamant (+Atk, -SpA)</option>
            <option value="Naughty">Naughty (+Atk, -SpD)</option>
            <option value="Bold">Bold (+Def, -Atk)</option>
            <option value="Relaxed">Relaxed (+Def, -Spe)</option>
            <option value="Impish">Impish (+Def, -SpA)</option>
            <option value="Lax">Lax (+Def, -SpD)</option>
            <option value="Timid">Timid (+Spe, -Atk)</option>
            <option value="Hasty">Hasty (+Spe, -Def)</option>
            <option value="Jolly">Jolly (+Spe, -SpA)</option>
            <option value="Naive">Naive (+Spe, -SpD)</option>
            <option value="Modest">Modest (+SpA, -Atk)</option>
            <option value="Mild">Mild (+SpA, -Def)</option>
            <option value="Quiet">Quiet (+SpA, -Spe)</option>
            <option value="Rash">Rash (+SpA, -SpD)</option>
            <option value="Calm">Calm (+SpD, -Atk)</option>
            <option value="Gentle">Gentle (+SpD, -Def)</option>
            <option value="Sassy">Sassy (+SpD, -Spe)</option>
            <option value="Careful">Careful (+SpD, -SpA)</option>
          </select>
        </div>
      </div>

      <div className="ev-total-info">
        <span>Total de EVs: <strong style={{ color: totalEvs > 510 ? '#ff4444' : '#ffd700' }}>{totalEvs}</strong> / 510</span>
      </div>

      <div className="stats-container-ev">
        {(Object.keys(baseStats) as Array<keyof BaseStats>).map((statKey) => {
          const finalStat = calculateFinalStat(statKey)
          const barPercentage = (finalStat / maxStat) * 100

          return (
            <div key={statKey} className="stat-row-ev">
              <div className="stat-header-ev">
                <span className="stat-icon-ev">{STAT_ICONS[statKey]}</span>
                <span className="stat-label-ev">{STAT_LABELS[statKey]}</span>
                <span className="stat-final-ev">{finalStat}</span>
              </div>

              <div className="stat-inputs-ev">
                <div className="input-group-ev">
                  <label>IV:</label>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    value={ivs[statKey]}
                    onChange={(e) => handleIVChange(statKey as keyof IVs, parseInt(e.target.value) || 0)}
                    className="stat-input-ev iv-input-ev"
                  />
                </div>

                <div className="input-group-ev">
                  <label>EV:</label>
                  <input
                    type="number"
                    min="0"
                    max="252"
                    step="4"
                    value={evs[statKey]}
                    onChange={(e) => handleEVChange(statKey as keyof EVs, parseInt(e.target.value) || 0)}
                    className="stat-input-ev ev-input-ev"
                  />
                </div>
              </div>

              <div className="stat-bar-container-ev">
                <div 
                  className="stat-bar-ev"
                  style={{ 
                    width: `${barPercentage}%`,
                    backgroundColor: STAT_COLORS[statKey]
                  }}
                >
                  <span className="stat-bar-text-ev">{finalStat}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EVCalculatorDetail