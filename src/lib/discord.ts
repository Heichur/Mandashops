// src/lib/discord.ts

interface OrderWebhookData {
  pokemon: string
  tipoCompra: string
  natureza: string
  ivs: string
  habilidades: string
  eggMoves: string
  sexo?: string
  breedable: string
  hiddenAbility: boolean
  precoTotal: number
  userNickname: string
  userDiscord: string
}

export async function sendOrderWebhook(orderData: OrderWebhookData) {
  const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('Webhook URL não configurada')
    return { success: false, error: 'Webhook não configurado' }
  }

  try {
    const embed = {
      title: '🎮 Novo Pedido Recebido!',
      color: 0x00ff00,
      fields: [
        {
          name: '👤 Cliente',
          value: `**Minecraft:** ${orderData.userNickname}\n**Discord:** ${orderData.userDiscord}`,
          inline: false
        },
        {
          name: '🎯 Pokémon',
          value: orderData.pokemon,
          inline: true
        },
        {
          name: '📋 Tipo',
          value: orderData.tipoCompra,
          inline: true
        },
        {
          name: '🧬 Nature',
          value: orderData.natureza,
          inline: true
        },
        {
          name: '⚡ IVs',
          value: orderData.ivs,
          inline: true
        },
        {
          name: '💪 Habilidade',
          value: `${orderData.habilidades}${orderData.hiddenAbility ? ' (Hidden)' : ''}`,
          inline: true
        },
        {
          name: '🔄 Breedável',
          value: orderData.breedable,
          inline: true
        }
      ],
      footer: {
        text: `Preço Total: ${(orderData.precoTotal / 1000).toFixed(0)}k`
      },
      timestamp: new Date().toISOString()
    }

    if (orderData.sexo) {
      embed.fields.push({
        name: '⚧️ Sexo',
        value: orderData.sexo,
        inline: true
      })
    }

    if (orderData.eggMoves) {
      embed.fields.push({
        name: '🥚 Egg Moves',
        value: orderData.eggMoves,
        inline: false
      })
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    })

    if (!response.ok) {
      throw new Error(`Webhook falhou: ${response.status}`)
    }

    console.log('Webhook enviado com sucesso!')
    return { success: true }
  } catch (error) {
    console.error('Erro ao enviar webhook:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}