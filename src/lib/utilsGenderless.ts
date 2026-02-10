// src/lib/utilsGenderless.ts
import { IVsData, IVsCalculation } from './types'


export function analisarIVsGenderless(inputIvs: string): IVsData {
  if (!inputIvs || inputIvs.trim() === '') {
    return {
      valido: false,
      mensagem: `Campo IVs é obrigatório!
Para Pokémon Genderless, apenas F5 ou F6 são aceitos.
Formatos aceitos:
- IVs Zerados (afetam preço): 0atk, 0spe, 0hp, etc.
- Informações adicionais: -atk, -spe, -hp, etc.
Exemplos:

F5 = Genderless F5
F6 = Genderless F6
F5, 0atk = Genderless F6 (upgrade por IV zerado)
F5, -atk = Genderless F5 (só informativo)`,
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
    const parteLower = parte.toLowerCase()

    // Verifica se é F5 ou F6
    if (/^F[5-6]$/i.test(parte)) {
      if (tipoIV !== null) {
        erros.push('Apenas um tipo de IV é permitido')
      } else {
        tipoIV = parteUpper
      }
    }
    // Rejeita F2-F4
    else if (/^F[2-4]$/i.test(parte)) {
      erros.push('Para Pokémon Genderless, apenas F5 ou F6 são aceitos')
    }
    // Verifica se é IV zerado (0atk, 0spe, etc.) - AFETA PREÇO
    else if (/^0(hp|atk|def|spa|spd|spe|attack|defense|special|speed)$/i.test(parteLower)) {
      const statNormalizado = parteLower
        .replace('attack', 'atk')
        .replace('defense', 'def')
        .replace('special', 'spa')
        .replace('speed', 'spe')
      
      if (!statsZerados.includes(statNormalizado)) {
        statsZerados.push(statNormalizado)
      }
    }
    // Verifica se é informação adicional (-atk, -spe, etc.) - NÃO AFETA PREÇO
    else if (/^-(hp|atk|def|spa|spd|spe|attack|defense|special|speed)$/i.test(parteLower)) {
      const statNormalizado = parteLower
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
    erros.push('É obrigatório especificar F5 ou F6')
  }

  if (erros.length > 0) {
    return {
      valido: false,
      mensagem: `Erros encontrados: ${erros.join(', ')}

Formatos corretos: (LEMBRANDO É NECESSÁRIO SEPARAR POR VÍRGULA!!)

Tipos IV: F5, F6
IVs zerados: 0atk, 0spe, 0hp, etc. (afetam preço - upgrade para F6)
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


export function calcularPrecoIVsGenderless(dadosIVs: IVsData, castradoOuBreedavel: string): IVsCalculation {
  if (!dadosIVs.valido || !dadosIVs.tipoIV) {
    return {
      preco: 0,
      tipoFinal: '',
      foiUpgradado: false,
      detalhesUpgrade: ''
    }
  }

  let tipoIVFinal = dadosIVs.tipoIV
  const qtdZerados = dadosIVs.qtdStatsZerados || 0
  const tipoOriginal = dadosIVs.tipoIV

  // Se for F5 e tiver pelo menos 1 IV zerado, faz upgrade para F6
  if (tipoIVFinal === 'F5' && qtdZerados >= 1) {
    tipoIVFinal = 'F6'
  }


  const precosGenderless: Record<string, Record<string, number>> = {
    'F5': {
      'breedavel': 120000,
      'castrado': 110000
    },
    'F6': {
      'breedavel': 200000,
      'castrado': 190000
    }
  }

  const tipo = castradoOuBreedavel.toLowerCase()
  const tipoValido = (tipo === 'breedavel' || tipo === 'breedável') ? 'breedavel' : 'castrado'
  const preco = precosGenderless[tipoIVFinal]?.[tipoValido] || 0

  const foiUpgradado = tipoIVFinal !== tipoOriginal
  let detalhesUpgrade = ''

  if (foiUpgradado) {
    const motivoUpgrade = qtdZerados === 1 ? '1 IV zerado' : `${qtdZerados} IVs zerados`
    detalhesUpgrade = `Upgrade: ${tipoOriginal} → ${tipoIVFinal} (${motivoUpgrade})`
  }

  return {
    preco: preco,
    tipoFinal: tipoIVFinal,
    foiUpgradado: foiUpgradado,
    detalhesUpgrade: detalhesUpgrade
  }
}

export function calcularPrecoGenderlessComUpgrade(dadosIVs: IVsData, castradoOuBreedavel: string): IVsCalculation {
  return calcularPrecoIVsGenderless(dadosIVs, castradoOuBreedavel)
}