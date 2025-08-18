// Utilidades para manejo de cookies sin dependencias externas
// Compatible con Next.js y navegadores modernos

/**
 * Obtiene el valor de una cookie por su nombre
 * @param name - Nombre de la cookie
 * @returns Valor de la cookie o null si no existe
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    // Server-side: no hay cookies disponibles
    return null
  }

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue ? decodeURIComponent(cookieValue) : null
  }
  
  return null
}

/**
 * Establece una cookie con opciones configurables
 * @param name - Nombre de la cookie
 * @param value - Valor de la cookie
 * @param options - Opciones de la cookie (expires, path, etc.)
 */
export function setCookie(
  name: string, 
  value: string, 
  options: {
    expires?: number // días hasta expirar
    path?: string
    domain?: string
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
  } = {}
): void {
  if (typeof document === 'undefined') {
    // Server-side: no se pueden establecer cookies
    return
  }

  let cookieString = `${name}=${encodeURIComponent(value)}`

  // Configurar expiración (por defecto 30 días)
  const expirationDays = options.expires || 30
  const expirationDate = new Date()
  expirationDate.setTime(expirationDate.getTime() + (expirationDays * 24 * 60 * 60 * 1000))
  cookieString += `; expires=${expirationDate.toUTCString()}`

  // Configurar path (por defecto '/')
  cookieString += `; path=${options.path || '/'}`

  // Configurar domain si se especifica
  if (options.domain) {
    cookieString += `; domain=${options.domain}`
  }

  // Configurar secure si se especifica
  if (options.secure) {
    cookieString += '; secure'
  }

  // Configurar sameSite (por defecto 'lax')
  cookieString += `; sameSite=${options.sameSite || 'lax'}`

  document.cookie = cookieString
}

/**
 * Elimina una cookie estableciendo su fecha de expiración en el pasado
 * @param name - Nombre de la cookie a eliminar
 * @param path - Path de la cookie (debe coincidir con el usado al crearla)
 */
export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`
}

// Funciones específicas para el manejo de lastSelectedKeyword

/**
 * Obtiene la última keyword seleccionada desde las cookies
 * @returns La keyword guardada o null si no existe
 */
export function getLastSelectedKeyword(): string | null {
  return getCookie('lastSelectedKeyword')
}

/**
 * Guarda la keyword seleccionada en las cookies
 * @param keyword - La keyword a guardar
 */
export function setLastSelectedKeyword(keyword: string): void {
  setCookie('lastSelectedKeyword', keyword, {
    expires: 30, // 30 días
    path: '/',
    sameSite: 'lax'
  })
}

/**
 * Elimina la keyword guardada en las cookies
 */
export function clearLastSelectedKeyword(): void {
  deleteCookie('lastSelectedKeyword')
}