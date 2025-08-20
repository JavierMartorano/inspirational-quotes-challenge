import { NextRequest, NextResponse } from 'next/server'

// Route handler que devuelve la quote of the day en texto plano
export async function GET(request: NextRequest) {
  try {
    // Construir baseUrl dinámicamente desde la request para evitar puertos hardcodeados
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3001'
    const baseUrl = `${protocol}://${host}`
    
    // Llamar a mi API interna que ya maneja el cache
    const response = await fetch(`${baseUrl}/api/qod`, {
      cache: 'no-store' // Permitir que la API maneje su propio cache
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch quote')
    }
    
    const quoteText = await response.text()
    
    // Devolver como texto plano
    return new NextResponse(quoteText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    })
  } catch (error) {
    console.error('Error fetching QOD:', error)
    // Fallback en caso de error
    return new NextResponse('"The only way to do great work is to love what you do." - Steve Jobs', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }
}