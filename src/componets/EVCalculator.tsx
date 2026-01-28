// src/components/EVCalculator.tsx
'use client'

import { useState } from 'react'

interface EVs {
  hp: number
  atk: number
  def: number
  spa: number
  spd: number
  spe: number
}

interface EVCalculatorProps {
  onChange: (evs: EVs) => void
}

export default function EVCalculator({ onChange }: EVCalculatorProps) {
  const [evs, setEvs] = useState<EVs>({
    hp: 0,
    atk: 0,
    def: 0,
    spa: 0,
    spd: 0,
    spe: 0
  })

  const totalEvs = Object.values(evs).reduce((sum, val) => sum + val, 0)
  const totalVitaminas = Object.values(evs).reduce((sum, val) => sum + Math.floor(val / 10), 0)
  const custoTotal = totalVitaminas * 400

  const handleChange = (stat: keyof EVs, value: number) => {
    const newValue = Math.min(Math.max(0, value), 252)
    const newEvs = { ...evs, [stat]: newValue }
    setEvs(newEvs)
    onChange(newEvs)
  }

  return (
    <div className="ev-section">
      <h3 className="ev-title">Distribuição de EVs</h3>
      <p className="ev-info">
        Cada vitamina dá 10 EVs e custa 400. Máximo: 252 EVs por stat | Total: 510 EVs
      </p>
      
      {(Object.keys(evs) as Array<keyof EVs>).map((stat) => (
        <div key={stat} className="ev-input-group">
          <label htmlFor={`Ev${stat.toUpperCase()}`}>
            {stat.toUpperCase()}:
          </label>
          <input 
            type="number" 
            id={`Ev${stat.toUpperCase()}`}
            min="0" 
            max="252" 
            value={evs[stat]}
            onChange={(e) => handleChange(stat, parseInt(e.target.value) || 0)}
            placeholder="0-252 EVs"
          />
        </div>
      ))}
      
      <div className="ev-total">
        <span>Total de EVs: <strong style={{ color: totalEvs > 510 ? 'red' : 'yellow' }}>{totalEvs}</strong>/510</span>
        <span>Vitaminas: <strong>{totalVitaminas}</strong></span>
        <span>Custo Total: <strong>{(custoTotal / 1000).toFixed(1)}</strong>k</span>
      </div>
    </div>
  )
}