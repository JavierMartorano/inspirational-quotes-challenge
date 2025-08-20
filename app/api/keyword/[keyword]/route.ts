import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route para obtener citas por keyword específico desde ZenQuotes
 * Endpoint oficial: https://zenquotes.io/api/quotes/[YOUR_API_KEY]&keyword=[keyword]
 * 
 * Retorna hasta 50 citas relacionadas con la keyword proporcionada
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ keyword: string }> }
) {
  try {
    const { keyword } = await params
    
    if (!keyword) {
      return NextResponse.json({
        success: false,
        error: 'Keyword es requerida',
        timestamp: Date.now()
      }, { status: 400 })
    }
    
    // Obtener API key desde variables de entorno
    const apiKey = process.env.ZENQUOTES_API_KEY
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      console.warn(`⚠️ ZENQUOTES_API_KEY no configurada. Usando citas por defecto para: ${keyword}`)
      
      // Citas por defecto para diferentes keywords
      const defaultQuotes = getDefaultQuotesByKeyword(keyword)
      
      return NextResponse.json({
        success: true,
        data: defaultQuotes,
        keyword: keyword,
        source: 'fallback',
        count: defaultQuotes.length,
        timestamp: Date.now()
      })
    }
    
    // Construir URL oficial según documentación
    const zenQuotesUrl = `https://zenquotes.io/api/quotes/${apiKey}&keyword=${encodeURIComponent(keyword)}`
    
    console.log(`🔑 Obteniendo citas para "${keyword}" desde ZenQuotes API oficial...`)
    
    const response = await fetch(zenQuotesUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Inspirational-Quotes-Challenge/1.0'
      },
      // Timeout de 15 segundos
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) {
      throw new Error(`ZenQuotes API error: ${response.status} ${response.statusText}`)
    }
    
    const zenQuotes = await response.json()
    
    // Transformar respuesta de ZenQuotes a nuestro formato
    const quotes = zenQuotes.map((quote: any, index: number) => ({
      id: index + 1,
      text: decodeHtmlEntities(quote.q || quote.text || ''),
      author: quote.a || quote.author || 'Anónimo',
      category: keyword
    }))
    
    console.log(`✅ ${quotes.length} citas obtenidas para "${keyword}" desde ZenQuotes API`)
    
    return NextResponse.json({
      success: true,
      data: quotes,
      keyword: keyword,
      source: 'zenquotes_api',
      count: quotes.length,
      timestamp: Date.now()
    })
    
  } catch (error) {
    // Obtener keyword desde params de forma segura
    const { keyword: errorKeyword } = await params
    console.error(`❌ Error obteniendo citas para "${errorKeyword}":`, error)
    
    // Fallback a citas por defecto en caso de error
    const fallbackQuotes = getDefaultQuotesByKeyword(errorKeyword)
    
    return NextResponse.json({
      success: true,
      data: fallbackQuotes,
      keyword: errorKeyword,
      source: 'fallback_error',
      count: fallbackQuotes.length,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    })
  }
}

/**
 * Función para decodificar entidades HTML en las citas
 */
function decodeHtmlEntities(text: string): string {
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&mdash;': '—',
    '&ndash;': '–'
  }
  
  return text.replace(/&[a-zA-Z0-9#]+;/g, (match) => entities[match] || match)
}

/**
 * Función para obtener citas por defecto según keyword (fallback)
 */
function getDefaultQuotesByKeyword(keyword: string) {
  const defaultQuotesMap: { [key: string]: Array<{id: number, text: string, author: string, category: string}> } = {
    love: [
      { id: 1, text: "El amor es la fuerza más humilde, pero la más poderosa de que dispone el mundo.", author: "Mahatma Gandhi", category: keyword },
      { id: 2, text: "Donde hay amor, hay vida.", author: "Mahatma Gandhi", category: keyword },
      { id: 3, text: "El amor no se mira, se siente.", author: "William Shakespeare", category: keyword }
    ],
    happiness: [
      { id: 1, text: "La felicidad no es algo hecho. Viene de tus propias acciones.", author: "Dalai Lama", category: keyword },
      { id: 2, text: "La felicidad es cuando lo que piensas, lo que dices y lo que haces están en armonía.", author: "Mahatma Gandhi", category: keyword },
      { id: 3, text: "La felicidad es una mariposa que, cuando la persigues, siempre está fuera de tu alcance.", author: "Nathaniel Hawthorne", category: keyword }
    ],
    success: [
      { id: 1, text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier", category: keyword },
      { id: 2, text: "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.", author: "Albert Schweitzer", category: keyword },
      { id: 3, text: "El éxito es ir de fracaso en fracaso sin perder el entusiasmo.", author: "Winston Churchill", category: keyword }
    ],
    motivation: [
      { id: 1, text: "La motivación es lo que te pone en marcha, el hábito es lo que te mantiene en movimiento.", author: "Jim Ryun", category: keyword },
      { id: 2, text: "No esperes por el momento perfecto, toma el momento y hazlo perfecto.", author: "Zoey Sayward", category: keyword },
      { id: 3, text: "Tu única limitación eres tú mismo.", author: "Anónimo", category: keyword }
    ],
    inspiration: [
      { id: 1, text: "La única forma de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs", category: keyword },
      { id: 2, text: "El futuro pertenece a aquellos que creen en la belleza de sus sueños.", author: "Eleanor Roosevelt", category: keyword },
      { id: 3, text: "Cree en ti mismo y todo será posible.", author: "Anónimo", category: keyword }
    ]
  }
  
  // Retornar citas específicas para la keyword o citas genéricas
  return defaultQuotesMap[keyword.toLowerCase()] || [
    { id: 1, text: `Una cita inspiracional sobre ${keyword}.`, author: "Anónimo", category: keyword },
    { id: 2, text: `${keyword} es importante en la vida.`, author: "Anónimo", category: keyword },
    { id: 3, text: `Reflexiona sobre ${keyword} y encontrarás sabiduría.`, author: "Anónimo", category: keyword }
  ]
}