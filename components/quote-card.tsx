"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Quote as QuoteIcon } from "lucide-react"
import { Quote } from "@/lib/quotes"

/**
 * Props para el componente QuoteCard
 */
interface QuoteCardProps {
  /** La cita a mostrar con su texto, autor y categoría */
  quote: Quote
  /** Función callback que se ejecuta al hacer clic en "Más" */
  onMoreClick: (keyword: string) => void
}

export const QuoteCard = React.memo(function QuoteCard({ quote, onMoreClick }: QuoteCardProps) {
  const keyword = quote.category
  return (
    <Card className="h-full min-h-[280px] transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex-1">
          <QuoteIcon className="h-8 w-8 text-blue-600 mb-4" />
          <blockquote className="text-lg leading-relaxed mb-4">
            "{quote.text}"
          </blockquote>
        </div>

        <div className="space-y-3">
          <div>
            <p className="font-semibold text-blue-600">— {quote.author}</p>
            <p className="text-sm text-muted-foreground capitalize">{keyword}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onMoreClick(keyword)}
            className="w-full hover:bg-blue-600 hover:text-white"
          >
            Más
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})
