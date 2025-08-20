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
  
  // Estado para almacenar las 50 citas de cada keyword (para los modales)
  const [quotesStorage, setQuotesStorage] = useState<{ [key: string]: Quote[] }>({});

  // Cargar citas iniciales al montar el componente
  useEffect(() => {
    loadInitialQuotes();
  }, []);

  /**
   * Carga las citas iniciales usando el NUEVO FLUJO PRINCIPAL
   * 
   * FLUJO CORRECTO:
   * 1. Obtiene TODAS las keywords desde ZenQuotes.io
   * 2. Elige 3 keywords aleatorias
   * 3. Obtiene 50 citas para cada keyword (total: 150 citas)
   * 4. Muestra 1 cita de cada keyword (total: 3 citas en la landing)
   * 5. Guarda las 50 citas de cada keyword para el modal
   */
  const loadInitialQuotes = async () => {
    try {
      console.log('🚀 Iniciando NUEVO FLUJO: keywords → 3 aleatorias → 50 citas c/u...');
      setIsLoading(true);
      setError(null);

      // NUEVO FLUJO: Obtener keywords, elegir 3 aleatorias, obtener 50 citas de cada una
      const keywordQuotesData = await ZenQuotesService.getInitialQuotesWithKeywords();
      
      console.log('📊 Datos obtenidos:', keywordQuotesData.map(item => `${item.keyword}: ${item.quotes.length} citas`));
      
      // Guardar todas las citas por keyword para usar en los modales
      const quotesStorage: { [key: string]: Quote[] } = {};
      const displayQuotes: Quote[] = [];
      
      keywordQuotesData.forEach(item => {
        // Guardar las 50 citas para el modal
        quotesStorage[item.keyword] = item.quotes;
        
        // Tomar 1 cita aleatoria para mostrar en la landing
        if (item.quotes.length > 0) {
          const randomIndex = Math.floor(Math.random() * item.quotes.length);
          displayQuotes.push(item.quotes[randomIndex]);
        }
      });
      
      // Guardar las citas en el estado para los modales
      setQuotesStorage(quotesStorage);
      
      // Verificar si hay una keyword guardada en cookies para priorizar
      const lastKeyword = getLastSelectedKeyword();
      if (lastKeyword && quotesStorage[lastKeyword]) {
        console.log(`🍪 Priorizando keyword guardada: ${lastKeyword}`);
        // Mover la cita de la keyword guardada al principio
        const priorityQuote = quotesStorage[lastKeyword][0];
        const otherQuotes = displayQuotes.filter(q => q.category !== lastKeyword);
        setQuotes([priorityQuote, ...otherQuotes.slice(0, 2)]);
      } else {
        setQuotes(displayQuotes.slice(0, 3));
      }
      
      console.log('✅ Flujo principal completado. Mostrando 3 citas de diferentes keywords.');
      
    } catch (err) {
      console.error("❌ Error en flujo principal:", err);
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
   * NUEVA FUNCIONALIDAD:
   * 1. Guarda la keyword en cookies para recordarla
   * 2. Usa las 50 citas YA OBTENIDAS y almacenadas en quotesStorage
   * 3. Muestra solo las primeras 10 en el modal
   * 4. Si no hay citas almacenadas, obtiene 50 nuevas desde la API
   * 5. En caso de error, usa mockQuotes filtradas como fallback
   */
  const handleMoreClick = async (category: string) => {
    try {
      setIsModalLoading(true);
      setFilterCategory(category);

      // Guardar la keyword seleccionada en cookies para próximas visitas
      setLastSelectedKeyword(category);

      console.log(`🔍 Mostrando citas para: ${category}`);
      
      // NUEVA LÓGICA: Usar las citas ya almacenadas en quotesStorage
      if (quotesStorage[category] && quotesStorage[category].length > 0) {
        console.log(`✅ Usando ${quotesStorage[category].length} citas almacenadas para '${category}'`);
        // Mostrar 10 de las 50 citas ya obtenidas
        setModalQuotes(quotesStorage[category].slice(0, 10));
      } else {
        console.log(`🔄 No hay citas almacenadas para '${category}', obteniendo nuevas...`);
        // Fallback: obtener 50 citas nuevas si no están en storage
        const newQuotes = await ZenQuotesService.get50QuotesByKeyword(category);
        
        // Actualizar el storage con las nuevas citas
        setQuotesStorage(prev => ({
          ...prev,
          [category]: newQuotes
        }));
        
        // Mostrar 10 de las 50 citas obtenidas
        setModalQuotes(newQuotes.slice(0, 10));
      }

      setIsModalOpen(true);
    } catch (err) {
      console.error("❌ Error loading category quotes:", err);
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
   * Carga 3 citas completamente nuevas con keywords diferentes
   */
  const handleViewMoreQuotes = async () => {
    try {
      // Obtener 3 nuevas citas con keywords diferentes
      const newQuotesData = await ZenQuotesService.getInitialQuotesWithKeywords();
      
      // Extraer una cita por keyword (3 citas nuevas)
      const newQuotes = newQuotesData.map(item => item.quotes[0]).filter(Boolean);
      
      // Agregar las nuevas citas a las existentes
      setQuotes(prev => [...prev, ...newQuotes]);
      
      // Actualizar el storage con todas las citas de las nuevas keywords
      const newStorage: Record<string, Quote[]> = {};
      newQuotesData.forEach(item => {
        newStorage[item.keyword] = item.quotes;
      });
      
      setQuotesStorage(prev => ({ ...prev, ...newStorage }));
      
      console.log(`✅ Agregadas ${newQuotes.length} citas nuevas`);
      
    } catch (err) {
      console.error('❌ Error cargando más citas:', err);
      // Fallback: agregar 3 mockQuotes aleatorias
      const randomMockQuotes = mockQuotes
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setQuotes(prev => [...prev, ...randomMockQuotes]);
    } finally {
      setIsLoading(false);
    }
  };

  const displayedQuotes = quotes;

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

          {!isLoading && (
            <div className="text-center mt-12 mb-12">
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
