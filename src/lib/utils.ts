// src/lib/utils.ts
import { IVsData, IVsCalculation } from './types'

/**
 * Analisa a string de IVs no formato: "F5, 0atk, -spe"
 * - F2-F6: tipo de IV base
 * - 0atk, 0spe: IVs zerados (afetam preço, causam upgrade)
 * - -atk, -spe: informações adicionais (apenas informativo, NÃO afetam preço)
 */
export function analisarIVsUnificado(inputIvs: string): IVsData {
  if (!inputIvs || inputIvs.trim() === '') {
    return {
      valido: false,
      mensagem: `Campo IVs é obrigatório!
Formatos aceitos:
IVs Zerados (afetam preço): 0atk, 0spe, 0hp, etc.
Informações adicionais: -atk, -spe, -hp, etc.
Exemplos:

F5 = F5 por 70k
F5, -atk = F5 por 70k (só informativo)
F5, 0atk = F6 por 90k (upgrade por IV zerado)
F4, 0atk, 0spe = F6 por 90k (upgrade por 2 IVs zerados)`,
      statsZerados: [],
      informacoesAdicionais: [],
      qtdStatsZerados: 0
    }
  }

  const partes = inputIvs.split(',').map(parte => parte.trim()).filter(parte => parte !== '')
  let tipoIV: string | null = null
  const statsZerados: string[] = []
  const informacoesAdicionais: string[] = []
  const erros: string[] = []

  for (const parte of partes) {
    const parteUpper = parte.toUpperCase()
    
    // Verifica se é tipo de IV (F2-F6)
    if (/^F[2-6]$/.test(parteUpper)) {
      if (tipoIV !== null) {
        erros.push('Apenas um tipo de IV é permitido')
      } else {
        tipoIV = parteUpper
      }
    }
    // Verifica se é IV zerado (0atk, 0spe, etc.) - AFETA PREÇO
    else if (/^0(hp|atk|def|spa|spd|spe|attack|defense|special|speed)$/i.test(parte.toLowerCase())) {
      const statNormalizado = parte.toLowerCase()
        .replace('attack', 'atk')
        .replace('defense', 'def')
        .replace('special', 'spa')
        .replace('speed', 'spe')
      
      if (!statsZerados.includes(statNormalizado)) {
        statsZerados.push(statNormalizado)
      }
    }
    // Verifica se é informação adicional (-atk, -spe, etc.) - NÃO AFETA PREÇO
    else if (/^-(hp|atk|def|spa|spd|spe|attack|defense|special|speed)$/i.test(parte.toLowerCase())) {
      const statNormalizado = parte.toLowerCase()
        .replace('attack', 'atk')
        .replace('defense', 'def')
        .replace('special', 'spa')
        .replace('speed', 'spe')
      
      if (!informacoesAdicionais.includes(statNormalizado)) {
        informacoesAdicionais.push(statNormalizado)
      }
    }
    else {
      erros.push(`"${parte}" não é um formato válido`)
    }
  }

  if (!tipoIV) {
    erros.push('É obrigatório especificar um tipo de IV (F2-F6)')
  }

  if (erros.length > 0) {
    return {
      valido: false,
      mensagem: `Erros encontrados: ${erros.join(', ')}

Formatos corretos: (LEMBRANDO É NECESSÁRIO SEPARAR POR VÍRGULA!!
EXEMPLO: F5, 0atk  | Se for dois IVs zerados: F4, 0atk, 0spe)

Tipos IV: F2, F3, F4, F5, F6
IVs zerados: 0atk, 0spe, 0hp, etc. (afetam preço)
Informações: -atk, -spe, -hp, etc. (apenas informativo)`,
      statsZerados: [],
      informacoesAdicionais: [],
      qtdStatsZerados: 0
    }
  }

  return {
    valido: true,
    tipoIV: tipoIV!,
    statsZerados,
    informacoesAdicionais,
    qtdStatsZerados: statsZerados.length
  }
}

/**
 * Calcula o preço dos IVs com sistema de upgrade
 * Lógica de upgrade:
 * - F4 + 1 IV zerado = F5
 * - F4 + 2+ IVs zerados = F6
 * - F5 + 1+ IV zerado = F6
 * 
 * Preços base (mesmos para NORMAL e COMPETITIVO):
 * - F6 = 90k
 * - F5 = 70k
 * - F4 = 40k
 * - F3 = 30k
 * - F2 = 25k
 */
export function calcularPrecoIVs(dadosIVs: IVsData): IVsCalculation {
  if (!dadosIVs.valido || !dadosIVs.tipoIV) {
    return {
      preco: 0,
      tipoFinal: '',
      foiUpgradado: false,
      detalhesUpgrade: ''
    }
  }

  let tipoIVFinal = dadosIVs.tipoIV
  const qtdZerados = dadosIVs.qtdStatsZerados
  const tipoOriginal = dadosIVs.tipoIV

  // Sistema de upgrade: F4 + IVs zerados pode virar F5 ou F6
  if (tipoIVFinal === 'F4') {
    if (qtdZerados >= 2) {
      tipoIVFinal = 'F6'
    } else if (qtdZerados === 1) {
      tipoIVFinal = 'F5'
    }
  } 
  // F5 + pelo menos 1 IV zerado = F6
  else if (tipoIVFinal === 'F5' && qtdZerados >= 1) {
    tipoIVFinal = 'F6'
  }

  // Tabela de preços (mesma para NORMAL e COMPETITIVO)
  const precos: Record<string, number> = {
    F6: 90000,
    F5: 70000,
    F4: 40000,
    F3: 30000,
    F2: 25000
  }

  const foiUpgradado = tipoIVFinal !== tipoOriginal
  let detalhesUpgrade = ''

  if (foiUpgradado) {
    const motivoUpgrade = qtdZerados === 1 ? '1 IV zerado' : `${qtdZerados} IVs zerados`
    detalhesUpgrade = `Upgrade: ${tipoOriginal} → ${tipoIVFinal} (${motivoUpgrade})`
  }

  return {
    preco: precos[tipoIVFinal] || 0,
    tipoFinal: tipoIVFinal,
    foiUpgradado,
    detalhesUpgrade
  }
}