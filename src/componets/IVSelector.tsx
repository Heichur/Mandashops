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
    const statsNumericos = Object.entries(stats).map(([key, value]) => ({
      key,
      value: value === 'any' ? 31 : (typeof value === 'string' ? parseInt(value) : value)
    }))
    
    // Contar quantos stats são 31
    const countTrinta = statsNumericos.filter(s => s.value === 31).length
    
    // Se todos são 31, retorna F6
    if (countTrinta === 6) {
      return 'F6'
    }

    // Se tem entre 2 e 5 IVs perfeitos (31), usar formato FX
    if (countTrinta >= 2 && countTrinta <= 5) {
      const partes: string[] = [`F${countTrinta}`]
      
      // Coletar os stats que NÃO são 31
      statsNumericos.forEach(({ key, value }) => {
        if (value !== 31) {
          const statName = key.toLowerCase()
          // ✅ CORREÇÃO: Usar formato "0stat" para IVs zerados (não "-stat")
          if (value === 0) {
            partes.push(`0${statName}`)
          } else {
            // Para valores customizados diferentes de 0 e 31
            partes.push(`${value}${statName}`)
          }
        }
      })
      
      // Formato: F5, 0atk, 0spe (com vírgulas e espaços)
      return partes.join(', ')
    }

    // Se tem menos de 2 IVs perfeitos, mostrar cada stat individualmente
    const parts: string[] = []
    statsNumericos.forEach(({ key, value }) => {
      const statName = key.toLowerCase()
      parts.push(`${value}${statName}`)
    })

    return parts.join(', ') || 'F6'
  }

  const handleStatChange = (stat: string, value: string) => {
    setStats(prev => ({
      ...prev,
      [stat]: value === 'any' ? 'any' : parseInt(value)
    }))
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
            <select
              value={value}
              onChange={(e) => handleStatChange(stat, e.target.value)}
              style={{ 
                textAlign: 'center', 
                fontSize: '16px', 
                fontWeight: 'bold',
                padding: '8px',
                cursor: 'pointer',
                appearance: 'auto'
              }}
            >
              <option value={31}>31</option>
              <option value={0}>0</option>
              <option value="any">Qualquer um</option>
            </select>
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