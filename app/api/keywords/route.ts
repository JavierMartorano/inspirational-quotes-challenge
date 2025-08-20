import { NextResponse } from 'next/server'

/**
 * API Route para obtener todas las keywords disponibles desde ZenQuotes
 * Endpoint oficial: https://zenquotes.io/api/keywords/[YOUR_API_KEY]
 * 
 * Esta ruta maneja el cache de keywords y utiliza la API key si está disponible
 */
export async function GET() {
  try {
    // Obtener API key desde variables de entorno
    const apiKey = process.env.ZENQUOTES_API_KEY
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('⚠️ ZENQUOTES_API_KEY no configurada. Usando keywords por defecto.')
      
      // Keywords por defecto basadas en la documentación de ZenQuotes
      const defaultKeywords = [
        'love', 'happiness', 'success', 'motivation', 'inspiration',
        'wisdom', 'life', 'friendship', 'courage', 'hope',
        'dreams', 'change', 'leadership', 'creativity', 'peace',
        'strength', 'gratitude', 'mindfulness', 'growth', 'perseverance',
        'kindness', 'faith', 'adventure', 'learning', 'freedom'
      ]
      
      return NextResponse.json({
        success: true,
        data: defaultKeywords,
        source: 'fallback',
        timestamp: Date.now()
      })
    }
    
    // Construir URL oficial según documentación
    const zenQuotesUrl = `https://zenquotes.io/api/keywords/${apiKey}`
    
    console.log('🔑 Obteniendo keywords desde ZenQuotes API oficial...')
    
    const response = await fetch(zenQuotesUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Inspirational-Quotes-Challenge/1.0'
      },
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      throw new Error(`ZenQuotes API error: ${response.status} ${response.statusText}`)
    }
    
    const keywords = await response.json()
    
    console.log(`✅ Keywords obtenidas exitosamente: ${keywords.length} keywords`)
    
    return NextResponse.json({
      success: true,
      data: keywords,
      source: 'zenquotes_api',
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('❌ Error obteniendo keywords:', error)
    
    // Fallback a keywords por defecto en caso de error
    const fallbackKeywords = [
      'love', 'happiness', 'success', 'motivation', 'inspiration',
      'wisdom', 'life', 'friendship', 'courage', 'hope',
      'dreams', 'change', 'leadership', 'creativity', 'peace'
    ]
    
    return NextResponse.json({
      success: true,
      data: fallbackKeywords,
      source: 'fallback_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    })
  }
}