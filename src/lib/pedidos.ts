// src/lib/pedidos.ts
import { db } from './firebase'
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { analisarIVsUnificado, calcularPrecoIVs } from './utils'
import type { Pedido } from './types'

// Função para enviar webhook
export async function enviarWebhook(conteudo: string, webhookUrl: string): Promise<boolean> {
  if (!webhookUrl) return false

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: conteudo })
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao enviar webhook:', error)
    return false
  }
}

// Função para buscar URL do webhook
export async function buscarWebhookUrl(): Promise<string> {
  try {
    if (!db) return ''
    
    const configDoc = await getDoc(doc(db, 'configuracoes', 'admin'))
    if (configDoc.exists()) {
      const data = configDoc.data()
      return data.webhookUrl || data.webhook_url || ''
    }
  } catch (error) {
    console.error('Erro ao buscar webhook:', error)
  }
  return ''
}

// Função para registrar pedido no ranking mensal
export async function registrarPedidoRanking(nomeUsuario: string): Promise<void> {
  try {
    if (!db) return

    const agora = new Date()
    const chaveMes = `compradores_${agora.getFullYear()}_${(agora.getMonth() + 1).toString().padStart(2, '0')}`
    
    const compradorRef = doc(db, 'compradores', chaveMes)
    const compradorDoc = await getDoc(compradorRef)
    
    if (compradorDoc.exists()) {
      const dados = compradorDoc.data()
      const novoValor = (dados[nomeUsuario] || 0) + 1
      await updateDoc(compradorRef, { [nomeUsuario]: novoValor })
    } else {
      await addDoc(collection(db, 'compradores'), { 
        id: chaveMes,
        [nomeUsuario]: 1 
      })
    }
  } catch (error) {
    console.error('Erro ao registrar no ranking:', error)
  }
}

// Função para formatar pedido para o webhook
export function formatarPedidoWebhook(pedido: any, dadosIVs: any, calculoIVs: any): string {
  const precoFormatado = pedido.precoTotal >= 1000
    ? `${Math.round(pedido.precoTotal / 1000)}k`
    : `${pedido.precoTotal}`

  let linhaIVs = dadosIVs.tipoIV
  if (calculoIVs.foiUpgradado) {
    linhaIVs += ` → ${calculoIVs.tipoFinal} (upgrade)`
  }

  // Definir título e emoji baseado no tipo de compra
  const tipoCompra = pedido.tipoCompra?.toLowerCase() || 'normal'
  let titulo = ''
  let emoji = ''
  
  if (tipoCompra === 'competitivo') {
    titulo = '🎮 PEDIDO COMPETITIVO'
    emoji = '🎮'
  } else if (tipoCompra === 'genderless') {
    titulo = '🔮 PEDIDO GENDERLESS'
    emoji = '🔮'
  } else {
    titulo = '📦 NOVO PEDIDO'
    emoji = '📦'
  }

  let conteudoFormatado = `**${titulo}**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 **Jogador:** ${pedido.nomeUsuario}
💬 **Discord:** ${pedido.nickDiscord}

${emoji} **TIPO DE COMPRA:** ${tipoCompra.toUpperCase()}
🔵 **Pokémon:** ${pedido.pokemon}
🧬 **Castrado/Breedável:** ${pedido.castradoOuBreedavel}
🌿 **Natureza:** ${pedido.natureza}
⚡ **Habilidade:** ${pedido.habilidades}`

  // Informações específicas de competitivo
  if (tipoCompra === 'competitivo' && pedido.evs) {
    conteudoFormatado += `
⚡ **EVs:** ${pedido.evs}
🎯 **Level:** ${pedido.level}`
  }

  // Informações específicas de genderless
  if (tipoCompra === 'genderless') {
    const tipoBreed = pedido.castradoOuBreedavel?.toLowerCase().includes('breedavel') || 
                      pedido.castradoOuBreedavel?.toLowerCase().includes('breedável') 
                      ? 'Breedável' : 'Castrado'
    conteudoFormatado += `
🔮 **Tipo Genderless:** ${pedido.ivsSolicitados} ${tipoBreed}`
  }

  // Gênero (apenas se não for genderless)
  if (pedido.sexo && pedido.sexo !== 'Genderless' && pedido.sexo !== 'N/A') {
    conteudoFormatado += `
⚧ **Gênero:** ${pedido.sexo}`
  }

  conteudoFormatado += `
📊 **IVs:** ${linhaIVs}`

  if (pedido.ivsZerados && pedido.ivsZerados !== "Nenhum") {
    conteudoFormatado += `
🔻 **IVs Zerados:** ${pedido.ivsZerados}`
  }

  if (pedido.informacoesAdicionais && pedido.informacoesAdicionais !== "Nenhuma") {
    conteudoFormatado += `
ℹ️ **Info Adicional:** ${pedido.informacoesAdicionais}`
  }

  if (pedido.eggMoves && pedido.eggMoves !== 'Nenhum') {
    conteudoFormatado += `
🥚 **Egg Moves:** ${pedido.eggMoves}`
  }

  conteudoFormatado += `
✨ **Hidden Ability:** ${pedido.hiddenHabilidade ? 'Sim (+15k)' : 'Não'}`

  // ✅ ADICIONADO: Megastone no webhook (apenas se selecionada)
  if (pedido.megastone && pedido.megastone !== 'Nenhuma' && pedido.megastone !== '') {
    const precoMega = pedido.megastonePrice || 0
    const precoMegaFormatado = precoMega >= 1000 ? `${Math.round(precoMega / 1000)}k` : `${precoMega}`
    conteudoFormatado += `
💎 **Megastone:** ${pedido.megastone} (+${precoMegaFormatado})`
  }

  conteudoFormatado += `

💰 **PREÇO TOTAL:** ${precoFormatado}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

  return conteudoFormatado
}

// Validação de campos obrigatórios
export function validarCamposObrigatorios(dados: any): { valido: boolean, mensagem: string } {
  if (!dados.pokemon) {
    return { valido: false, mensagem: 'Selecione um Pokémon!' }
  }
    
  if (!dados.habilidades) {
    return { valido: false, mensagem: 'Selecione uma habilidade!' }
  }
  
  if (!dados.ivs) {
    return { valido: false, mensagem: 'Digite os IVs desejados!' }
  }
  
  if (!dados.breedable) {
    return { valido: false, mensagem: 'Informe se é Castrado ou Breedável!' }
  }
  
  return { valido: true, mensagem: '' }
}