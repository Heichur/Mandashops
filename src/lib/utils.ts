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
  
  // Regex para aceitar APENAS F5 ou F6 (ou 5x31, 6x31) com stats opcionais zerados
  // Exemplos válidos: F5, F6, F5 -atk, F6 -speed -def, F5-atk-speed
  const regexCompleto = /^(F[5-6]|[5-6]X31)(\s*-\s*(HP|ATK|DEF|SPA|SPD|SPE|SPEED|SPATK|SPDEF))*$/i
  
  if (!regexCompleto.test(ivsLimpo)) {
    return {
      valido: false,
      mensagem: '"' + inputIvs + '" não é válido. Use apenas F5 ou F6 com stats opcionais (ex: F5 -atk, F6 -speed)',
      statsZerados: [],
      informacoesAdicionais: [],
      qtdStatsZerados: 0
    }
  }
  
  // Extrair o tipo base (F5, F6, 5x31, 6x31)
  let tipoBase = ''
  if (ivsLimpo.startsWith('F')) {
    tipoBase = ivsLimpo.substring(0, 2) // F5 ou F6
  } else if (ivsLimpo.includes('X31')) {
    const num = ivsLimpo.charAt(0)
    tipoBase = num + 'x31'
  }
  
  // Validar que só seja F5 ou F6
  if (tipoBase !== 'F5' && tipoBase !== 'F6' && tipoBase !== '5x31' && tipoBase !== '6x31') {
    return {
      valido: false,
      mensagem: 'Apenas F5 ou F6 são permitidos!',
      statsZerados: [],
      informacoesAdicionais: [],
      qtdStatsZerados: 0
    }
  }
  
  // Normalizar para formato F5/F6
  if (tipoBase === '5x31') tipoBase = 'F5'
  if (tipoBase === '6x31') tipoBase = 'F6'
  
  // Extrair stats zerados
  const statsZerados: string[] = []
  const informacoesAdicionais: string[] = []
  
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
    
    if (!statsZerados.includes(statLower)) {
      statsZerados.push(statLower)
      informacoesAdicionais.push(`${stat} zerado`)
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

  // Aplicar upgrade se houver stats zerados
  // F5 + 1 stat zerado = F6
  if (tipoIVFinal === 'F5' && qtdZerados >= 1) {
    tipoIVFinal = 'F6'
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