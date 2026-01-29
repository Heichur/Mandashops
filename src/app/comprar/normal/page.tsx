// src/app/comprar/normal/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PokemonSelect from '@/componets/PokemonSelect'
import AbilitySelect from '@/componets/AbilitySelect'
import EggMovesSelect from '@/componets/EggMovesSelect'
import { createOrder } from '@/lib/orders'

export default function CompraNormal() {
  const router = useRouter()
  const [selectedPokemon, setSelectedPokemon] = useState('')
  const [nature, setNature] = useState('')
  const [gender, setGender] = useState('')
  const [ivs, setIvs] = useState('')
  const [breedable, setBreedable] = useState('')
  const [selectedAbility, setSelectedAbility] = useState('')
  const [isHiddenAbility, setIsHiddenAbility] = useState(false)
  const [selectedEggMoves, setSelectedEggMoves] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Validações
    if (!selectedPokemon) {
      alert('Por favor, selecione um Pokémon!')
      return
    }

    if (!nature) {
      alert('Por favor, informe a nature!')
      return
    }

    if (!ivs) {
      alert('Por favor, informe os IVs desejados!')
      return
    }

    if (!breedable) {
      alert('Por favor, informe se é castrado ou breedável!')
      return
    }

    setIsSubmitting(true)

    try {
      // Cálculo de preço
      const basePrice = 50000
      const eggMovesPrice = selectedEggMoves.length * 10000
      const hiddenAbilityPrice = isHiddenAbility ? 15000 : 0
      const totalPrice = basePrice + eggMovesPrice + hiddenAbilityPrice

      const result = await createOrder({
        pokemon: selectedPokemon,
        tipoCompra: 'normal',
        natureza: nature,
        sexo: gender,
        ivsSolicitados: ivs,
        castradoOuBreedavel: breedable,
        habilidades: selectedAbility,
        eggMoves: selectedEggMoves.join(', '),
        hiddenHabilidade: isHiddenAbility,
        precoBase: basePrice,
        precoTotal: totalPrice
      })

      if (result.success) {
        alert('Pedido enviado com sucesso! 🎉')
        router.push('/')
      } else {
        alert(`Erro ao enviar pedido: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao enviar pedido. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="Comprando">
      <h1 id="TituloCompra">Escolha o pokémon!</h1>

      <PokemonSelect
        onSelect={(pokemon: string) => setSelectedPokemon(pokemon)}
      />

      <EggMovesSelect
        pokemonName={selectedPokemon}
        onMovesChange={(moves) => setSelectedEggMoves(moves)}
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
        onSelect={(ability: string, isHidden: boolean) => {
          setSelectedAbility(ability)
          setIsHiddenAbility(isHidden)
        }}
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

      <button 
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
      </button>

      <Link href="/comprar">
        <button id="VoltarCompra">Voltar</button>
      </Link>
    </section>
  )
}