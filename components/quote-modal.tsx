"use client"

import { Quote } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockQuotes } from "@/lib/quotes"

interface QuoteModalProps {
  isOpen: boolean
  onClose: () => void
  filterCategory?: string
}

export function QuoteModal({ isOpen, onClose, filterCategory }: QuoteModalProps) {
  const filteredQuotes = filterCategory
    ? mockQuotes.filter((quote) => quote.category === filterCategory).slice(0, 10)
    : mockQuotes.slice(0, 10)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-background/95 backdrop-blur-sm border-border/50">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Quote className="h-6 w-6 text-blue-600" />
            <DialogTitle className="text-xl font-semibold capitalize">
              {filterCategory ? `Citas sobre ${filterCategory}` : "Más Citas Motivacionales"}
            </DialogTitle>
          </div>
          {filterCategory && (
            <p className="text-sm text-muted-foreground mt-2">
              Descubre inspiración en estas {filteredQuotes.length} citas cuidadosamente seleccionadas.
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {filteredQuotes.map((quote, index) => (
              <div
                key={quote.id}
                className="group p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-left-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <blockquote className="text-base leading-relaxed mb-3 text-foreground">"{quote.text}"</blockquote>
                    <p className="font-medium text-blue-600 text-sm">— {quote.author}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground capitalize bg-muted/50 px-2 py-1 rounded-full">
                      {quote.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
