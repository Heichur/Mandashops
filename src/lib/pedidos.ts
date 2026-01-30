// src/lib/pedidos.ts
import { getDb } from './firebase'
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
    const db = getDb() 
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
    const db = getDb() 

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

  let conteudoFormatado = `**🎮 Novo Pedido**
👤 **Jogador:** ${pedido.nomeUsuario}
💬 **Discord:** ${pedido.nickDiscord}
🔵 **Pokémon:** ${pedido.pokemon}
🧬 **Tipo:** ${pedido.castradoOuBreedavel}
🌿 **Nature:** ${pedido.natureza}
⚡ **Habilidade:** ${pedido.habilidades}
⚧ **Gênero:** ${pedido.sexo || 'N/A'}
📊 **IVs:** ${linhaIVs}`

  if (pedido.ivsZerados && pedido.ivsZerados !== "Nenhum") {
    conteudoFormatado += `
🔻 **IVs Zerados:** ${pedido.ivsZerados}`
  }

  if (pedido.informacoesAdicionais && pedido.informacoesAdicionais !== "Nenhuma") {
    conteudoFormatado += `
ℹ️ **Info Adicional:** ${pedido.informacoesAdicionais}`
  }

  conteudoFormatado += `
🥚 **Egg Moves:** ${pedido.eggMoves || 'Nenhum'}
✨ **Hidden Ability:** ${pedido.hiddenHabilidade ? 'Sim (+15k)' : 'Não'}
💰 **Preço Total:** ${precoFormatado}`

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