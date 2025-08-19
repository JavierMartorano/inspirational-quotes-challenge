// Interfaz para las citas compatible con ZenQuotes API
export interface Quote {
  readonly id: number
  readonly text: string // 'q' en la API de ZenQuotes
  readonly author: string // 'a' en la API de ZenQuotes
  readonly category: string // keyword usada para la búsqueda
}

// Interfaz para la respuesta de ZenQuotes API
export interface ZenQuoteResponse {
  readonly q: string // quote text
  readonly a: string // author
  readonly i?: string // image (opcional)
  readonly c: string // character count
  readonly h?: string // html (opcional)
}

// Interfaz para respuestas de API con manejo de errores
export interface ApiResponse<T> {
  readonly success: boolean
  readonly data?: T
  readonly error?: string
  readonly timestamp: number
}

// Interfaz para configuración de servicio
export interface ServiceConfig {
  readonly timeout: number
  readonly maxRetries: number
  readonly baseUrl: string
}

// Tipo para keywords válidas
export type QuoteKeyword = 
  | 'éxito' | 'acción' | 'trabajo' | 'sueños' | 'crecimiento' 
  | 'hábitos' | 'oportunidad' | 'fracaso' | 'autoestima' 
  | 'disciplina' | 'límites' | 'persistencia' | 'limitaciones' 
  | 'actitud' | 'excelencia' | 'inspirational'

// Función para transformar respuesta de ZenQuotes a nuestra interfaz
export function transformZenQuote(zenQuote: ZenQuoteResponse, category: QuoteKeyword = 'inspirational', id?: number): Quote {
  return {
    id: id || Math.floor(Math.random() * 10000),
    text: zenQuote.q,
    author: zenQuote.a,
    category: category
  }
}

/**
 * Servicio para obtener citas usando API routes internas (evita CORS)
 * 
 * Este servicio actúa como un wrapper para las API routes de Next.js,
 * proporcionando métodos para obtener citas de diferentes formas:
 * - Por palabra clave (hasta 50 citas, mostramos 10)
 * - Cita del día
 * - Citas aleatorias
 * 
 * Incluye manejo de errores, timeouts y fallbacks a datos mock
 */
export class ZenQuotesService {
  private static readonly config: ServiceConfig = {
    timeout: 10000, // 10 segundos - tiempo límite para requests HTTP
    maxRetries: 2,   // número de reintentos en caso de fallo
    baseUrl: '/api'  // base URL para las API routes internas
  }

  /**
   * Obtiene citas relacionadas con una palabra clave específica
   * 
   * @param keyword - La palabra clave para filtrar las citas
   * @returns Promise<ApiResponse<Quote[]>> - Respuesta con array de citas o error
   * 
   * Comportamiento:
   * - Hace request a /api/quotes con el parámetro keyword
   * - Timeout de 10 segundos con AbortController
   * - En caso de error, devuelve mockQuotes filtradas como fallback
   * - Transforma las respuestas de ZenQuotes a nuestro formato Quote
   */
  static async getQuotesByKeyword(keyword: QuoteKeyword): Promise<ApiResponse<Quote[]>> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      // Usar API route interna que llama a ZenQuotes desde el servidor
      const response = await fetch(`${this.config.baseUrl}/quotes?keyword=${encodeURIComponent(keyword)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const quotes: Quote[] = await response.json()
      return {
        success: true,
        data: quotes,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Error fetching quotes by keyword:', error)
      // Fallback a mockQuotes filtradas por keyword
      const fallbackQuotes = mockQuotes
        .filter(quote => 
          quote.category.toLowerCase().includes(keyword.toLowerCase()) ||
          quote.text.toLowerCase().includes(keyword.toLowerCase())
        )
        .slice(0, 10)
      
      return {
        success: false,
        data: fallbackQuotes,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Obtiene la cita del día desde la API
   * 
   * @returns Promise<Quote> - La cita del día
   * 
   * Comportamiento:
   * - Hace request a /api/qod (Quote of the Day)
   * - Timeout de 10 segundos
   * - En caso de error, devuelve una cita aleatoria de mockQuotes
   * - La cita del día es la misma durante todo el día
   */
  static async getQuoteOfTheDay(): Promise<Quote> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch('/api/qod', {
        signal: controller.signal,
        headers: {
          'Accept': 'text/plain',
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const plainText = await response.text()
      // Parsear el texto plano: "Cita" - Autor
      const match = plainText.match(/^"(.+)" - (.+)$/)
      if (match) {
        return {
          id: 1,
          text: match[1],
          author: match[2],
          category: 'daily'
        }
      }
      
      throw new Error('Could not parse quote of the day')
    } catch (error) {
      console.error('Error fetching quote of the day:', error)
      // Fallback a una cita aleatoria de mockQuotes
      const randomIndex = Math.floor(Math.random() * mockQuotes.length)
      return { ...mockQuotes[randomIndex], category: 'daily' }
    }
  }

  /**
   * Obtiene citas aleatorias de diferentes categorías
   * 
   * @returns Promise<Quote[]> - Array de citas aleatorias
   * 
   * Comportamiento:
   * - Obtiene citas completamente aleatorias
   * - Timeout de 10 segundos
   * - En caso de error, devuelve mockQuotes aleatorias como fallback
   */
  static async getRandomQuotes(): Promise<Quote[]> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch('/api/quotes', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const quotes: Quote[] = await response.json()
      return quotes
    } catch (error) {
      console.error('Error fetching random quotes:', error)
      // Fallback a mockQuotes
      return mockQuotes
    }
  }
}

// Cache local para fallback
export const mockQuotes: Quote[] = [
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
  },
  {
    id: 7,
    text: "Cada día es una nueva oportunidad para cambiar tu vida.",
    author: "Anónimo",
    category: "oportunidad",
  },
  {
    id: 8,
    text: "El fracaso es simplemente la oportunidad de comenzar de nuevo, esta vez de forma más inteligente.",
    author: "Henry Ford",
    category: "fracaso",
  },
  {
    id: 9,
    text: "Cree en ti mismo y todo será posible.",
    author: "Anónimo",
    category: "autoestima",
  },
  {
    id: 10,
    text: "La disciplina es el puente entre metas y logros.",
    author: "Jim Rohn",
    category: "disciplina",
  },
  {
    id: 11,
    text: "No dejes que lo que no puedes hacer interfiera con lo que sí puedes hacer.",
    author: "John Wooden",
    category: "acción",
  },
  {
    id: 12,
    text: "El único límite para nuestros logros de mañana son nuestras dudas de hoy.",
    author: "Franklin D. Roosevelt",
    category: "límites",
  },
  {
    id: 13,
    text: "La persistencia es el camino del éxito.",
    author: "Charles Chaplin",
    category: "persistencia",
  },
  {
    id: 14,
    text: "Tu única limitación eres tú mismo.",
    author: "Anónimo",
    category: "limitaciones",
  },
  {
    id: 15,
    text: "La vida es 10% lo que te sucede y 90% cómo reaccionas a ello.",
    author: "Charles R. Swindoll",
    category: "actitud",
  },
  {
    id: 16,
    text: "El momento de plantar un árbol fue hace 20 años. El segundo mejor momento es ahora.",
    author: "Proverbio Chino",
    category: "acción",
  },
  {
    id: 17,
    text: "No busques que las cosas sean más fáciles, busca ser mejor.",
    author: "Jim Rohn",
    category: "crecimiento",
  },
  {
    id: 18,
    text: "La diferencia entre ordinario y extraordinario es ese pequeño 'extra'.",
    author: "Jimmy Johnson",
    category: "excelencia",
  },
]
