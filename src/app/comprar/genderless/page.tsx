// src/app/comprar/genderless/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import GenderlessPokemonSelect from '@/componets/GenderlessPokemonSelect'
import AbilitySelect from '@/componets/AbilitySelect'
import EggMovesSelect from '@/componets/EggMovesSelect'

export default function CompraGenderless() {
  const [selectedPokemon, setSelectedPokemon] = useState('')
  const [nature, setNature] = useState('')
  const [ivs, setIvs] = useState('')
  const [breedable, setBreedable] = useState('')

  const handleSubmit = async () => {
    console.log({
      pokemon: selectedPokemon,
      nature,
      ivs,
      breedable
    })
  }

  return (
    <section id="ComprandoGenderless">
      <h1 id="TituloCompraGenderless">
        Compra Genderless - Escolha o pokémon!
      </h1>
      
      <GenderlessPokemonSelect 
        onSelect={(pokemon: string) => setSelectedPokemon(pokemon)}
      />
      
      <EggMovesSelect 
        pokemonName={selectedPokemon}
        id="eggMovesSelectGenderless"
      />
      
      <input 
        type="search" 
        id="NatureGenderless" 
        placeholder="Nature do pokemon"
        value={nature}
        onChange={(e) => setNature(e.target.value)}
      />
      
      <AbilitySelect 
        pokemonName={selectedPokemon}
        id="abilitySelectGenderless"
      />
      
      <input 
        type="text" 
        id="IvsGenderless" 
        placeholder="Ivs desejados (F5 ou F6)"
        value={ivs}
        onChange={(e) => setIvs(e.target.value)}
      />
      
      <input 
        type="text" 
        id="CastradoOuBreedavelGenderless" 
        placeholder="Castrado ou Breedavel?"
        value={breedable}
        onChange={(e) => setBreedable(e.target.value)}
      />
      
      <button onClick={handleSubmit}>Enviar Pedido</button>
      
      <Link href="/comprar">
        <button id="VoltarCompraGenderless">Voltar</button>
      </Link>
    </section>
  )
}