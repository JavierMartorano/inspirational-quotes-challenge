import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Interfaz para la respuesta de ZenQuotes API
interface ZenQuoteResponse {
  q: string // quote text
  a: string // author
  h: string // HTML formatted quote
}

/**
 * API Route para Quote of the Day (QOD)
 * Devuelve una cita del día en formato texto plano
 * Usa cache con cookies para evitar llamadas innecesarias
 * GET /api/qod
 */
export async function GET() {
  try {
    const cookieStore = cookies()
    const cachedQod = cookieStore.get('qod_cache')
    const cacheDate = cookieStore.get('qod_date')
    
    const today = new Date().toDateString()
    
    // Si tenemos cache del mismo día, devolverlo
    if (cachedQod && cacheDate && cacheDate.value === today) {
      return new NextResponse(cachedQod.value, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
        },
      })
    }
    
    // Llamar a ZenQuotes API para obtener quote of the day
    const apiKey = process.env.ZENQUOTES_API_KEY
    const base = apiKey ? `https://zenquotes.io/api/today/${apiKey}` : 'https://zenquotes.io/api/today'
    const response = await fetch(base, {
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const zenQuotes: ZenQuoteResponse[] = await response.json()
    
    if (!zenQuotes || zenQuotes.length === 0) {
      throw new Error('No quote of the day received')
    }
    
    const quote = zenQuotes[0]
    const plainText = `"${quote.q}" - ${quote.a}`
    
    // Guardar en cookies para cache diario
    const response_with_cookies = new NextResponse(plainText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
        'Set-Cookie': [
          `qod_cache=${encodeURIComponent(plainText)}; Path=/; Max-Age=86400; SameSite=Lax`,
          `qod_date=${today}; Path=/; Max-Age=86400; SameSite=Lax`
        ].join(', ')
      },
    })
    
    return response_with_cookies
    
  } catch (error) {
    console.error('Error fetching quote of the day:', error)
    
    // Fallback: devolver una cita estática en caso de error
    const fallbackQuote = '"El éxito es la suma de pequeños esfuerzos repetidos día tras día." - Robert Collier'
    
    return new NextResponse(fallbackQuote, {
      status: 200, // Devolver 200 aunque haya error para mantener la funcionalidad
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // Cache más corto para fallback (5 minutos)
      },
    })
  }
}

// Opcional: Manejar otros métodos HTTP
export async function POST() {
  return new NextResponse('Method Not Allowed', { status: 405 })
}

export async function PUT() {
  return new NextResponse('Method Not Allowed', { status: 405 })
}

export async function DELETE() {
  return new NextResponse('Method Not Allowed', { status: 405 })
}