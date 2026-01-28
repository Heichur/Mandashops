// src/lib/pokemonAPI.ts
import { Pokemon, PokemonDetails } from './types'

class PokemonAPIManager {
  private pokemonList: Pokemon[] = []
  private pokemonDetails: Map<string, PokemonDetails> = new Map()
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
    10276, 10263, 10250, 10251, 10252
  ])

  private specialFormsKeywords = [
    'mega', 'gigantamax', 'gmax', 'primal', 'ultra', 'eternamax',
    'crowned', 'origin', 'sky', 'hangry', 'zen', 'therian',
    'black', 'white', 'complete', 'unbound', 'resolute', 'pirouette',
    'blade', 'shield', 'dusk', 'dawn', 'ice', 'shadow', 'rider',
    'low-key', 'amped', 'full-belly', 'ruby', 'sapphire', 'emerald',
    'sunshine', 'east', 'west', 'autumn', 'summer', 'spring', 'winter',
    'red-striped', 'blue-striped', 'incarnate', 'school', 'solo',
    'midday', 'midnight', 'dusk', 'ultra', 'dawn-wings', 'dusk-mane',
    'stellar', 'wellspring', 'hearthflame', 'cornerstone', 'teal', 'Heat', 'Wash', 'Frost', 'Fan', 'Mow'
  ]

  private allowedRegionalForms = ['alola', 'galar', 'hisui', 'paldea']

  isSpecialForm(pokemonName: string): boolean {
    const nameLower = pokemonName.toLowerCase()
    const basePokemonAllowed = ['morpeko']
    
    if (basePokemonAllowed.includes(nameLower)) return false
    
    const isAllowedRegional = this.allowedRegionalForms.some(regional =>
      nameLower.includes(regional)
    )
    if (isAllowedRegional) return false
    
    return this.specialFormsKeywords.some(keyword => nameLower.includes(keyword))
  }

  async loadPokemonList(): Promise<Pokemon[]> {
    if (this.isLoaded) return this.pokemonList
    if (this.isLoading) return this.loadPromise!.then(() => this.pokemonList)
    
    this.isLoading = true
    this.loadPromise = this._fetchPokemonList()
    
    try {
      await this.loadPromise
    } catch (error) {
      this.isLoading = false
      throw error
    }
    
    return this.pokemonList
  }

  private async _fetchPokemonList(): Promise<void> {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000')
      if (!response.ok) throw new Error('Falha ao buscar lista da PokeAPI')
      
      const data = await response.json()
      
      this.pokemonList = data.results
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
          if (this.legendaryIds.has(pokemon.id)) return false
          if (this.isSpecialForm(pokemon.originalName)) return false
          return true
        })
      
      this.pokemonList.sort((a, b) => a.id - b.id)
      this.isLoaded = true
      this.isLoading = false
    } catch (error) {
      this.isLoading = false
      this.pokemonList = this._getFallbackList()
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

  searchPokemon(query: string): Pokemon[] {
    if (!query || !this.isLoaded) return []
    const searchTerm = this._normalize(query)
    
    return this.pokemonList.filter((pokemon) => {
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

  private _normalize(text: string): string {
    if (!text) return ''
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
  }

  getAllPokemon(): Pokemon[] {
    return this.pokemonList
  }

  isLegendary(pokemonId: number): boolean {
    return this.legendaryIds.has(pokemonId)
  }
}

export const pokemonAPI = new PokemonAPIManager()