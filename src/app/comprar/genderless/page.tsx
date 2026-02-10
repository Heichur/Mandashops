// src/app/comprar/genderless/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { analisarIVsGenderless, calcularPrecoIVsGenderless } from '@/lib/utilsGenderless'
import { 
  enviarWebhook, 
  buscarWebhookUrl, 
  registrarPedidoRanking, 
  formatarPedidoWebhook,
  validarCamposObrigatorios 
} from '@/lib/pedidos'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

// Importações dinâmicas
const GenderlessPokemonSelect = dynamic(() => import("@/componets/GenderlessPokemonSelect"), { 
  ssr: false,
  loading: () => <p>Carregando...</p>
})

const AbilitySelect = dynamic(() => import("@/componets/AbilitySelect"), { 
  ssr: false,
  loading: () => <p>Carregando...</p>
})

const EggMovesSelect = dynamic(() => import("@/componets/EggMovesSelect"), { 
  ssr: false,
  loading: () => <p>Carregando...</p>
})

export default function CompraGenderless() {
  const router = useRouter()
  const [selectedPokemon, setSelectedPokemon] = useState('')
  const [nature, setNature] = useState('')
  const [ivs, setIvs] = useState('')
  const [breedable, setBreedable] = useState('')
  const [habilidade, setHabilidade] = useState('')
  const [hiddenHabilidade, setHiddenHabilidade] = useState(false)
  const [eggMoves, setEggMoves] = useState<string[]>([])
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async () => {
    if (enviando) return

    // Pegar dados do usuário do localStorage
    const nomeUsuario = localStorage.getItem('userNickname') || ''
    const nickDiscord = localStorage.getItem('userDiscord') || ''

    if (!nomeUsuario || !nickDiscord) {
      alert('Por favor, faça login primeiro!')
      router.push('/login')
      return
    }

    // Validar campos obrigatórios
    const validacao = validarCamposObrigatorios({
      pokemon: selectedPokemon,
      habilidades: habilidade,
      ivs,
      breedable
    })

    if (!validacao.valido) {
      alert(validacao.mensagem)
      return
    }

    setEnviando(true)

    try {
      // Analisar IVs com validação GENDERLESS (apenas F5 e F6, máximo 1 stat zerado)
      const dadosIVs = analisarIVsGenderless(ivs)
      
      console.log('Dados IVs Genderless:', dadosIVs)
      
      if (!dadosIVs.valido) {
        alert(dadosIVs.mensagem)
        setEnviando(false)
        return
      }

      // Calcular preços GENDERLESS (preços especiais: F5=120k, F6=190k)
      const calculoIVs = calcularPrecoIVsGenderless(dadosIVs)
      
      console.log('Cálculo IVs Genderless:', calculoIVs)
      
      // Usar o preço calculado pela função específica do genderless
      const precoBaseGenderless = calculoIVs.preco
      
      const precoHidden = hiddenHabilidade ? 15000 : 0
      const precoEggMoves = eggMoves.length * 10000
      const precoTotal = precoBaseGenderless + precoHidden + precoEggMoves
      
      console.log('Preço total calculado:', precoTotal)
      console.log('Breakdown: Base=', precoBaseGenderless, 'Hidden=', precoHidden, 'EggMoves=', precoEggMoves)

      // Determinar tipo (Breedável ou Castrado) baseado no IV final
      const tipoBreed = calculoIVs.tipoFinal === 'F6' ? 'Castrado' : 'Breedável'

      // Montar objeto do pedido
      const pedidoData = {
        nomeUsuario,
        nickDiscord,
        pokemon: selectedPokemon,
        tipoCompra: 'genderless',
        castradoOuBreedavel: tipoBreed,
        natureza: nature,
        habilidades: habilidade,
        sexo: 'Genderless',
        ivsSolicitados: dadosIVs.tipoIV,
        ivsZerados: dadosIVs.statsZerados.join(', ') || 'Nenhum',
        informacoesAdicionais: dadosIVs.informacoesAdicionais.join(', ') || 'Nenhuma',
        ivsFinal: calculoIVs.tipoFinal,
        ivsUpgradado: calculoIVs.foiUpgradado,
        detalhesUpgrade: calculoIVs.detalhesUpgrade || '',
        eggMoves: eggMoves.join(', ') || 'Nenhum',
        hiddenHabilidade,
        precoTotal,
        timestamp: new Date(),
        status: 'pendente'
      }

      // Salvar no Firestore
      if (db) {
        await addDoc(collection(db, 'pedidos'), pedidoData)
      }

      // Registrar no ranking
      await registrarPedidoRanking(nomeUsuario)

      // Enviar webhook para canal GENDERLESS específico
      const webhookGenderless = process.env.NEXT_PUBLIC_DISCORD_GENDERLESS_WEBHOOK_URL
      if (webhookGenderless) {
        const mensagemWebhook = formatarPedidoWebhook(pedidoData, dadosIVs, calculoIVs)
        await enviarWebhook(mensagemWebhook, webhookGenderless)
      } else {
        console.warn('Webhook genderless não configurada, usando webhook padrão')
        const webhookUrl = await buscarWebhookUrl()
        if (webhookUrl) {
          const mensagemWebhook = formatarPedidoWebhook(pedidoData, dadosIVs, calculoIVs)
          await enviarWebhook(mensagemWebhook, webhookUrl)
        }
      }

      // Mostrar mensagem de sucesso
      const haInfo = hiddenHabilidade ? ' + Hidden Ability (+15k)' : ''
      const eggMovesInfo = eggMoves.length > 0 ? ` + ${eggMoves.length} Egg Move(s) (+${eggMoves.length * 10}k)` : ''
      
      alert(`✅ PEDIDO GENDERLESS ENVIADO COM SUCESSO!

Seu pokémon genderless já está em preparação, assim que ficar pronto, te notificamos para retirar na loja. Agradecemos a preferência!

🔮 TIPO: Compra Genderless
🔵 Pokémon: ${selectedPokemon} (${tipoBreed})
📊 IVs: ${dadosIVs.tipoIV}${calculoIVs.foiUpgradado ? ` → ${calculoIVs.tipoFinal} (Upgrade!)` : ''}
${dadosIVs.statsZerados.length > 0 ? `🔻 Stats Zerados: ${dadosIVs.statsZerados.join(', ')}` : ''}
${haInfo}${eggMovesInfo}
💰 Preço total: ${Math.round(precoTotal/1000)}k`)

      // Redirecionar para página inicial
      router.push('/')

    } catch (error) {
      console.error('Erro completo ao enviar pedido:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
      alert(`❌ Erro ao enviar pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Verifique o console para mais detalhes.`)
    } finally {
      setEnviando(false)
    }
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
        onMovesChange={(moves) => setEggMoves(moves)}
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
        onSelect={(ability: string, isHidden: boolean) => {
          setHabilidade(ability)
          setHiddenHabilidade(isHidden)
        }}
        id="abilitySelectGenderless"
      />
      
      <input 
        type="text" 
        id="IvsGenderless" 
        placeholder="IVs desejados (F5 ou F6 apenas, máx 1 stat zerado)"
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
      
      <button onClick={handleSubmit} disabled={enviando}>
        {enviando ? 'Enviando...' : 'Enviar Pedido'}
      </button>
      
      <Link href="/">
        <button id="VoltarCompraGenderless">Voltar</button>
      </Link>
    </section>
  )
}