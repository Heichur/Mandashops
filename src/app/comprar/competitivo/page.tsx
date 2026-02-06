// src/app/comprar/competitivo/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import PokemonSelect from '@/componets/PokemonSelect'
import AbilitySelect from '@/componets/AbilitySelect'
import EggMovesSelect from '@/componets/EggMovesSelect'
import MegastoneSelect from '@/componets/MegastoneSelect'
import dynamic from 'next/dynamic'
import EVCalculator from '@/componets/EVCalculator'

const IVSelector = dynamic(() => import("@/componets/IVSelector"), { ssr: false })

interface EVs {
  hp: number
  atk: number
  def: number
  spa: number
  spd: number
  spe: number
}

export default function CompraCompetitiva() {
  const [selectedPokemon, setSelectedPokemon] = useState('')
  const [nature, setNature] = useState('')
  const [gender, setGender] = useState('')
  const [ivs, setIvs] = useState('')
  const [breedable, setBreedable] = useState('')
  const [level, setLevel] = useState('100')
  const [evs, setEvs] = useState<EVs>({
    hp: 0,
    atk: 0,
    def: 0,
    spa: 0,
    spd: 0,
    spe: 0
  })

  const handleSubmit = async () => {
    console.log({
      pokemon: selectedPokemon,
      nature,
      gender,
      ivs,
      breedable,
      level,
      evs
    })
  }

  return (
    <section id="ComprandoCompetitivo">
      <h1 id="TituloCompraCompetitivo">
        Compra Competitiva - Escolha o pokémon!
      </h1>
      
      {/* IMPORTANTE: Passar excludeLegendaries={true} */}
      <PokemonSelect 
        onSelect={(pokemon: string) => setSelectedPokemon(pokemon)}
        id="pokemonSelectComp"
        excludeLegendaries={true}
      />
      
      <EggMovesSelect 
        pokemonName={selectedPokemon}
        id="eggMovesSelectComp"
      />
      
      <AbilitySelect 
        pokemonName={selectedPokemon}
        id="abilitySelectComp"
      />
      
      <MegastoneSelect />
      
      <input 
        type="search" 
        id="NatureComp" 
        placeholder="Nature do pokemon"
        value={nature}
        onChange={(e) => setNature(e.target.value)}
      />
      
      <input 
        type="text" 
        id="CastradoOuBreedavelComp" 
        placeholder="Castrado ou Breedavel?"
        value={breedable}
        onChange={(e) => setBreedable(e.target.value)}
      />
      
      <input 
        type="text" 
        id="GeneroDoPokemonComp" 
        placeholder="Macho ou Femea / Não é obrigatório"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      />
      
      <IVSelector 
        onChange={(ivsString) => setIvs(ivsString)}
      />
      
      <EVCalculator 
        onChange={(newEvs: EVs) => setEvs(newEvs)}
      />
      
      <div className="level-section">
        <h3 className="level-title">Level do Pokémon</h3>
        <select 
          id="LevelPokemon"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="50">Level 50 (40k)</option>
          <option value="100">Level 100 (80k)</option>
        </select>
      </div>
      
      <button onClick={handleSubmit}>Enviar Pedido</button>
      
      <Link href="/">
        <button id="VoltarCompraComp">Voltar</button>
      </Link>
    </section>
  )
}