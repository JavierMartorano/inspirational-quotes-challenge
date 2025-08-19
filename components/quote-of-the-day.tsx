"use client"

import { useState, useEffect } from "react"
import { Quote, RefreshCw, Heart, Share2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZenQuotesService, mockQuotes } from "@/lib/quotes"
import type { Quote as QuoteType } from "@/lib/quotes"

export function QuoteOfTheDay() {
  const [currentQuote, setCurrentQuote] = useState<QuoteType | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar cita del día al montar el componente
  useEffect(() => {
    loadQuoteOfTheDay()
  }, [])

  const loadQuoteOfTheDay = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Llamar directamente al endpoint /api/qod
      const response = await fetch('/api/qod')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const plainText = await response.text()
      // Parsear el texto plano: "Cita" - Autor
      const match = plainText.match(/^"(.+)" - (.+)$/)
      if (match) {
        const quote: QuoteType = {
          id: 1,
          text: match[1],
          author: match[2],
          category: 'daily'
        }
        setCurrentQuote(quote)
      } else {
        throw new Error('Could not parse quote of the day')
      }
    } catch (err) {
      console.error('Error loading quote of the day:', err)
      setError('Error al cargar la cita del día. Mostrando contenido de respaldo.')
      // Usar una cita de mockQuotes como fallback
      setCurrentQuote(mockQuotes[2]) // Steve Jobs quote as fallback
    } finally {
      setIsLoading(false)
    }
  }

  const getRandomQuote = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Obtener una cita aleatoria de diferentes keywords
      const keywords = ['motivation', 'success', 'life', 'wisdom', 'happiness']
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]
      const quotes = await ZenQuotesService.getQuotesByKeyword(randomKeyword)
      
      if (quotes.length > 0) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
        setCurrentQuote(randomQuote)
      } else {
        // Fallback a mockQuotes
        const randomIndex = Math.floor(Math.random() * mockQuotes.length)
        setCurrentQuote(mockQuotes[randomIndex])
      }
    } catch (err) {
      console.error('Error loading random quote:', err)
      // Fallback a mockQuotes
      const randomIndex = Math.floor(Math.random() * mockQuotes.length)
      setCurrentQuote(mockQuotes[randomIndex])
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = () => {
    if (!currentQuote) return
    
    if (navigator.share) {
      navigator.share({
        title: "Cita Motivacional",
        text: `"${currentQuote.text}" - ${currentQuote.author}`,
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`"${currentQuote.text}" - ${currentQuote.author}`)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cita del Día</h1>
          <p className="text-lg text-muted-foreground">Una dosis diaria de inspiración para alimentar tu alma</p>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-center max-w-2xl mx-auto">
            <p>{error}</p>
          </div>
        )}

        <Card className="mx-auto max-w-3xl bg-gradient-to-br from-background to-muted/20 border-2">
          <CardContent className="p-8 md:p-12 text-center">
            <Quote className="h-16 w-16 text-blue-600 mx-auto mb-8" />

            {/* Estado de carga */}
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4 mx-auto w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded mb-4 mx-auto w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded mb-8 mx-auto w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 mx-auto w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded mb-8 mx-auto w-1/4"></div>
              </div>
            ) : currentQuote ? (
              <>
                <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed mb-8">
                  "{currentQuote.text}"
                </blockquote>

                <div className="mb-8">
                  <p className="text-xl font-semibold text-blue-600 mb-2">— {currentQuote.author}</p>
                  <p className="text-muted-foreground capitalize">{currentQuote.category}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No se pudo cargar la cita del día.</p>
              </div>
            )}

            {/* Botones solo si no está cargando y hay una cita */}
            {!isLoading && currentQuote && (
              <div className="flex flex-wrap justify-center gap-4">
                {/* Solo botón Compartir para simplificar la UI */}
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-transparent"
                  size="lg"
                >
                  <Share2 className="h-4 w-4" />
                  Compartir
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
