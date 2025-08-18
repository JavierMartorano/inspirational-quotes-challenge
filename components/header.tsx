"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Quote } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 min-w-0">
          <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
          <span className="font-bold text-base sm:text-lg truncate">Citas Motivacionales</span>
        </Link>

        <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
          <Link
            href="/"
            className={cn(
              "text-xs sm:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
              pathname === "/" ? "text-blue-600" : "text-muted-foreground",
            )}
          >
            Inicio
          </Link>
          <Link
            href="/qod-ui"
            className={cn(
              "text-xs sm:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
              pathname === "/qod-ui" ? "text-blue-600" : "text-muted-foreground",
            )}
          >
            <span className="hidden sm:inline">Cita del Día</span>
            <span className="sm:hidden">QOD</span>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
