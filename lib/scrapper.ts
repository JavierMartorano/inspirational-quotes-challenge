// Funciones de scrapping para extraer datos de ZenQuotes sin usar la API oficial
// Esta implementación parsea el HTML directamente desde las páginas web

export interface ScrapedKeyword {
  readonly name: string
  readonly url: string
}

export interface ScrapedQuote {
  readonly text: string
  readonly author: string
  readonly keyword: string
}

/**
 * Extrae todas las keywords disponibles desde https://zenquotes.io/keywords
 * Busca enlaces con class="stretched-link" y href="../keywords/*"
 * 
 * @returns Promise<ScrapedKeyword[]> - Array de keywords con sus URLs
 */
export async function scrapeKeywords(): Promise<ScrapedKeyword[]> {
  try {
    console.log('🔍 Scrapeando keywords desde ZenQuotes...');
    
    const response = await fetch('https://zenquotes.io/keywords', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const keywords: ScrapedKeyword[] = [];

    // Regex para encontrar enlaces con class="stretched-link" y href="../keywords/*"
    const linkRegex = /<a[^>]*class="[^"]*stretched-link[^"]*"[^>]*href="\.\.\/keywords\/([^"]+)"[^>]*>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const keywordName = match[1];
      if (keywordName && !keywords.find(k => k.name === keywordName)) {
        keywords.push({
          name: keywordName,
          url: `https://zenquotes.io/keywords/${keywordName}`
        });
      }
    }

    console.log(`✅ Encontradas ${keywords.length} keywords`);
    return keywords;

  } catch (error) {
    console.error('❌ Error scrapeando keywords:', error);
    // Fallback con keywords comunes si falla el scrapping
    return [
      { name: 'love', url: 'https://zenquotes.io/keywords/love' },
      { name: 'success', url: 'https://zenquotes.io/keywords/success' },
      { name: 'life', url: 'https://zenquotes.io/keywords/life' },
      { name: 'happiness', url: 'https://zenquotes.io/keywords/happiness' },
      { name: 'motivation', url: 'https://zenquotes.io/keywords/motivation' },
      { name: 'wisdom', url: 'https://zenquotes.io/keywords/wisdom' },
      { name: 'courage', url: 'https://zenquotes.io/keywords/courage' },
      { name: 'hope', url: 'https://zenquotes.io/keywords/hope' },
      { name: 'dreams', url: 'https://zenquotes.io/keywords/dreams' },
      { name: 'change', url: 'https://zenquotes.io/keywords/change' }
    ];
  }
}

/**
 * Extrae citas desde una página específica de keyword
 * Busca elementos <blockquote class="blockquote"> y extrae texto y autor
 * 
 * @param keyword - La keyword para buscar citas
 * @returns Promise<ScrapedQuote[]> - Array de hasta 50 citas
 */
export async function scrapeQuotesByKeyword(keyword: string): Promise<ScrapedQuote[]> {
  try {
    console.log(`🔍 Scrapeando citas para keyword: ${keyword}`);
    
    const response = await fetch(`https://zenquotes.io/keywords/${keyword}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const quotes: ScrapedQuote[] = [];

    // Regex para encontrar blockquotes con class="blockquote"
    const quoteRegex = /<blockquote[^>]*class="[^"]*blockquote[^"]*"[^>]*>([^<]+)<\/blockquote>/gi;
    let match;

    while ((match = quoteRegex.exec(html)) !== null && quotes.length < 50) {
      let fullText = match[1].trim();
      
      // Decodificar entidades HTML
      fullText = fullText
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      // Separar texto de la cita y autor (formato: "Cita" — Autor)
      const authorMatch = fullText.match(/^"(.+)"\s*—\s*(.+)$/);
      
      if (authorMatch) {
        const [, text, author] = authorMatch;
        quotes.push({
          text: text.trim(),
          author: author.trim(),
          keyword
        });
      } else {
        // Si no tiene el formato esperado, usar todo como texto
        quotes.push({
          text: fullText,
          author: 'Unknown',
          keyword
        });
      }
    }

    console.log(`✅ Encontradas ${quotes.length} citas para ${keyword}`);
    return quotes;

  } catch (error) {
    console.error(`❌ Error scrapeando citas para ${keyword}:`, error);
    return [];
  }
}

/**
 * Obtiene keywords desde localStorage o las scrapea si no existen
 * Implementa cache para evitar requests repetitivos
 * 
 * @returns Promise<ScrapedKeyword[]> - Array de keywords disponibles
 */
export async function getKeywordsWithCache(): Promise<ScrapedKeyword[]> {
  const CACHE_KEY = 'zenquotes_keywords';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en millisegundos

  try {
    // Intentar obtener desde localStorage
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      
      if (!isExpired && Array.isArray(data) && data.length > 0) {
        console.log('📦 Usando keywords desde cache');
        return data;
      }
    }
  } catch (error) {
    console.warn('⚠️ Error leyendo cache de keywords:', error);
  }

  // Si no hay cache válido, scrapear nuevamente
  const keywords = await scrapeKeywords();
  
  // Guardar en localStorage
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: keywords,
      timestamp: Date.now()
    }));
    console.log('💾 Keywords guardadas en cache');
  } catch (error) {
    console.warn('⚠️ Error guardando keywords en cache:', error);
  }

  return keywords;
}

/**
 * Obtiene 3 keywords aleatorias para mostrar en la landing
 * 
 * @returns Promise<string[]> - Array de 3 keywords aleatorias
 */
export async function getRandomKeywords(): Promise<string[]> {
  const keywords = await getKeywordsWithCache();
  
  // Mezclar array y tomar 3 elementos
  const shuffled = [...keywords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(k => k.name);
}