"use client"

import { useState } from "react"
import { Quote, RefreshCw, Heart, Share2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockQuotes } from "@/lib/quotes"
import type { Quote as QuoteType } from "@/lib/quotes"

export function QuoteOfTheDay() {
  const [currentQuote, setCurrentQuote] = useState<QuoteType>(mockQuotes[2]) // Steve Jobs quote as default
  const [isLiked, setIsLiked] = useState(false)

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * mockQuotes.length)
    setCurrentQuote(mockQuotes[randomIndex])
  }

  const handleShare = () => {
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

        <Card className="mx-auto max-w-3xl bg-gradient-to-br from-background to-muted/20 border-2">
          <CardContent className="p-8 md:p-12 text-center">
            <Quote className="h-16 w-16 text-blue-600 mx-auto mb-8" />

            <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed mb-8">
              "{currentQuote.text}"
            </blockquote>

            <div className="mb-8">
              <p className="text-xl font-semibold text-blue-600 mb-2">— {currentQuote.author}</p>
              <p className="text-muted-foreground capitalize">{currentQuote.category}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={getRandomQuote} className="flex items-center gap-2" size="lg">
                <RefreshCw className="h-4 w-4" />
                Nueva Cita
              </Button>

              <Button
                variant={isLiked ? "default" : "outline"}
                onClick={() => setIsLiked(!isLiked)}
                className="flex items-center gap-2"
                size="lg"
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                Like
              </Button>

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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
