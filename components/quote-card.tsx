"use client"

import { Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Quote as QuoteType } from "@/lib/quotes"

interface QuoteCardProps {
  quote: QuoteType
  onMoreClick: (category: string) => void
}

export function QuoteCard({ quote, onMoreClick }: QuoteCardProps) {
  return (
    <Card className="group h-full min-h-[280px] transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex-1">
          <Quote className="h-8 w-8 text-blue-600 mb-4 transition-transform duration-300 group-hover:scale-110" />
          <blockquote className="text-lg leading-relaxed mb-4 transition-colors duration-300">
            "{quote.text}"
          </blockquote>
        </div>

        <div className="space-y-3">
          <div>
            <p className="font-semibold text-blue-600 transition-colors duration-300">— {quote.author}</p>
            <p className="text-sm text-muted-foreground capitalize">{quote.category}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onMoreClick(quote.category)}
            className="w-full transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-105"
          >
            Más
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
