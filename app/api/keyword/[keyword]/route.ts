import { NextResponse } from 'next/server';
import { scrapeQuotesByKeyword } from '@/lib/scrapper';

/**
 * GET /api/keyword/[keyword] - obtiene hasta 50 citas de una keyword específica
 * 
 * Esta ruta scrappea la página https://zenquotes.io/keywords/[keyword] para obtener
 * todas las citas relacionadas con esa palabra clave (hasta 50).
 * 
 * @param {Object} params - Parámetros de la ruta
 * @param {string} params.keyword - La palabra clave para buscar citas
 * @returns {Promise<NextResponse>} Lista de citas relacionadas con la keyword
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ keyword: string }> }
) {
  try {
    const { keyword } = await params;
    
    if (!keyword) {
      return NextResponse.json(
        {
          success: false,
          data: [],
          error: 'Keyword es requerida',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Obteniendo citas para keyword: ${keyword}`);
    
    // Obtener citas usando el scrapper
    const quotes = await scrapeQuotesByKeyword(keyword);
    
    if (!quotes || quotes.length === 0) {
      console.warn(`⚠️ No se encontraron citas para la keyword: ${keyword}`);
      return NextResponse.json(
        { 
          success: false, 
          data: [], 
          message: `No se encontraron citas para la keyword: ${keyword}`,
          keyword,
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      );
    }

    console.log(`✅ Se obtuvieron ${quotes.length} citas para keyword: ${keyword}`);
    
    return NextResponse.json({
      success: true,
      data: quotes,
      keyword,
      count: quotes.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ Error al obtener citas para keyword:`, error);
    
    return NextResponse.json(
      {
        success: false,
        data: [],
        error: 'Error interno del servidor al obtener citas',
        keyword: 'unknown',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}