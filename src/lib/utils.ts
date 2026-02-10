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

  const ivsLimpo = inputIvs.trim().toUpperCase()
  
  // Regex: aceita APENAS F2-F6 com qualquer quantidade de stats zerados
  // Exemplos válidos: F5, F6, F5 -atk, F6 -speed -def -hp, F4-atk-spa-spd
  const regexCompleto = /^F[2-6](\s*-\s*(HP|ATK|DEF|SPA|SPD|SPE|SPEED|SPATK|SPDEF))*$/i
  
  if (!regexCompleto.test(ivsLimpo)) {
    return {
      valido: false,
      mensagem: '"' + inputIvs + '" não é válido. Use F2, F3, F4, F5 ou F6 com stats opcionais (ex: F5 -atk, F6 -speed -def)',
      statsZerados: [],
      informacoesAdicionais: [],
      qtdStatsZerados: 0
    }
  }
  
  // Extrair o tipo base (F2-F6)
  const tipoBase = ivsLimpo.substring(0, 2) // F2, F3, F4, F5 ou F6
  
  // Validar que seja F2-F6
  const tiposValidos = ['F2', 'F3', 'F4', 'F5', 'F6']
  if (!tiposValidos.includes(tipoBase)) {
    return {
      valido: false,
      mensagem: 'Apenas F2, F3, F4, F5 ou F6 são permitidos!',
      statsZerados: [],
      informacoesAdicionais: [],
      qtdStatsZerados: 0
    }
  }
  
  // Extrair stats zerados (sem limite de quantidade)
  const statsZerados: string[] = []
  const informacoesAdicionais: string[] = []
  const statsEncontrados = new Set<string>()
  
  // Procurar por stats após o "-"
  const regexStats = /-\s*(HP|ATK|DEF|SPA|SPD|SPE|SPEED|SPATK|SPDEF)/gi
  let match
  
  while ((match = regexStats.exec(ivsLimpo)) !== null) {
    let stat = match[1].toUpperCase()
    
    // Normalizar nomes de stats
    if (stat === 'SPEED') stat = 'SPE'
    if (stat === 'SPATK') stat = 'SPA'
    if (stat === 'SPDEF') stat = 'SPD'
    
    // Converter para lowercase para consistência
    const statLower = stat.toLowerCase()
    
    // Evitar duplicatas (mas permitir que o usuário digite repetido)
    if (!statsEncontrados.has(statLower)) {
      statsZerados.push(statLower)
      statsEncontrados.add(statLower)
      informacoesAdicionais.push(`${stat} zerado`)
    }
  }
  
  // Validar que não tente zerar mais de 6 stats 
  if (statsZerados.length > 6) {
    return {
      valido: false,
      mensagem: 'Não é possível zerar mais de 6 stats!',
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

  // Sistema de upgrade baseado em stats zerados
  // Cada stat zerado "aumenta" o tier do IV
  const tiposOrdem = ['F2', 'F3', 'F4', 'F5', 'F6']
  const indexAtual = tiposOrdem.indexOf(tipoIVFinal)
  
  if (indexAtual !== -1 && qtdZerados > 0) {
    const novoIndex = Math.min(indexAtual + qtdZerados, tiposOrdem.length - 1)
    tipoIVFinal = tiposOrdem[novoIndex]
  }

  // Preços para NORMAL e COMPETITIVO
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
    detalhesUpgrade = `Upgrade: ${tipoOriginal} + ${qtdZerados} stat(s) zerado(s) = ${tipoIVFinal}`
  }

  return {
    preco: precos[tipoIVFinal] || 0,
    tipoFinal: tipoIVFinal,
    foiUpgradado,
    detalhesUpgrade
  }
}