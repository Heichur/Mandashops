// src/lib/pokemonAPI.ts
import { Pokemon, PokemonDetails } from './types'

class PokemonAPIManager {
  private pokemonList: Pokemon[] = []
  private pokemonListWithoutLegendaries: Pokemon[] = []
  private pokemonDetails: Map<string, PokemonDetails> = new Map()
  private flavorTextCache: Map<number, string> = new Map()
  private isLoading: boolean = false
  private isLoaded: boolean = false
  private loadPromise: Promise<void> | null = null
  
  private legendaryIds = new Set([
    81, 82, 100, 101, 120, 121, 132, 137, 144, 145, 146, 150, 151,
    201, 233, 243, 244, 245, 249, 250, 251, 292, 337, 338, 343, 344, 374, 375, 376,
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
    436, 437, 462, 474, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
    494, 599, 600, 601, 615, 622, 623, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
    703, 716, 717, 718, 719, 720, 721,
    769, 774, 781, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805, 806, 807, 808, 809,
    859, 861, 870, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 924, 925,
    984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 999, 1000, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025,
    10276, 10263, 10250, 10251, 10252,  10264, 10265 ,10266 ,10267,  10268, 10269, 10270 ,10271, 10008, 10009, 10010, 10011, 10143, 10144, 10145
  ])

  private specialFormsKeywords = [
    'mega', 'gigantamax', 'gmax', 'primal', 'ultra', 'eternamax',
    'crowned', 'origin', 'sky', 'hangry', 'zen',
    'black', 'white', 'complete', 'unbound', 'resolute', 'pirouette',
    'blade', 'shield', 'dusk', 'dawn', 'ice', 'shadow', 'rider',
    'low-key', 'amped', 'full-belly', 'ruby', 'sapphire', 'emerald',
    'sunshine', 'east', 'west', 'autumn', 'summer', 'spring', 'winter',
    'red-striped', 'blue-striped', 'school', 'solo',
    'midday', 'midnight', 'dawn-wings', 'dusk-mane',
    'stellar', 'wellspring', 'hearthflame', 'cornerstone', 'teal'
  ]

  private allowedRegionalForms = ['alola', 'galar', 'hisui', 'paldea']
  
  // Pokémon que têm formas específicas que devem ser mostradas APENAS na Pokepédia
  private allowedSpecificFormsForPokedex = [
    'thundurus-incarnate',
    'tornadus-incarnate',
    'landorus-incarnate',
    'enamorus-incarnate',
    'deoxys-normal',
    'giratina-altered',
    'shaymin-land',
    'meloetta-aria',
    'keldeo-ordinary',
  ]
  
  // Pokémon com formas alternativas permitidas em AMBAS as seções
  private allowedSpecificFormsEverywhere = [
    'basculin-red-striped',
    'darmanitan-standard',
    'lycanroc-midday',
    'oricorio-baile',
    'wishiwashi-solo',
    'minior-red-meteor',
    'aegislash-shield',
    'wormadam-plant',
    'mimikyu-disguised'
  ]

  isSpecialForm(pokemonName: string, forPurchase: boolean = false): boolean {
    const nameLower = pokemonName.toLowerCase()
    
    // Lista de Pokémon base que devem sempre aparecer (versão sem hífen)
    const basePokemonAllowed = [
      'morpeko'
    ]
    
    // Se for exatamente um dos Pokémon base (sem hífen), permitir
    if (basePokemonAllowed.includes(nameLower)) {
      return false
    }
    
    // Se for uma forma específica permitida em todos os lugares, aceitar
    if (this.allowedSpecificFormsEverywhere.includes(nameLower)) {
      return false
    }
    
    // Se for uma forma específica permitida APENAS na Pokepédia
    if (this.allowedSpecificFormsForPokedex.includes(nameLower)) {
      // Se for para compra, bloquear essas formas (são lendários)
      if (forPurchase) {
        return true
      }
      // Se for para Pokepédia, permitir
      return false
    }
    
    // Verificar se é uma forma regional permitida
    const isAllowedRegional = this.allowedRegionalForms.some(regional =>
      nameLower.includes(regional)
    )
    if (isAllowedRegional) return false
    
    // Bloquear formas especiais
    return this.specialFormsKeywords.some(keyword => nameLower.includes(keyword))
  }

