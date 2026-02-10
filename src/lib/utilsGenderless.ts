// src/lib/utilsGenderless.ts
import { IVsData, IVsCalculation } from './types'

export function analisarIVsGenderless(inputIvs: string): IVsData {
  if (!inputIvs || inputIvs.trim() === '') {
    return {
      valido: false,
      mensagem: 'Campo IVs é obrigatório!',
      statsZerados: [],
      informacoesAdicionais: [],
      qtdStatsZerados: 0
    }
  }

  const ivsLimpo = inputIvs.trim().toUpperCase()
  
  // Regex: aceita APENAS F5 ou F6 com NO MÁXIMO 1 stat zerado
  // Exemplos válidos: F5, F6, F5 -atk, F6 -speed
  // Exemplos inválidos: F5 -atk -spa, F4, F3
  const regexCompleto = /^F[5-6](\s*-\s*(HP|ATK|DEF|SPA|SPD|SPE|SPEED|SPATK|SPDEF))?$/i
  
  if (!regexCompleto.test(ivsLimpo)) {
    return {
      valido: false,
      mensagem: '"' + inputIvs + '" não é válido. Use apenas F5 ou F6 com no máximo 1 stat zerado (ex: F5 -atk, F6 -speed)',
      statsZerados: [],
      informacoesAdicionais: [],
      qtdStatsZerados: 0
    }
  }
  
  // Extrair o tipo base (F5 ou F6)
  const tipoBase = ivsLimpo.substring(0, 2)
  
  // Validar que seja apenas F5 ou F6
  const tiposValidos = ['F5', 'F6']
  if (!tiposValidos.includes(tipoBase)) {
    return {
      valido: false,
      mensagem: 'Apenas F5 ou F6 são permitidos para Pokémon Genderless!',
      statsZerados: [],
      informacoesAdicionais: [],
      qtdStatsZerados: 0
    }
  }
  
  // Extrair stats zerados (máximo 1)
  const statsZerados: string[] = []
  const informacoesAdicionais: string[] = []
  
  // Procurar por stat após o "-"
  const regexStats = /-\s*(HP|ATK|DEF|SPA|SPD|SPE|SPEED|SPATK|SPDEF)/i
  const match = regexStats.exec(ivsLimpo)
  
  if (match) {
    let stat = match[1].toUpperCase()
    
    // Normalizar nomes de stats
    if (stat === 'SPEED') stat = 'SPE'
    if (stat === 'SPATK') stat = 'SPA'
    if (stat === 'SPDEF') stat = 'SPD'
    
    // Converter para lowercase para consistência
    const statLower = stat.toLowerCase()
    
    statsZerados.push(statLower)
    informacoesAdicionais.push(`${stat} zerado`)
  }
  
  // Validação extra: garantir que tem NO MÁXIMO 1 stat zerado
  // Contar quantos "-" existem no input
  const qtdHifens = (ivsLimpo.match(/-/g) || []).length
  if (qtdHifens > 1) {
    return {
      valido: false,
      mensagem: 'Pokémon Genderless podem ter no máximo 1 stat zerado!',
      statsZerados: [],
      informacoesAdicionais: [],
      qtdStatsZerados: 0
    }
  }
  
  return {
    valido: true,
    tipoIV: tipoBase,
    statsZerados,
    informacoesAdicionais,
    qtdStatsZerados: statsZerados.length
  }
}

export function calcularPrecoIVsGenderless(dadosIVs: IVsData): IVsCalculation {
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

  // Sistema de upgrade para Genderless
  // F5 + 1 stat zerado = F6
  if (tipoIVFinal === 'F5' && qtdZerados === 1) {
    tipoIVFinal = 'F6'
  }

  // Preços para GENDERLESS 
  const precos: Record<string, number> = {
    F6: 190000,  // Genderless F6 Castrado: 190k
    F5: 120000   // Genderless F5 Breedavel: 120k
  }

  const foiUpgradado = tipoIVFinal !== tipoOriginal
  let detalhesUpgrade = ''

  if (foiUpgradado) {
    detalhesUpgrade = `Upgrade: ${tipoOriginal} + 1 stat zerado = ${tipoIVFinal}`
  }

  return {
    preco: precos[tipoIVFinal] || 0,
    tipoFinal: tipoIVFinal,
    foiUpgradado,
    detalhesUpgrade
  }
}