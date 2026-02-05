// src/app/api/smogon-overview/route.ts

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pokemon = searchParams.get('pokemon')
  
  if (!pokemon) {
    return NextResponse.json({ 
      error: 'Pokemon name required' 
    }, { status: 400 })
  }

  try {
    // Formatar nome para URL do Smogon (lowercase, manter hífens)
    const formattedName = pokemon.toLowerCase().trim()
    
    // Tentar diferentes gerações (SV = Gen 9, SS = Gen 8)
    const generations = ['sv', 'ss', 'sm']
    let overviewText = null
    let tier = null
    
    for (const gen of generations) {
      const url = `https://www.smogon.com/dex/${gen}/pokemon/${formattedName}/`
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        
        if (!response.ok) continue
        
        const html = await response.text()
        
  
        
        // Procurar section com "Overview"
        const overviewMatch = html.match(/<h2[^>]*>Overview<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/i)
        
        if (overviewMatch && overviewMatch[1]) {
          // Limpar HTML tags
          overviewText = overviewMatch[1]
            .replace(/<[^>]*>/g, '') // Remove tags HTML
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim()
          
          // Extrair tier
          const tierMatch = html.match(/Format[s]?:\s*<\/strong>\s*([A-Z]+)/i)
          if (tierMatch) {
            tier = tierMatch[1]
          }
          
          break
        }
      } catch (genError) {
        console.log(`Tentativa falhou para gen ${gen}:`, genError)
        continue
      }
    }
    
    if (!overviewText) {
      // Fallback: retornar mensagem genérica
      return NextResponse.json({ 
        overview: `${pokemon.charAt(0).toUpperCase() + pokemon.slice(1)} é um Pokémon viável competitivamente. Usado estrategicamente em battles competitivos com base em seus atributos únicos. Consulte Smogon para análises detalhadas específicas do tier.`,
        tier: null,
        source: 'fallback'
      })
    }

    return NextResponse.json({ 
      overview: overviewText,
      tier: tier,
      source: 'smogon'
    })
    
  } catch (error) {
    console.error('Erro ao buscar overview do Smogon:', error)
    
    return NextResponse.json({ 
      overview: `Análise competitiva temporariamente indisponível. ${pokemon.charAt(0).toUpperCase() + pokemon.slice(1)} pode ser usado em diversos contextos competitivos dependendo do tier e estratégia do time.`,
      tier: null,
      source: 'error'
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}