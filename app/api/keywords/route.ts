import { NextResponse } from 'next/server';
import { scrapeKeywords } from '@/lib/scrapper';

/**
 * GET /api/keywords - obtiene todas las keywords disponibles desde ZenQuotes.io
 * 
 * Esta ruta scrappea la página https://zenquotes.io/keywords para obtener
 * todas las palabras clave disponibles y las devuelve en formato JSON.
 * 
 * @returns {Promise<NextResponse>} Lista de keywords con sus URLs
 */
export async function GET() {
  try {
    console.log('🔍 Iniciando scrapping de keywords desde ZenQuotes.io...');
    
    // Obtener keywords usando el scrapper
    const keywords = await scrapeKeywords();
    
    if (!keywords || keywords.length === 0) {
      console.warn('⚠️ No se pudieron obtener keywords, devolviendo lista vacía');
      return NextResponse.json(
        { 
          success: false, 
          data: [], 
          message: 'No se pudieron obtener las keywords',
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      );
    }

    console.log(`✅ Se obtuvieron ${keywords.length} keywords exitosamente`);
    
    return NextResponse.json({
      success: true,
      data: keywords,
      count: keywords.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error al obtener keywords:', error);
    
    return NextResponse.json(
      {
        success: false,
        data: [],
        error: 'Error interno del servidor al obtener keywords',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}