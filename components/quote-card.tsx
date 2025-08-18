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
    <Card className="h-full min-h-[280px] transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex-1">
          <Quote className="h-8 w-8 text-blue-600 mb-4" />
          <blockquote className="text-lg leading-relaxed mb-4">
            "{quote.text}"
          </blockquote>
        </div>

        <div className="space-y-3">
          <div>
            <p className="font-semibold text-blue-600">— {quote.author}</p>
            <p className="text-sm text-muted-foreground capitalize">{quote.category}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onMoreClick(quote.category)}
            className="w-full hover:bg-blue-600 hover:text-white"
          >
            Más
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
