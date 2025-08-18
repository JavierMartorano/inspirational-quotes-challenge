import { NextRequest, NextResponse } from 'next/server'

// Interfaces para ZenQuotes API
interface ZenQuoteResponse {
  q: string // quote text
  a: string // author
  i?: string // image (opcional)
  c?: string // character count
  h?: string // html (opcional)
}

interface Quote {
  id: number
  text: string
  author: string
  category: string
}

// Función para transformar respuesta de ZenQuotes a nuestra interfaz
function transformZenQuote(zenQuote: ZenQuoteResponse, category: string = 'inspirational', id?: number): Quote {
  return {
    id: id || Math.floor(Math.random() * 10000),
    text: zenQuote.q,
    author: zenQuote.a,
    category: category
  }
}

// Mock quotes como fallback
const mockQuotes: Quote[] = [
  {
    id: 1,
    text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    author: "Robert Collier",
    category: "éxito",
  },
  {
    id: 2,
    text: "No esperes por el momento perfecto, toma el momento y hazlo perfecto.",
    author: "Zoey Sayward",
    category: "acción",
  },
  {
    id: 3,
    text: "La única forma de hacer un gran trabajo es amar lo que haces.",
    author: "Steve Jobs",
    category: "trabajo",
  },
  {
    id: 4,
    text: "El futuro pertenece a aquellos que creen en la belleza de sus sueños.",
    author: "Eleanor Roosevelt",
    category: "sueños",
  },
  {
    id: 5,
    text: "No se trata de ser perfecto, se trata de ser mejor que ayer.",
    author: "Anónimo",
    category: "crecimiento",
  },
  {
    id: 6,
    text: "La motivación es lo que te pone en marcha, el hábito es lo que te mantiene en movimiento.",
    author: "Jim Ryun",
    category: "hábitos",
  }
]

/**
 * API Route para obtener citas desde ZenQuotes API
 * GET /api/quotes - obtiene citas aleatorias
 * GET /api/quotes?keyword=motivation - obtiene citas filtradas por keyword
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword')
    
    // Llamar a ZenQuotes API desde el servidor para evitar CORS
    const response = await fetch('https://zenquotes.io/api/quotes', {
      headers: {
        'Accept': 'application/json',
      },
      // Agregar timeout
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      throw new Error(`ZenQuotes API error: ${response.status}`)
    }
    
    const zenQuotes: ZenQuoteResponse[] = await response.json()
    
    if (keyword) {
      // Filtrar citas que contengan la keyword
      const filteredQuotes = zenQuotes
        .filter(quote => 
          quote.q.toLowerCase().includes(keyword.toLowerCase()) ||
          quote.a.toLowerCase().includes(keyword.toLowerCase())
        )
        .slice(0, 10) // Mostrar solo 10 como especifica el requisito
        .map((zenQuote, index) => transformZenQuote(zenQuote, keyword, index + 1))
      
      // Si no hay citas filtradas, devolver algunas aleatorias con la keyword como categoría
      if (filteredQuotes.length === 0) {
        const randomQuotes = zenQuotes
          .slice(0, 10)
          .map((zenQuote, index) => transformZenQuote(zenQuote, keyword, index + 1))
        return NextResponse.json(randomQuotes)
      }
      
      return NextResponse.json(filteredQuotes)
    } else {
      // Devolver todas las citas transformadas para la landing
      const transformedQuotes = zenQuotes.map((zenQuote, index) => 
        transformZenQuote(zenQuote, 'inspirational', index + 1)
      )
      return NextResponse.json(transformedQuotes)
    }
    
  } catch (error) {
    console.error('Error fetching quotes from ZenQuotes API:', error)
    
    // Fallback a mockQuotes en caso de error
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword')
    
    if (keyword) {
      // Filtrar mockQuotes por keyword
      const filteredQuotes = mockQuotes
        .filter(quote => 
          quote.text.toLowerCase().includes(keyword.toLowerCase()) ||
          quote.author.toLowerCase().includes(keyword.toLowerCase()) ||
          quote.category.toLowerCase().includes(keyword.toLowerCase())
        )
        .slice(0, 10)
      
      if (filteredQuotes.length > 0) {
        return NextResponse.json(filteredQuotes)
      }
      
      // Si no hay coincidencias, devolver algunas mockQuotes aleatorias
      return NextResponse.json(
        mockQuotes.slice(0, 10).map(quote => ({ ...quote, category: keyword }))
      )
    } else {
      // Devolver mockQuotes aleatorias
      const shuffled = [...mockQuotes].sort(() => 0.5 - Math.random())
      return NextResponse.json(shuffled)
    }
  }
}

// Manejar otros métodos HTTP
export async function POST() {
  return new NextResponse('Method Not Allowed', { status: 405 })
}

export async function PUT() {
  return new NextResponse('Method Not Allowed', { status: 405 })
}

export async function DELETE() {
  return new NextResponse('Method Not Allowed', { status: 405 })
}