  async loadPokemonList(excludeLegendaries: boolean = false): Promise<Pokemon[]> {
    // Se já está carregado, retorna a lista apropriada
    if (this.isLoaded) {
      return excludeLegendaries ? this.pokemonListWithoutLegendaries : this.pokemonList
    }
    
    // Se está carregando, aguarda o carregamento
    if (this.isLoading && this.loadPromise) {
      await this.loadPromise
      return excludeLegendaries ? this.pokemonListWithoutLegendaries : this.pokemonList
    }
    
    // Inicia o carregamento
    this.isLoading = true
    this.loadPromise = this._fetchPokemonList()
    
    try {
      await this.loadPromise
    } catch (error) {
      this.isLoading = false
      throw error
    }
    
    return excludeLegendaries ? this.pokemonListWithoutLegendaries : this.pokemonList
  }

  private async _fetchPokemonList(): Promise<void> {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000')
      if (!response.ok) throw new Error('Falha ao buscar lista da PokeAPI')
      
      const data = await response.json()
      
      // Lista completa (para Pokepédia) - aceita formas lendárias
      const allPokemon = data.results
        .map((pokemon: any) => {
          const id = this._extractIdFromUrl(pokemon.url)
          const formattedName = pokemon.name
            .split('-')
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ')
          
          return {
            id,
            name: formattedName,
            originalName: pokemon.name,
            url: pokemon.url
          }
        })
        .filter((pokemon: Pokemon) => {
          // Para a lista completa (Pokepédia), não bloqueia formas lendárias
          // mas ainda bloqueia formas especiais como mega, gigantamax, etc
          if (this.isSpecialForm(pokemon.originalName, false)) {
            return false
          }
          return true
        })
      
      this.pokemonList = allPokemon.sort((a: Pokemon, b: Pokemon) => a.id - b.id)
      
      // Lista sem lendários (para Comprar) - bloqueia formas lendárias também
      this.pokemonListWithoutLegendaries = data.results
        .map((pokemon: any) => {
          const id = this._extractIdFromUrl(pokemon.url)
          const formattedName = pokemon.name
            .split('-')
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ')
          
          return {
            id,
            name: formattedName,
            originalName: pokemon.name,
            url: pokemon.url
          }
        })
        .filter((pokemon: Pokemon) => {
          // Bloqueia formas especiais (incluindo formas lendárias)
          if (this.isSpecialForm(pokemon.originalName, true)) {
            return false
          }
          // Bloqueia lendários por ID
          if (this.legendaryIds.has(pokemon.id)) {
            return false
          }
          return true
        })
        .sort((a: Pokemon, b: Pokemon) => a.id - b.id)
      
      this.isLoaded = true
      this.isLoading = false
    } catch (error) {
      this.isLoading = false
      this.pokemonList = this._getFallbackList()
      this.pokemonListWithoutLegendaries = this._getFallbackList()
      this.isLoaded = true
    }
  }

  private _extractIdFromUrl(url: string): number {
    const matches = url.match(/\/(\d+)\/$/)
    return matches ? parseInt(matches[1]) : 0
  }

  private _getFallbackList(): Pokemon[] {
    return [
      { id: 1, name: 'Bulbasaur', originalName: 'bulbasaur' },
      { id: 4, name: 'Charmander', originalName: 'charmander' },
      { id: 7, name: 'Squirtle', originalName: 'squirtle' },
      { id: 25, name: 'Pikachu', originalName: 'pikachu' },
    ]
  }

  searchPokemon(query: string, excludeLegendaries: boolean = false): Pokemon[] {
    if (!query || !this.isLoaded) return []
    const searchTerm = this._normalize(query)
    
    const listToSearch = excludeLegendaries ? this.pokemonListWithoutLegendaries : this.pokemonList
    
    return listToSearch.filter((pokemon) => {
      const pokemonName = this._normalize(pokemon.name)
      const pokemonOriginal = this._normalize(pokemon.originalName)
      return pokemonName.includes(searchTerm) || pokemonOriginal.includes(searchTerm)
    })
  }

  findExactPokemon(name: string): Pokemon | null {
    if (!name || !this.isLoaded) return null
    const searchTerm = this._normalize(name)
    
    return this.pokemonList.find((pokemon) => {
      const pokemonName = this._normalize(pokemon.name)
      const pokemonOriginal = this._normalize(pokemon.originalName)
      return pokemonName === searchTerm || pokemonOriginal === searchTerm
    }) || null
  }

  async getPokemonDetails(pokemonName: string): Promise<PokemonDetails | null> {
    const cacheKey = pokemonName.toLowerCase()
    
    if (this.pokemonDetails.has(cacheKey)) {
      return this.pokemonDetails.get(cacheKey)!
    }

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${cacheKey}`)
      if (!response.ok) return null
      
      const pokemon = await response.json()
      
      const details: PokemonDetails = {
        id: pokemon.id,
        name: pokemon.name,
        height: pokemon.height,
        weight: pokemon.weight,
        types: pokemon.types.map((type: any) => type.type.name),
        sprite: pokemon.sprites.front_default,
        abilities: pokemon.abilities.map((ability: any) => ({
          name: ability.ability.name,
          isHidden: ability.is_hidden
        })),
        stats: pokemon.stats.map((stat: any) => ({
          name: stat.stat.name,
          value: stat.base_stat
        }))
      }

      this.pokemonDetails.set(cacheKey, details)
      return details
    } catch (error) {
      return null
    }
  }

  private async _translateText(text: string, to: string = 'pt'): Promise<string> {
    try {
      const url = 'https://translate.googleapis.com/translate_a/single'
      const params = new URLSearchParams({
        client: 'gtx',
        sl: 'en',
        tl: to,
        dt: 't',
        q: text
      })

      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      })

      if (!response.ok) {
        return await this._translateWithLibreTranslate(text, to)
      }

      const data = await response.json()

      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0]
      }

      return text
    } catch (error) {
      console.warn('Erro ao traduzir com Google:', error)
      return await this._translateWithLibreTranslate(text, to)
    }
  }

  private async _translateWithLibreTranslate(text: string, to: string = 'pt'): Promise<string> {
    try {
      const response = await fetch('https://libretranslate.com/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: to,
          format: 'text'
        })
      })

      if (!response.ok) return text

      const data = await response.json()
      return data.translatedText || text
    } catch (error) {
      console.warn('Erro ao traduzir com LibreTranslate:', error)
      return text
    }
  }

  async getPokemonFlavorText(pokemonId: number): Promise<string> {
    if (this.flavorTextCache.has(pokemonId)) {
      return this.flavorTextCache.get(pokemonId)!
    }

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`)
      if (!response.ok) return 'Descrição não disponível.'
      
      const species = await response.json()
      
      const ptBR = species.flavor_text_entries.find(
        (entry: any) => entry.language.name === 'pt-BR'
      )
      if (ptBR) {
        const text = this._cleanFlavorText(ptBR.flavor_text)
        this.flavorTextCache.set(pokemonId, text)
        return text
      }

      const en = species.flavor_text_entries.find(
        (entry: any) => entry.language.name === 'en'
      )
      
      if (!en) {
        return 'Descrição não disponível.'
      }

      const cleanEnglishText = this._cleanFlavorText(en.flavor_text)
      const translatedText = await this._translateText(cleanEnglishText, 'pt')
      
      this.flavorTextCache.set(pokemonId, translatedText)
      return translatedText
      
    } catch (error) {
      console.error('Erro ao buscar descrição:', error)
      return 'Descrição não disponível.'
    }
  }

  private _cleanFlavorText(text: string): string {
    return text
      .replace(/\n|\f|\r/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private _normalize(text: string): string {
    if (!text) return ''
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
  }

  getAllPokemon(excludeLegendaries: boolean = false): Pokemon[] {
    return excludeLegendaries ? this.pokemonListWithoutLegendaries : this.pokemonList
  }

  isLegendary(pokemonId: number): boolean {
    return this.legendaryIds.has(pokemonId)
  }
}

export const pokemonAPI = new PokemonAPIManager()