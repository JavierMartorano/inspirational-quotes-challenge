"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { QuoteCard } from "@/components/quote-card";
import { Button } from "@/components/ui/button";
import { ZenQuotesService, mockQuotes, type Quote } from "@/lib/quotes";
import { getLastSelectedKeyword, setLastSelectedKeyword } from "@/lib/cookies";

// Lazy loading del modal para mejor performance - solo se carga cuando se necesita
const QuoteModal = lazy(() => import("@/components/quote-modal").then(module => ({ default: module.QuoteModal })));

/**
 * Página principal de la aplicación de citas inspiracionales
 * 
 * Funcionalidades principales:
 * - Muestra citas en formato "bricks" (tarjetas)
 * - Permite ver más citas por categoría en un modal
 * - Recuerda la última categoría seleccionada usando cookies
 * - Maneja estados de carga y errores con fallbacks
 */

export default function HomePage() {
  // Estados para el modal de citas por categoría
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | undefined>();
  const [modalQuotes, setModalQuotes] = useState<Quote[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  
  // Estados para las citas principales de la landing
  const [quotesToShow, setQuotesToShow] = useState(3);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar citas iniciales al montar el componente
  useEffect(() => {
    loadInitialQuotes();
  }, []);

  /**
   * Carga las citas iniciales según la documentación oficial de ZenQuotes
   * 
   * Lógica nueva (según documentación):
   * 1. Obtener todas las keywords desde /api/keywords
   * 2. Si existe lastSelectedKeyword en cookies, usarla como primera keyword
   * 3. Seleccionar 3 keywords (1 de cookie + 2 aleatorias, o 3 aleatorias)
   * 4. Para cada keyword, obtener 50 citas y mostrar solo 1 en cada brick
   * 5. Guardar las 50 citas de cada keyword para usar en modales
   */
  const loadInitialQuotes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Iniciando carga de citas según documentación oficial...');

      // 1. Obtener todas las keywords disponibles
      const allKeywords = await ZenQuotesService.getAllKeywords();
      console.log(`📋 Keywords obtenidas: ${allKeywords.length}`);

      if (allKeywords.length === 0) {
        throw new Error('No se pudieron obtener keywords');
      }

      // 2. Verificar si hay una keyword guardada en cookies
      const lastKeyword = getLastSelectedKeyword();
      
      // 3. Seleccionar 3 keywords para los bricks
      let selectedKeywords: string[] = [];
      
      if (lastKeyword && allKeywords.includes(lastKeyword)) {
        // Si hay keyword guardada, usarla como primera
        selectedKeywords.push(lastKeyword);
        
        // Agregar 2 keywords aleatorias diferentes
        const remainingKeywords = allKeywords.filter(k => k !== lastKeyword);
        const shuffled = remainingKeywords.sort(() => Math.random() - 0.5);
        selectedKeywords.push(...shuffled.slice(0, 2));
      } else {
        // Si no hay cookie, seleccionar 3 keywords aleatorias
        const shuffled = allKeywords.sort(() => Math.random() - 0.5);
        selectedKeywords = shuffled.slice(0, 3);
      }

      console.log(`🎯 Keywords seleccionadas: ${selectedKeywords.join(', ')}`);

      // 4. Para cada keyword, obtener 50 citas y mostrar solo 1
      const quotesForBricks: Quote[] = [];
      
      for (const keyword of selectedKeywords) {
        const response = await ZenQuotesService.getQuotesByKeyword(keyword);
        const keywordQuotes = response.data || [];
        
        if (keywordQuotes.length > 0) {
          // Tomar la primera cita para mostrar en el brick
          quotesForBricks.push(keywordQuotes[0]);
          console.log(`✅ Cita obtenida para "${keyword}": ${keywordQuotes.length} citas disponibles`);
        }
      }

      if (quotesForBricks.length === 0) {
        throw new Error('No se pudieron obtener citas para ninguna keyword');
      }

      setQuotes(quotesForBricks);
      console.log(`🎉 Carga completada: ${quotesForBricks.length} citas mostradas`);
      
    } catch (err) {
      console.error("❌ Error loading quotes:", err);
      setError("Error al cargar las citas. Mostrando contenido de respaldo.");
      // Usar mockQuotes como fallback
      setQuotes(mockQuotes.slice(0, 3));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja el click en el botón "more" de una tarjeta de cita
   * 
   * @param category - La categoría/keyword de la cita seleccionada
   * 
   * Funcionalidad:
   * 1. Guarda la keyword en cookies para recordarla
   * 2. Obtiene hasta 50 citas de esa categoría desde la API
   * 3. Muestra solo las primeras 10 en el modal
   * 4. En caso de error, usa mockQuotes filtradas como fallback
   */
  const handleMoreClick = async (category: string) => {
    try {
      setIsModalLoading(true);
      setFilterCategory(category);

      // Guardar la keyword seleccionada en cookies para próximas visitas
      setLastSelectedKeyword(category);

      // Obtener hasta 50 citas de la keyword y mostrar solo 10
      const response = await ZenQuotesService.getQuotesByKeyword(
        category
      );
      
      // Extraer las quotes del ApiResponse
      const categoryQuotes = response.data || [];
      setModalQuotes(categoryQuotes.slice(0, 10));

      setIsModalOpen(true);
    } catch (err) {
      console.error("Error loading category quotes:", err);
      // Usar mockQuotes filtradas como fallback
      const fallbackQuotes = mockQuotes
        .filter((quote) => quote.category === category)
        .slice(0, 10);
      setModalQuotes(fallbackQuotes);
      setIsModalOpen(true);
    } finally {
      setIsModalLoading(false);
    }
  };

  /**
   * Muestra 3 citas adicionales en la landing (paginación simple)
   */
  const handleViewMoreQuotes = () => {
    setQuotesToShow((prev) => Math.min(prev + 3, quotes.length));
  };

  const displayedQuotes = quotes.slice(0, quotesToShow);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Encuentra Tu{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Inspiración
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Descubre citas motivacionales que transformarán tu perspectiva y te
            impulsarán hacia tus objetivos más ambiciosos.
          </p>
        </div>
      </section>

      {/* Quotes Grid */}
      <section className="px-4">
        <div className="container mx-auto">
          {/* Mostrar error si existe */}
          {error && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-center max-w-2xl mx-auto">
              <p>{error}</p>
            </div>
          )}

          {/* Estado de carga */}
          {isLoading ? (
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-[280px] bg-gray-200 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {displayedQuotes.map((quote, id) => (
                <QuoteCard
                  key={id}
                  quote={quote}
                  onMoreClick={handleMoreClick}
                />
              ))}
            </div>
          )}

          {!isLoading && quotesToShow < quotes.length && (
            <div className="text-center mt-12">
              <Button
                onClick={handleViewMoreQuotes}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Ver Más Citas
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Modal con lazy loading - solo se carga cuando se abre */}
      {isModalOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4">Cargando...</div>
        </div>}>
          <QuoteModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            filterCategory={filterCategory}
            quotes={modalQuotes}
            isLoading={isModalLoading}
          />
        </Suspense>
      )}
    </div>
  );
}
