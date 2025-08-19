"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Quote } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

/**
 * Componente Header - Barra de navegación principal de la aplicación
 * 
 * Características:
 * - Sticky header que permanece visible al hacer scroll
 * - Navegación responsive con texto adaptativo según el viewport
 * - Indicador visual de la página activa
 * - Toggle de tema oscuro/claro integrado
 * - Memoizado para evitar re-renders innecesarios
 * - Backdrop blur para efecto visual moderno
 * 
 * Rutas disponibles:
 * - "/" - Página principal con citas
 * - "/qod-ui" - Página de cita del día
 * 
 * @returns JSX.Element - El header renderizado
 */
export const Header = React.memo(function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 min-w-0">
          <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
          <span className="font-bold text-base sm:text-lg truncate">
            Citas Motivacionales
          </span>
        </Link>

        <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
          <Link
            href="/"
            className={cn(
              "text-xs sm:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
              pathname === "/" ? "text-blue-600" : "text-muted-foreground"
            )}
          >
            Inicio
          </Link>
          <Link
            href="/qod-ui"
            className={cn(
              "text-xs sm:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
              pathname === "/qod-ui" ? "text-blue-600" : "text-muted-foreground"
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
})
