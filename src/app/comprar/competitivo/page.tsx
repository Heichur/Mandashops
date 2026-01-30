// src/app/comprar/competitivo/page.tsx
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
import { getDb } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

const PokemonSelect = dynamic(() => import("@/componets/PokemonSelect"), { ssr: false })
const AbilitySelect = dynamic(() => import("@/componets/AbilitySelect"), { ssr: false })
const EggMovesSelect = dynamic(() => import("@/componets/EggMovesSelect"), { ssr: false })
const MegastoneSelect = dynamic(() => import("@/componets/MegastoneSelect"), { ssr: false })
const EVCalculator = dynamic(() => import("@/componets/EVCalculator"), { ssr: false })

interface EVs {
  hp: number
  atk: number
  def: number
  spa: number
  spd: number
  spe: number
}

export default function CompraCompetitiva() {
  const router = useRouter()
  const [selectedPokemon, setSelectedPokemon] = useState('')
  const [nature, setNature] = useState('')
  const [gender, setGender] = useState('')
  const [ivs, setIvs] = useState('')
  const [breedable, setBreedable] = useState('')
  const [level, setLevel] = useState('100')
  const [habilidade, setHabilidade] = useState('')
  const [hiddenHabilidade, setHiddenHabilidade] = useState(false)
  const [eggMoves, setEggMoves] = useState<string[]>([])
  const [evs, setEvs] = useState<EVs>({
    hp: 0,
    atk: 0,
    def: 0,
    spa: 0,
    spd: 0,
    spe: 0
  })
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async () => {
    if (enviando) return

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

      // Pegar megastone selecionada do DOM ((se não retornar via callback))
      const megastoneElement = document.getElementById('MegastoneSelect') as HTMLSelectElement
      const megastone = megastoneElement?.value || ''

      // Calcular preços
      const calculoIVs = calcularPrecoIVs(dadosIVs)
      const precoBreedavel = (breedable.toLowerCase() === 'breedavel' || breedable.toLowerCase() === 'breedável') ? 10000 : 0
      const precoHidden = hiddenHabilidade ? 15000 : 0
      const precoEggMoves = eggMoves.length * 10000
      const precoLevel = level === '50' ? 40000 : 80000
      const precoMegastone = megastone ? 20000 : 0
      const precoTotal = calculoIVs.preco + precoBreedavel + precoHidden + precoEggMoves + precoLevel + precoMegastone

      // Formatar EVs
      const evsFormatados = `HP: ${evs.hp}, ATK: ${evs.atk}, DEF: ${evs.def}, SPA: ${evs.spa}, SPD: ${evs.spd}, SPE: ${evs.spe}`

      // Montar objeto do pedido
      const pedidoData = {
        nomeUsuario,
        nickDiscord,
        pokemon: selectedPokemon,
        tipoCompra: 'competitivo',
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
        level: parseInt(level),
        evs: evsFormatados,
        megastone: megastone || 'Nenhuma',
        precoTotal,
        timestamp: new Date(),
        status: 'pendente'
      }

      // Salvar no Firestore
      try {
        const db = getDb()
        await addDoc(collection(db, 'pedidos'), pedidoData)
        console.log('Pedido salvo no Firestore com sucesso!')
      } catch (firestoreError) {
        console.error('Erro ao salvar no Firestore:', firestoreError)
       
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
      const megastoneInfo = megastone ? ` + Megastone (+20k)` : ''
      alert(`✅ Pedido enviado com sucesso!

Seu pokémon competitivo já está em preparação, assim que ficar pronto, te notificamos para retirar na loja. Agradecemos a preferência!

🔵 Pokémon: ${selectedPokemon}
📊 IVs: ${dadosIVs.tipoIV}${calculoIVs.foiUpgradado ? ` → ${calculoIVs.tipoFinal} (Upgrade!)` : ''}${haInfo}${megastoneInfo}
⭐ Level: ${level}
💪 EVs: ${evsFormatados}
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
    <section id="ComprandoCompetitivo">
      <h1 id="TituloCompraCompetitivo">
        Compra Competitiva - Escolha o pokémon!
      </h1>
      
      <PokemonSelect 
        onSelect={(pokemon: string) => setSelectedPokemon(pokemon)}
      />
      
      <EggMovesSelect 
        pokemonName={selectedPokemon}
        onMovesChange={(moves) => setEggMoves(moves)}
      />
      
      <AbilitySelect 
        pokemonName={selectedPokemon}
        onSelect={(ability: string, isHidden: boolean) => {
          setHabilidade(ability)
          setHiddenHabilidade(isHidden)
        }}
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
      
      <input 
        type="text" 
        id="IvsComp" 
        placeholder="IVs desejados (ex: F5, 0atk)"
        value={ivs}
        onChange={(e) => setIvs(e.target.value)}
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
      
      <button onClick={handleSubmit} disabled={enviando}>
        {enviando ? 'Enviando...' : 'Enviar Pedido'}
      </button>
      
      <Link href="/comprar">
        <button id="VoltarCompraComp">Voltar</button>
      </Link>
    </section>
  )
}