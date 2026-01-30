// src/app/comprar/normal/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { analisarIVsUnificado, calcularPrecoIVs } from '@/lib/utils'
import { 
  enviarWebhook, 
  buscarWebhookUrl, 
  registrarPedidoRanking, 
  formatarPedidoWebhook,
  validarCamposObrigatorios 
} from '@/lib/pedidos'
import { getDb } from '@/lib/firebase' // MUDANÇA AQUI: usar getDb em vez de db
import { collection, addDoc } from 'firebase/firestore'

const PokemonSelect = dynamic(() => import("@/componets/PokemonSelect"), { ssr: false })
const AbilitySelect = dynamic(() => import("@/componets/AbilitySelect"), { ssr: false })
const EggMovesSelect = dynamic(() => import("@/componets/EggMovesSelect"), { ssr: false })

export default function CompraNormal() {
  const router = useRouter()
  const [selectedPokemon, setSelectedPokemon] = useState('')
  const [nature, setNature] = useState('')
  const [gender, setGender] = useState('')
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
      // Analisar IVs
      const dadosIVs = analisarIVsUnificado(ivs)
      
      if (!dadosIVs.valido) {
        alert(dadosIVs.mensagem)
        setEnviando(false)
        return
      }

      // Calcular preços
      const calculoIVs = calcularPrecoIVs(dadosIVs)
      const precoBreedavel = (breedable.toLowerCase() === 'breedavel' || breedable.toLowerCase() === 'breedável') ? 10000 : 0
      const precoHidden = hiddenHabilidade ? 15000 : 0
      const precoEggMoves = eggMoves.length * 10000
      const precoTotal = calculoIVs.preco + precoBreedavel + precoHidden + precoEggMoves

      // Montar objeto do pedido
      const pedidoData = {
        nomeUsuario,
        nickDiscord,
        pokemon: selectedPokemon,
        tipoCompra: 'normal',
        castradoOuBreedavel: breedable,
        natureza: nature,
        habilidades: habilidade,
        sexo: gender || 'N/A',
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

      // Salvar no Firestore - MUDANÇA AQUI
      try {
        const db = getDb() // Obtém a instância do Firestore
        await addDoc(collection(db, 'pedidos'), pedidoData)
        console.log('Pedido salvo no Firestore com sucesso!')
      } catch (firestoreError) {
        console.error('Erro ao salvar no Firestore:', firestoreError)
        // Continua o fluxo mesmo se falhar no Firestore
      }

      // Registrar no ranking
      await registrarPedidoRanking(nomeUsuario)

      // Enviar webhook
      const webhookUrl = await buscarWebhookUrl()
      if (webhookUrl) {
        const mensagemWebhook = formatarPedidoWebhook(pedidoData, dadosIVs, calculoIVs)
        await enviarWebhook(mensagemWebhook, webhookUrl)
      }

      // Mostrar mensagem de sucesso
      const haInfo = hiddenHabilidade ? ' + Hidden Ability (+15k)' : ''
      alert(`✅ Pedido enviado com sucesso!

Seu pokémon já está em preparação, assim que ficar pronto, te notificamos para retirar na loja. Agradecemos a preferência!

🔵 Pokémon: ${selectedPokemon}
📊 IVs: ${dadosIVs.tipoIV}${calculoIVs.foiUpgradado ? ` → ${calculoIVs.tipoFinal} (Upgrade!)` : ''}${haInfo}
💰 Preço total: ${Math.round(precoTotal/1000)}k`)

      // Redirecionar para página inicial
      router.push('/')

    } catch (error) {
      console.error('Erro ao enviar pedido:', error)
      alert('❌ Erro ao enviar pedido. Tente novamente.')
    } finally {
      setEnviando(false)
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
        onMovesChange={(moves) => setEggMoves(moves)}
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
          setHabilidade(ability)
          setHiddenHabilidade(isHidden)
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
        placeholder="Ivs desejados (ex: F5, 0atk)"
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
      
      <button onClick={handleSubmit} disabled={enviando}>
        {enviando ? 'Enviando...' : 'Enviar Pedido'}
      </button>
      
      <Link href="/comprar">
        <button id="VoltarCompra">Voltar</button>
      </Link>
    </section>
  )
}