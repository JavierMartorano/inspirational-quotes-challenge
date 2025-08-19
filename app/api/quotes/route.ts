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

    // Leer API key opcional desde variables de entorno
    const apiKey = process.env.ZENQUOTES_API_KEY
    const base = apiKey ? `https://zenquotes.io/api/quotes/${apiKey}` : 'https://zenquotes.io/api/quotes'
    
    // Llamar a ZenQuotes API desde el servidor para evitar CORS
    const endpoint = keyword
      ? `${base}?keyword=${encodeURIComponent(keyword)}`
      : base

    const response = await fetch(endpoint, {
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
      // Mostrar solo 10 aunque la API devuelva hasta 50
      const firstTen = zenQuotes.slice(0, 10)
      const transformed = firstTen.map((zq, index) => transformZenQuote(zq, keyword, index + 1))
      
      // Si no hay citas, fallback a aleatorias con categoría keyword
      if (transformed.length === 0) {
        const randomTen = zenQuotes.slice(0, 10).map((zq, index) => transformZenQuote(zq, keyword, index + 1))
        return NextResponse.json(randomTen)
      }
      
      return NextResponse.json(transformed)
    } else {
      // Devolver todas transformadas para la landing
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
      
      // Si no hay coincidencias, devolver algunas mockQuotes aleatorias con esa categoría
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