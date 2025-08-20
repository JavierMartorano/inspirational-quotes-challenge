// Imports para funciones de scrapping
import { scrapeQuotesByKeyword, getRandomKeywords, type ScrapedQuote } from './scrapper'

// Interfaz para las citas compatible con ZenQuotes API
export interface Quote {
  readonly id: number
  readonly text: string // 'q' en la API de ZenQuotes
  readonly author: string // 'a' en la API de ZenQuotes
  readonly category: string // keyword usada para la búsqueda
}

// Interfaz para la respuesta de ZenQuotes API (mantenida para compatibilidad)
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

// Tipo para keywords válidas - ahora dinámico basado en scrapping
export type QuoteKeyword = string // Cualquier keyword obtenida del scrapping

// Función para transformar respuesta de ZenQuotes a nuestra interfaz (mantenida para compatibilidad)
export function transformZenQuote(zenQuote: ZenQuoteResponse, category: QuoteKeyword = 'inspirational', id?: number): Quote {
  return {
    id: id || Math.floor(Math.random() * 10000),
    text: zenQuote.q,
    author: zenQuote.a,
    category: category
  }
}

// Función para transformar cita scrapeada a nuestra interfaz Quote
export function transformScrapedQuote(scrapedQuote: ScrapedQuote, id?: number): Quote {
  return {
    id: id || Math.floor(Math.random() * 10000),
    text: scrapedQuote.text,
    author: scrapedQuote.author,
    category: scrapedQuote.keyword
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

  // ========== MÉTODOS DE SCRAPPING (RAMA DEVELOP) ==========

  /**
   * Obtiene citas usando scrapping directo desde ZenQuotes
   * Este método reemplaza getQuotesByKeyword para la rama develop
   * 
   * @param keyword - La palabra clave para buscar citas
   * @returns Promise<ApiResponse<Quote[]>> - Respuesta con array de hasta 10 citas
   */
  static async getQuotesByKeywordScraping(keyword: string): Promise<ApiResponse<Quote[]>> {
    try {
      console.log(`🔍 Scrapeando citas para keyword: ${keyword}`);
      
      // Scrapear hasta 50 citas de la keyword
      const scrapedQuotes = await scrapeQuotesByKeyword(keyword);
      
      if (scrapedQuotes.length === 0) {
        throw new Error(`No se encontraron citas para la keyword: ${keyword}`);
      }

      // Tomar solo 10 citas aleatorias de las 50 obtenidas
      const shuffled = [...scrapedQuotes].sort(() => Math.random() - 0.5);
      const selectedQuotes = shuffled.slice(0, 10);
      
      // Transformar a nuestro formato Quote
      const quotes: Quote[] = selectedQuotes.map((scrapedQuote, index) => 
        transformScrapedQuote(scrapedQuote, Date.now() + index)
      );

      console.log(`✅ Obtenidas ${quotes.length} citas para ${keyword}`);
      
      return {
        success: true,
        data: quotes,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error(`❌ Error scrapeando citas para ${keyword}:`, error);
      
      // Fallback a mockQuotes filtradas por keyword
      const fallbackQuotes = mockQuotes
        .filter(quote => 
          quote.category.toLowerCase().includes(keyword.toLowerCase()) ||
          quote.text.toLowerCase().includes(keyword.toLowerCase())
        )
        .slice(0, 10);
      
      return {
        success: false,
        data: fallbackQuotes,
        error: error instanceof Error ? error.message : 'Error desconocido en scrapping',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Obtiene 3 citas aleatorias usando scrapping
   * Una de cada keyword diferente para la landing principal
   * 
   * @returns Promise<Quote[]> - Array de 3 citas de keywords diferentes
   */
  static async getRandomQuotesScraping(): Promise<Quote[]> {
    try {
      console.log('🎲 Obteniendo 3 citas aleatorias con scrapping...');
      
      // Obtener 3 keywords aleatorias
      const randomKeywords = await getRandomKeywords();
      
      if (randomKeywords.length === 0) {
        throw new Error('No se pudieron obtener keywords para scrapping');
      }

      const quotes: Quote[] = [];
      
      // Obtener una cita de cada keyword
      for (const keyword of randomKeywords) {
        try {
          const scrapedQuotes = await scrapeQuotesByKeyword(keyword);
          if (scrapedQuotes.length > 0) {
            // Tomar una cita aleatoria de esta keyword
            const randomIndex = Math.floor(Math.random() * scrapedQuotes.length);
            const selectedQuote = scrapedQuotes[randomIndex];
            quotes.push(transformScrapedQuote(selectedQuote, Date.now() + quotes.length));
          }
        } catch (keywordError) {
          console.warn(`⚠️ Error scrapeando keyword ${keyword}:`, keywordError);
          // Continuar con la siguiente keyword
        }
      }

      // Si no obtuvimos suficientes citas, completar con mockQuotes
      while (quotes.length < 3 && quotes.length < mockQuotes.length) {
        const randomMockQuote = mockQuotes[Math.floor(Math.random() * mockQuotes.length)];
        if (!quotes.find(q => q.id === randomMockQuote.id)) {
          quotes.push({ ...randomMockQuote, id: Date.now() + quotes.length });
        }
      }

      console.log(`✅ Obtenidas ${quotes.length} citas aleatorias`);
      return quotes.slice(0, 3); // Asegurar máximo 3 citas
      
    } catch (error) {
      console.error('❌ Error obteniendo citas aleatorias con scrapping:', error);
      // Fallback completo a mockQuotes
      return mockQuotes.slice(0, 3).map((quote, index) => ({
        ...quote,
        id: Date.now() + index
      }));
    }
  }

  /**
   * Obtiene una cita específica de una keyword usando scrapping
   * Útil para cuando se restaura desde cookie la última keyword seleccionada
   * 
   * @param keyword - La keyword específica
   * @returns Promise<Quote | null> - Una cita de esa keyword o null si no se encuentra
   */
  static async getSingleQuoteByKeywordScraping(keyword: string): Promise<Quote | null> {
    try {
      console.log(`🎯 Obteniendo una cita específica para: ${keyword}`);
      
      const scrapedQuotes = await scrapeQuotesByKeyword(keyword);
      
      if (scrapedQuotes.length === 0) {
        return null;
      }

      // Tomar una cita aleatoria
      const randomIndex = Math.floor(Math.random() * scrapedQuotes.length);
      const selectedQuote = scrapedQuotes[randomIndex];
      
      return transformScrapedQuote(selectedQuote, Date.now());
      
    } catch (error) {
      console.error(`❌ Error obteniendo cita específica para ${keyword}:`, error);
      return null;
    }
  }

  /**
   * NUEVO FLUJO PRINCIPAL: Obtiene todas las keywords, elige 3 aleatorias y obtiene 50 citas de cada una
   * Este es el método principal que implementa el flujo correcto del proyecto
   * @returns Array de objetos con keyword y sus 50 citas
   */
  static async getInitialQuotesWithKeywords(): Promise<Array<{ keyword: string; quotes: Quote[] }>> {
    try {
      console.log('🔄 Iniciando flujo principal: obtener keywords y citas...');
      
      // 1. Obtener todas las keywords desde la API
      const keywordsResponse = await fetch(`${this.config.baseUrl}/keywords`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!keywordsResponse.ok) {
        throw new Error(`Error HTTP: ${keywordsResponse.status}`);
      }

      const keywordsData = await keywordsResponse.json();
      
      if (!keywordsData.success || !keywordsData.data || keywordsData.data.length === 0) {
        throw new Error('No se pudieron obtener keywords');
      }

      console.log(`✅ Se obtuvieron ${keywordsData.data.length} keywords`);

      // 2. Elegir 3 keywords aleatorias
      const allKeywords = keywordsData.data;
      const shuffled = [...allKeywords].sort(() => 0.5 - Math.random());
      const selectedKeywords = shuffled.slice(0, 3);

      console.log(`🎲 Keywords seleccionadas:`, selectedKeywords.map(k => k.name));

      // 3. Obtener 50 citas para cada keyword seleccionada
      const quotesPromises = selectedKeywords.map(async (keywordObj) => {
        try {
          const response = await fetch(`${this.config.baseUrl}/keyword/${encodeURIComponent(keywordObj.name)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(this.config.timeout)
          });

          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }

          const quotesData = await response.json();
          
          if (quotesData.success && quotesData.data) {
            // Transformar las citas scrapeadas a nuestro formato
            const transformedQuotes = quotesData.data.map((quote: any, index: number) => 
              transformScrapedQuote(quote, index + Math.floor(Math.random() * 1000))
            );
            
            console.log(`✅ Obtenidas ${transformedQuotes.length} citas para '${keywordObj.name}'`);
            
            return {
              keyword: keywordObj.name,
              quotes: transformedQuotes
            };
          } else {
            throw new Error(`No se pudieron obtener citas para ${keywordObj.name}`);
          }
        } catch (error) {
          console.error(`❌ Error obteniendo citas para '${keywordObj.name}':`, error);
          // Fallback: usar mockQuotes para esta keyword
          const fallbackQuotes = mockQuotes.slice(0, 3).map(quote => ({
            ...quote,
            category: keywordObj.name
          }));
          
          return {
            keyword: keywordObj.name,
            quotes: fallbackQuotes
          };
        }
      });

      const results = await Promise.all(quotesPromises);
      console.log('🎉 Flujo principal completado exitosamente');
      
      return results;
      
    } catch (error) {
      console.error('❌ Error en flujo principal:', error);
      
      // Fallback completo: usar mockQuotes con keywords ficticias
      const fallbackKeywords = ['inspiración', 'motivación', 'éxito'];
      return fallbackKeywords.map(keyword => ({
        keyword,
        quotes: mockQuotes.slice(0, 10).map(quote => ({ ...quote, category: keyword }))
      }));
    }
  }

  /**
   * Obtiene 50 citas para una keyword específica usando la API route
   * @param keyword - La palabra clave
   * @returns Array de hasta 50 citas
   */
  static async get50QuotesByKeyword(keyword: string): Promise<Quote[]> {
    try {
      console.log(`🔍 Obteniendo 50 citas para keyword: ${keyword}`);
      
      const response = await fetch(`${this.config.baseUrl}/keyword/${encodeURIComponent(keyword)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const quotesData = await response.json();
      
      if (quotesData.success && quotesData.data) {
        // Transformar las citas scrapeadas a nuestro formato
        const transformedQuotes = quotesData.data.map((quote: any, index: number) => 
          transformScrapedQuote(quote, index + Math.floor(Math.random() * 1000))
        );
        
        console.log(`✅ Obtenidas ${transformedQuotes.length} citas para '${keyword}'`);
        return transformedQuotes;
      } else {
        throw new Error(`No se pudieron obtener citas para ${keyword}`);
      }
      
    } catch (error) {
      console.error(`❌ Error obteniendo 50 citas para '${keyword}':`, error);
      
      // Fallback: usar mockQuotes
      return mockQuotes.slice(0, 10).map(quote => ({ ...quote, category: keyword }));
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
