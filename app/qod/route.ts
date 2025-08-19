import { NextResponse } from 'next/server'

// Route handler que devuelve la quote of the day en texto plano
export async function GET() {
  try {
    // Obtener la URL base correcta
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000' // Puerto local correcto
    
    // Llamar a nuestra API interna que ya maneja el cache
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