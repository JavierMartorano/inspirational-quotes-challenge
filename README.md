# 🌟 Inspirational Quotes Landing Page

> Una landing page moderna para mostrar citas inspiracionales usando Next.js y la ZenQuotes API

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://motivational-daily.vercel.app/)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📋 Descripción del Proyecto

Esta aplicación es una landing page que muestra citas inspiracionales organizadas en "bricks" (tarjetas). Cada brick contiene una cita, su autor y una palabra clave. Puedes hacer clic en "more" para ver más citas relacionadas con esa palabra clave.

> Nota de rama (develop): Esta rama funciona sin API key de ZenQuotes. Por eso uso un enfoque "scraper-like": consumo el endpoint público genérico y realizo el filtrado en el servidor (sin depender de `/[mode]/[API_KEY]`). Esto simplifica el setup del challenge. Si necesitas la versión que usa la key oficial y los endpoints documentados, revisa la rama `with-apikey`.

### ✨ Características Principales

- 🎯 Landing con Bricks: Cada tarjeta muestra una cita con su palabra clave
- 🔍 Modal de Citas: Al hacer clic en "more", muestro hasta 10 citas relacionadas
- 🍪 Persistencia con Cookies: Recuerdo la última palabra clave seleccionada
- 📱 Diseño Responsive: Adaptado para móviles y desktop
- 🌙 Modo Oscuro: Toggle entre tema claro y oscuro
- 📊 Quote of the Day: Endpoint `/qod` que devuelve la cita del día en texto plano
- ⚡ Optimización: Memorización de componentes y lazy loading
- 🛡️ TypeScript: Tipado estricto para mejor desarrollo

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0

### Pasos de Instalación

1. Clonar el repositorio
   ```bash
   git clone https://github.com/JavierMartorano/inspirational-quotes-challenge
   cd inspirational-quotes-challenge
   ```

2. Instalar dependencias
   ```bash
   npm install
   ```

3. Ejecutar en modo desarrollo
   ```bash
   npm run dev
   ```

4. Abrir en el navegador
   ```
   http://localhost:3000
   ```

### Scripts Disponibles

```bash
npm run dev      # Ejecuta el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run start    # Ejecuta la aplicación en modo producción
npm run lint     # Ejecuta el linter de código
```

## 🏗️ Estructura del Proyecto

```
inspirational-quotes-challenge/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── qod/          # Quote of the Day API
│   │   └── quotes/       # Quotes API
│   ├── qod/              # Ruta /qod (texto plano)
│   ├── qod-ui/           # Ruta /qod-ui (interfaz)
│   ├── globals.css       # Estilos globales
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Página principal
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── header.tsx        # Header con navegación
│   ├── quote-card.tsx    # Tarjeta de cita individual
│   ├── quote-modal.tsx   # Modal para mostrar más citas
│   ├── quote-of-the-day.tsx # Componente QOD
│   ├── theme-provider.tsx # Proveedor de tema
│   └── theme-toggle.tsx  # Toggle de tema oscuro/claro
├── lib/                   # Utilidades y servicios
│   ├── cookies.ts        # Manejo de cookies
│   ├── quotes.ts         # Servicio de API de citas
│   └── utils.ts          # Utilidades generales
├── public/               # Archivos estáticos
└── styles/               # Estilos adicionales
```

## 🔧 Tecnologías Utilizadas

### Core
- Next.js 15.2.4 - Framework React con App Router
- React 18.3.1 - Biblioteca de UI
- TypeScript 5 - Tipado estático
- Tailwind CSS 4.1.9 - Framework de CSS

### UI Components
- Radix UI - Componentes accesibles y sin estilos
- shadcn/ui - Componentes pre-construidos
- Lucide React - Iconos
- next-themes - Manejo de temas

### Optimización
- React.memo() - Memorización de componentes
- Lazy Loading - Carga diferida del modal
- AbortController - Cancelación de requests

## 🌐 API Endpoints

### Endpoints Internos (develop)

- GET `/api/quotes` — Obtiene citas. En develop consulto el endpoint público sin API key y, si se pasa `?keyword=...`, realizo el filtrado en el servidor. Devuelvo hasta 10 resultados. Si hay error o límite, aplico fallback con mock.
- GET `/api/qod` — Cita del día en `text/plain`. Uso el endpoint público y cacheo por día; si falla, devuelvo un fallback amigable.
- GET `/qod` — Cita del día en texto plano para integraciones.
- GET `/qod-ui` — Interfaz visual de la cita del día.

### ¿Cómo funciona el modo “sin API key” (scraper-like)?

1. Consulto el endpoint público genérico `https://zenquotes.io/api/quotes` sin API key.
2. Si se recibe `?keyword=...`, filtro los resultados en el servidor y devuelvo hasta 10.
3. Aplico timeouts y, ante error o rate limit, respondo con un set de citas mock locales como fallback.
4. Para la cita del día, uso el endpoint público y cacheo en cookie por fecha.

### API Externa

- ZenQuotes API — `https://zenquotes.io/api/`
  - En develop uso el endpoint público sin `API_KEY` por simplicidad de setup del challenge.
  - Límite por defecto: 5 requests/30s por IP — por eso aplico cache y fallbacks locales.
  - Si prefieres consumir la estructura oficial `https://zenquotes.io/api/[mode]/[API_KEY]?keyword=...`, utiliza la rama `with-apikey`.

## 🍪 Funcionalidad de Cookies

La aplicación utiliza cookies para recordar la última palabra clave seleccionada:

- Cookie: `lastSelectedKeyword`
- Comportamiento: Al cargar la página, si existe la cookie, la primera cita será de esa categoría
- Implementación: Usando `document.cookie` nativo

## 📱 Responsive Design

- Mobile First: Diseño optimizado para móviles
- Breakpoints: Tailwind CSS breakpoints estándar

## 🛠️ Desarrollo

### Convenciones de Código

- Componentes: PascalCase (QuoteCard.tsx)
- Funciones: camelCase (getRandomQuotes)
- Constantes: UPPER_SNAKE_CASE (API_TIMEOUT)
- Comentarios: En español para mejor comprensión

### Manejo de Errores

- UI Amigable: Mensajes de error claros para el usuario
- Fallbacks: Citas mock cuando la API falla
- Timeouts: 10 segundos para requests HTTP
- Retry Logic: Reintentos automáticos en fallos

### Testing

- Manual Testing: Verificación de funcionalidades principales
- Error Scenarios: Pruebas con API desconectada
- Responsive: Pruebas en diferentes dispositivos

## 🚀 Deployment

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configuración automática detectada
3. Deploy automático en cada push

### Variables de Entorno

No se requieren variables de entorno para la funcionalidad básica en develop. Si deseas usar una API key de ZenQuotes, revisa la rama `with-apikey` y define `ZENQUOTES_API_KEY` en `.env.local` o en el panel de Vercel.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

Desarrollado por Javier Martorano