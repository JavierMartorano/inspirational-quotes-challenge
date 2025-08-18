"use client"

import { useState } from "react"
import { QuoteCard } from "@/components/quote-card"
import { QuoteModal } from "@/components/quote-modal"
import { Button } from "@/components/ui/button"
import { mockQuotes } from "@/lib/quotes"

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string | undefined>()
  const [quotesToShow, setQuotesToShow] = useState(3)

  const handleMoreClick = (category: string) => {
    setFilterCategory(category)
    setIsModalOpen(true)
  }

  const handleViewMoreQuotes = () => {
    setQuotesToShow((prev) => Math.min(prev + 3, mockQuotes.length))
  }

  const displayedQuotes = mockQuotes.slice(0, quotesToShow)

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
            Descubre citas motivacionales que transformarán tu perspectiva y te impulsarán hacia tus objetivos más
            ambiciosos.
          </p>
        </div>
      </section>

      {/* Quotes Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {displayedQuotes.map((quote, index) => (
              <div
                key={quote.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <QuoteCard quote={quote} onMoreClick={handleMoreClick} />
              </div>
            ))}
          </div>

          {quotesToShow < mockQuotes.length && (
            <div className="text-center mt-12">
              <Button
                onClick={handleViewMoreQuotes}
                size="lg"
                className="px-8 transition-all duration-300 hover:scale-105"
              >
                Ver Más Citas
              </Button>
            </div>
          )}
        </div>
      </section>

      <QuoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} filterCategory={filterCategory} />
    </div>
  )
}
