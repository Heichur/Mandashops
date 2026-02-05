// src/components/IVSelector.tsx
'use client'

import { useState, useEffect } from 'react'

interface IVSelectorProps {
  onChange: (ivsString: string) => void
}

type StatValue = number | string

export default function IVSelector({ onChange }: IVSelectorProps) {
  const [stats, setStats] = useState<Record<string, StatValue>>({
    HP: 31,
    ATK: 31,
    DEF: 31,
    SPA: 31,
    SPD: 31,
    SPE: 31
  })

  useEffect(() => {
    const ivsString = gerarStringIVs()
    onChange(ivsString)
  }, [stats])

  const gerarStringIVs = (): string => {
    const parts: string[] = []
    
    // Converter todos para número
    const statsNumericos = Object.entries(stats).map(([key, value]) => ({
      key,
      value: value === '' ? 31 : (typeof value === 'string' ? parseInt(value) : value)
    }))
    
    // Verificar se é F6 (todos 31)
    const todosTrinta = statsNumericos.every(s => s.value === 31)
    if (todosTrinta) {
      return 'F6'
    }

    // Contar quantos são 31
    const countTrinta = statsNumericos.filter(s => s.value === 31).length
    
    // Só usar formato F se tiver pelo menos 2 stats em 31 (F2, F3, F4, F5, F6)
    if (countTrinta >= 2) {
      const statsNaoTrinta: string[] = []
      statsNumericos.forEach(({ key, value }) => {
        if (value !== 31) {
          const statName = key.toLowerCase()
          if (value === 0) {
            statsNaoTrinta.push(`0${statName}`)
          } else {
            statsNaoTrinta.push(`${value}${statName}`)
          }
        }
      })
      
      return `F${countTrinta}${statsNaoTrinta.length > 0 ? ', ' + statsNaoTrinta.join(', ') : ''}`
    }

    // Se tiver apenas 1 ou nenhum stat em 31, listar todos individualmente
    statsNumericos.forEach(({ key, value }) => {
      const statName = key.toLowerCase()
      parts.push(`${value}${statName}`)
    })

    return parts.join(', ') || 'F6'
  }

  const handleStatChange = (stat: string, value: string) => {
    // Permitir vazio ou apenas números
    if (value === '') {
      setStats(prev => ({
        ...prev,
        [stat]: value
      }))
      return
    }
    
    // Validar se é número
    if (/^\d+$/.test(value)) {
      const num = parseInt(value)
      // Limitar entre 0 e 31
      const numValue = Math.min(31, Math.max(0, num))
      setStats(prev => ({
        ...prev,
        [stat]: numValue
      }))
    }
  }

  const handleStatBlur = (stat: string) => {
    if (stats[stat] === '' || stats[stat] === null) {
      setStats(prev => ({
        ...prev,
        [stat]: 31
      }))
    }
  }

  const setPreset = (preset: 'all31') => {
    setStats({ HP: 31, ATK: 31, DEF: 31, SPA: 31, SPD: 31, SPE: 31 })
  }

  return (
    <div className="ev-section">
      <h3 className="ev-title">IVs do Pokémon</h3>
      
      {/* Botão de Preset - Apenas F6 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setPreset('all31')} style={{ 
          width: '100%',
          padding: '8px 12px',
          fontSize: '12px'
        }}>
          F6 (Todos 31)
        </button>
      </div>

      {/* Grid de Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '10px',
        marginBottom: '15px'
      }}>
        {Object.entries(stats).map(([stat, value]) => (
          <div key={stat} className="ev-input-group">
            <label>{stat}</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value}
              onChange={(e) => handleStatChange(stat, e.target.value)}
              onBlur={() => handleStatBlur(stat)}
              maxLength={2}
              style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}
            />
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="ev-total">
        <div>
          <strong>IVs Selecionados:</strong> {gerarStringIVs()}
        </div>
      </div>
    </div>
  )
}