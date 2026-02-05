// src/components/CompetitiveUsage.tsx
'use client'

import { useState, useEffect } from 'react'

interface CompetitiveUsageProps {
  pokemonName: string
  baseStats?: {
    hp: number
    attack: number
    defense: number
    specialAttack: number
    specialDefense: number
    speed: number
  }
  types?: string[]
}

const CompetitiveUsage = ({ pokemonName, baseStats, types }: CompetitiveUsageProps) => {
  const [overview, setOverview] = useState<string>('')
  const [tier, setTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Função para gerar overview baseado nos stats
  const generateFallbackOverview = () => {
    if (!baseStats) {
      return `${pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)} é um Pokémon com potencial competitivo. Análise detalhada disponível no Smogon.`
    }

    const { attack, specialAttack, speed, hp, defense, specialDefense } = baseStats
    
    // Determinar role principal
    const isPhysical = attack > specialAttack
    const mainOffensiveStat = Math.max(attack, specialAttack)
    const role = isPhysical ? 'Physical Attacker' : 'Special Attacker'
    const statName = isPhysical ? 'Ataque' : 'Ataque Especial'
    
    // Determinar velocidade
    let speedDescription = ''
    if (speed >= 110) {
      speedDescription = 'alta velocidade para superar a maioria dos oponentes'
    } else if (speed >= 80) {
      speedDescription = 'velocidade moderada para competir no metagame'
    } else {
      speedDescription = 'velocidade baixa, necessitando de suporte para se mover primeiro'
    }
    
    // Determinar bulk
    const totalBulk = hp + defense + specialDefense
    let bulkDescription = ''
    if (totalBulk >= 300) {
      bulkDescription = 'boa resistência para tankar hits'
    } else if (totalBulk >= 240) {
      bulkDescription = 'resistência moderada'
    } else {
      bulkDescription = 'baixa resistência, focando em ofensiva pura'
    }
    
    // Determinar estratégia
    let strategy = ''
    if (mainOffensiveStat >= 120 && speed >= 100) {
      strategy = 'Usado estrategicamente como wallbreaker veloz para quebrar times defensivos. Entre após eliminar checks ou contra alvos que não resistem sua tipagem'
    } else if (mainOffensiveStat >= 120) {
      strategy = 'Usado estrategicamente como wallbreaker poderoso. Entre após pivots ou com suporte de Trick Room para maximizar o dano'
    } else if (speed >= 110) {
      strategy = 'Usado estrategicamente como revenge killer veloz. Entre para finalizar oponentes fragilizados ou para forçar trocas'
    } else if (totalBulk >= 280) {
      strategy = 'Usado estrategicamente como pivô defensivo. Entre múltiplas vezes durante a partida para controlar o ritmo e absorver hits'
    } else {
      strategy = 'Usado estrategicamente em nichos específicos. Entre contra matchups favoráveis ou como suporte para o time'
    }
    
    const typesStr = types && types.length > 0 ? ` (${types.join('/')})` : ''
    
    return `${role}. Foca em ${statName} (${mainOffensiveStat}) para causar dano consistente, com ${speedDescription} e ${bulkDescription}. ${strategy}${typesStr}. Oferece presença ofensiva ${mainOffensiveStat >= 120 ? 'devastadora' : 'sólida'} para pressionar o time adversário.`
  }

  useEffect(() => {
    fetchCompetitiveData()
  }, [pokemonName])

  const fetchCompetitiveData = async () => {
    setLoading(true)
    try {
      // Buscar overview text do Smogon via API route
      const response = await fetch(`/api/smogon-overview?pokemon=${pokemonName}`)
      const data = await response.json()
      
      if (data.overview && data.source === 'smogon') {
        // Usou dados reais do Smogon
        setOverview(data.overview)
        setTier(data.tier)
      } else {
        // Gerar overview baseado em stats
        setOverview(generateFallbackOverview())
        setTier(null)
      }
    } catch (error) {
      console.error('Erro ao buscar dados competitivos:', error)
      setOverview(generateFallbackOverview())
      setTier(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="competitive-usage">
        <h3 className="competitive-header">⚔️ Uso Competitivo</h3>
        <div className="competitive-loading-container">
          <div className="competitive-loading-spinner"></div>
          <p className="competitive-loading">Carregando análise competitiva...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="competitive-usage">
      <div className="competitive-title-container">
        <div className="competitive-title-left">
          <h3 className="competitive-header">⚔️ Uso Competitivo</h3>
          {tier && (
            <span className="competitive-tier-badge">{tier}</span>
          )}
        </div>
      </div>
      
      <div className="competitive-overview-box">
        <p className="competitive-overview">{overview}</p>
      </div>

      <div className="competitive-footer">
        <a 
          href={`https://www.smogon.com/dex/sv/pokemon/${pokemonName.toLowerCase()}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="competitive-smogon-link"
        >
          📖 Ver análise completa no Smogon
        </a>
      </div>
    </div>
  )
}

export default CompetitiveUsage