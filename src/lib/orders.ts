// src/lib/orders.ts
import type { Pedido } from './types'
import { sendOrderWebhook } from './discord'
import { getDb } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function createOrder(orderData: Partial<Pedido>) {
  try {
    const nickname = localStorage.getItem('userNickname')
    const discord = localStorage.getItem('userDiscord')

    if (!nickname || !discord) {
      throw new Error('Usuário não está logado')
    }

    const pedido: Omit<Pedido, 'timestamp'> = {
      nomeUsuario: nickname,
      nickDiscord: discord,
      pokemon: orderData.pokemon || '',
      tipoCompra: orderData.tipoCompra || 'normal',
      castradoOuBreedavel: orderData.castradoOuBreedavel || '',
      natureza: orderData.natureza || '',
      habilidades: orderData.habilidades || '',
      sexo: orderData.sexo || '',
      ivsSolicitados: orderData.ivsSolicitados || '',
      ivsZerados: orderData.ivsZerados || '',
      informacoesAdicionais: orderData.informacoesAdicionais || '',
      ivsFinal: orderData.ivsFinal || '',
      ivsUpgradado: orderData.ivsUpgradado || false,
      detalhesUpgrade: orderData.detalhesUpgrade || '',
      eggMoves: orderData.eggMoves || '',
      hiddenHabilidade: orderData.hiddenHabilidade || false,
      evsDistribuicao: orderData.evsDistribuicao || '',
      totalVitaminas: orderData.totalVitaminas || 0,
      levelPokemon: orderData.levelPokemon || '100',
      precoLevel: orderData.precoLevel || 0,
      megapedra: orderData.megapedra || '',
      precoMegapedra: orderData.precoMegapedra || 0,
      megapedraDocId: orderData.megapedraDocId || '',
      precoBase: orderData.precoBase || 0,
      precoTotal: orderData.precoTotal || 0,
      status: 'pendente'
    }

    // Obtém a instância do Firestore 
    const db = getDb()

    // Salva no Firestore
    const docRef = await addDoc(collection(db, 'pedidos'), {
      ...pedido,
      timestamp: serverTimestamp()
    })

    console.log('Pedido criado com ID:', docRef.id)

    // Envia webhook para Discord
    await sendOrderWebhook({
      pokemon: pedido.pokemon,
      tipoCompra: pedido.tipoCompra || 'normal',
      natureza: pedido.natureza,
      ivs: pedido.ivsSolicitados,
      habilidades: pedido.habilidades,
      eggMoves: pedido.eggMoves,
      sexo: pedido.sexo,
      breedable: pedido.castradoOuBreedavel,
      hiddenAbility: pedido.hiddenHabilidade,
      precoTotal: pedido.precoTotal,
      userNickname: nickname,
      userDiscord: discord
    })

    return { success: true, orderId: docRef.id }
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}