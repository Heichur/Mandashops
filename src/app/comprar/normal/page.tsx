// src/app/comprar/normal/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import PokemonSelect from '@/componets/PokemonSelect'
import AbilitySelect from '@/componets/AbilitySelect'
import EggMovesSelect from '@/componets/EggMovesSelect'

export default function CompraNormal() {
  const [selectedPokemon, setSelectedPokemon] = useState('')
  const [nature, setNature] = useState('')
  const [gender, setGender] = useState('')
  const [ivs, setIvs] = useState('')
  const [breedable, setBreedable] = useState('')

  const handleSubmit = async () => {
    console.log({
      pokemon: selectedPokemon,
      nature,
      gender,
      ivs,
      breedable
    })
  }

  return (
    <section id="Comprando">
      <h1 id="TituloCompra">Escolha o pokémon!</h1>
      
      <PokemonSelect 
        onSelect={(pokemon: string) => setSelectedPokemon(pokemon)}
      />
      
      <EggMovesSelect 
        pokemonName={selectedPokemon}
      />
      
      <input 
        type="search" 
        id="Nature" 
        placeholder="Nature do pokemon"
        value={nature}
        onChange={(e) => setNature(e.target.value)}
      />
      
      <AbilitySelect 
        pokemonName={selectedPokemon}
      />
      
      <input 
        type="text" 
        id="GeneroDoPoke" 
        placeholder="Macho ou Femea / Não é obrigatório"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      />
      
      <input 
        type="text" 
        id="Ivs" 
        placeholder="Ivs desejados"
        value={ivs}
        onChange={(e) => setIvs(e.target.value)}
      />
      
      <input 
        type="text" 
        id="CastradoOuBreedavel" 
        placeholder="Castrado ou Breedavel?"
        value={breedable}
        onChange={(e) => setBreedable(e.target.value)}
      />
      
      <button onClick={handleSubmit}>Enviar Pedido</button>
      
      <Link href="/comprar">
        <button id="VoltarCompra">Voltar</button>
      </Link>
    </section>
  )
}