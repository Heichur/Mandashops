// src/lib/types.ts

export interface Pokemon {
  id: number
  name: string
  originalName: string
  url?: string
}

export interface PokemonDetails {
  id: number
  name: string
  height: number
  weight: number
  types: string[]
  sprite: string
  abilities: Ability[]
  stats: Stat[]
}

export interface Ability {
  name: string
  isHidden: boolean
}

export interface Stat {
  name: string
  value: number
}

export interface EggMove {
  name: string
  displayName: string
}

export interface Megastone {
  id: string
  name: string
  displayName: string
  valor: number
  estoque: number
}

export interface Pedido {
  nomeUsuario: string
  nickDiscord: string
  pokemon: string
  tipoCompra?: 'normal' | 'competitivo' | 'genderless'
  castradoOuBreedavel: string
  natureza: string
  habilidades: string
  sexo?: string
  ivsSolicitados: string
  ivsZerados: string
  informacoesAdicionais: string
  ivsFinal: string
  ivsUpgradado: boolean
  detalhesUpgrade: string
  eggMoves: string
  hiddenHabilidade: boolean
  evsDistribuicao?: string
  totalVitaminas?: number
  levelPokemon?: string
  precoLevel?: number
  megapedra?: string
  precoMegapedra?: number
  megapedraDocId?: string
  precoBase?: number
  precoTotal: number
  timestamp: Date
  status: string
}

export interface IVsData {
  valido: boolean
  tipo?: string
  tipoIV?: string
  mensagem?: string
  statsZerados: string[]
  informacoesAdicionais: string[]
  qtdStatsZerados: number
}

export interface IVsCalculation {
  preco: number
  tipoFinal: string
  foiUpgradado: boolean
  detalhesUpgrade: string
}

export interface EVs {
  hp: number
  atk: number
  def: number
  spa: number
  spd: number
  spe: number
}

export interface UserData {
  nickname: string
  discord: string
  isAdmin?: boolean
}