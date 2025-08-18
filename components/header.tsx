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
        <Link href="/" className="flex items-center space-x-2">
          <Quote className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg">Citas Motivacionales</span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-blue-600" : "text-muted-foreground",
            )}
          >
            Inicio
          </Link>
          <Link
            href="/qod"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/qod" ? "text-blue-600" : "text-muted-foreground",
            )}
          >
            Cita del Día
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
