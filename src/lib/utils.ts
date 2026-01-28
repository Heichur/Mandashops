// src/lib/utils.ts
import { IVsData, IVsCalculation } from './types'

export function analisarIVsUnificado(inputIvs: string): IVsData {
  if (!inputIvs || inputIvs.trim() === '') {
    return {
      valido: false,
      mensagem: 'Campo IVs é obrigatório!',
      statsZerados: [],
      informacoesAdicionais: [],
      qtdStatsZerados: 0
    }
  }

  const partes = inputIvs.split(',').map(p => p.trim()).filter(p => p !== '')
  let tipoIV: string | null = null
  const statsZerados: string[] = []
  const informacoesAdicionais: string[] = []
  const erros: string[] = []

  for (const parte of partes) {
    const parteUpper = parte.toUpperCase()
    
    if (/^F[2-6]$/.test(parteUpper)) {
      if (tipoIV !== null) {
        erros.push('Apenas um tipo de IV é permitido')
      } else {
        tipoIV = parteUpper
      }
    } else if (/^0(hp|atk|def|spa|spd|spe)$/i.test(parte)) {
      const stat = parte.toLowerCase()
      if (!statsZerados.includes(stat)) {
        statsZerados.push(stat)
      }
    } else if (/^-(hp|atk|def|spa|spd|spe)$/i.test(parte)) {
      const stat = parte.toLowerCase()
      if (!informacoesAdicionais.includes(stat)) {
        informacoesAdicionais.push(stat)
      }
    } else {
      erros.push(`"${parte}" não é válido`)
    }
  }

  if (!tipoIV) {
    erros.push("Especifique um tipo de IV (F2-F6)")
  }

  if (erros.length > 0) {
    return {
      valido: false,
      mensagem: erros.join(', '),
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

export function calcularPrecoIVs(dadosIVs: IVsData): IVsCalculation {
  if (!dadosIVs.valido) {
    return {
      preco: 0,
      tipoFinal: '',
      foiUpgradado: false,
      detalhesUpgrade: ''
    }
  }

  let tipoIVFinal = dadosIVs.tipoIV!
  const qtdZerados = dadosIVs.qtdStatsZerados
  const tipoOriginal = dadosIVs.tipoIV!

  if (tipoIVFinal === 'F4') {
    if (qtdZerados >= 2) tipoIVFinal = 'F6'
    else if (qtdZerados === 1) tipoIVFinal = 'F5'
  } else if (tipoIVFinal === 'F5' && qtdZerados >= 1) {
    tipoIVFinal = 'F6'
  }

  const precos: Record<string, number> = {
    F6: 90000, F5: 70000, F4: 40000, F3: 30000, F2: 25000
  }

  const foiUpgradado = tipoIVFinal !== tipoOriginal
  let detalhesUpgrade = ''

  if (foiUpgradado) {
    detalhesUpgrade = `Upgrade: ${tipoOriginal} → ${tipoIVFinal}`
  }

  return {
    preco: precos[tipoIVFinal] || 0,
    tipoFinal: tipoIVFinal,
    foiUpgradado,
    detalhesUpgrade
  }
}