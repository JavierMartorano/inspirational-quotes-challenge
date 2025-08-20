# 🌟 Inspirational Quotes Landing Page

> Una landing page moderna para mostrar citas inspiracionales usando Next.js y la ZenQuotes API

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://motivational-daily.vercel.app/)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📋 Descripción del Proyecto

Esta aplicación es una landing page que muestra citas inspiracionales organizadas en "bricks" (tarjetas). Cada brick contiene una cita, su autor y una palabra clave. Los usuarios pueden hacer clic en "more" para ver más citas relacionadas con esa palabra clave.

> **Implementación Oficial**: Esta aplicación sigue la documentación oficial de ZenQuotes API. Utiliza los endpoints oficiales con API key opcional mediante `ZENQUOTES_API_KEY`. Sin API key, funciona con datos de fallback manteniendo toda la funcionalidad.

### ✨ Características Principales

- 🎯 **Landing con Bricks**: Cada tarjeta muestra una cita con su palabra clave
- 🔍 **Modal de Citas**: Al hacer clic en "more", se muestran hasta 10 citas relacionadas
- 🍪 **Persistencia con Cookies**: Recuerda la última palabra clave seleccionada
- 📱 **Diseño Responsive**: Adaptado para móviles y desktop
- 🌙 **Modo Oscuro**: Toggle entre tema claro y oscuro
- 📊 **Quote of the Day**: Endpoint `/qod` que devuelve la cita del día en texto plano
- ⚡ **Optimizado**: Memorización de componentes y lazy loading
- 🛡️ **TypeScript**: Tipado estricto para mejor desarrollo

## 🚀 Instalación y Ejecución

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/JavierMartorano/inspirational-quotes-challenge
   cd inspirational-quotes-challenge
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno (opcional pero recomendado)**
   Crea un archivo `.env.local` en la raíz del proyecto con tu API key de ZenQuotes:
   ```bash
   ZENQUOTES_API_KEY=tu_api_key_de_zenquotes
   ```
   - La app detecta esta key en servidor y la añade a las llamadas oficiales: `https://zenquotes.io/api/[mode]/[key]?...`.
   - Si no defines la key, se usará el modo público con límites por IP y se aplicarán fallbacks locales en caso de error.

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
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
- **Next.js 15.2.4** - Framework React con App Router
- **React 18.3.1** - Biblioteca de UI
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4.1.9** - Framework de CSS

### UI Components
- **Radix UI** - Componentes accesibles y sin estilos
- **shadcn/ui** - Componentes pre-construidos
- **Lucide React** - Iconos
- **next-themes** - Manejo de temas

### Optimización
- **React.memo()** - Memorización de componentes
- **Lazy Loading** - Carga diferida del modal
- **AbortController** - Cancelación de requests

## 🌐 API Endpoints

### Endpoints Internos (Documentación Oficial ZenQuotes)

- **GET `/api/keywords`** — Obtiene todas las keywords disponibles desde `https://zenquotes.io/api/keywords/[API_KEY]`. Fallback a keywords predefinidas si no hay API key.
- **GET `/api/keyword/[keyword]`** — Obtiene hasta 50 citas para una keyword específica desde `https://zenquotes.io/api/quotes/[API_KEY]&keyword=[keyword]`. Devuelve todas las citas para uso en modales.
- **GET `/api/qod`** — Obtiene la cita del día desde `https://zenquotes.io/api/today/[API_KEY]` en formato JSON. Cachea por día con cookies.
- **GET `/qod`** — Cita del día en texto plano (`text/plain`) para integraciones externas.
- **GET `/qod-ui`** — Interfaz visual de la cita del día.

### Flujo de Implementación Oficial

1. **Carga inicial**: Obtiene todas las keywords → selecciona 3 aleatorias → obtiene 50 citas por keyword → muestra 1 cita por brick
2. **Modal "Más"**: Muestra 10 de las 50 citas ya obtenidas para esa keyword
3. **Persistencia**: Guarda la última keyword seleccionada en cookies
4. **Fallbacks**: Si no hay API key, usa datos predefinidos manteniendo toda la funcionalidad

### API Externa

- **ZenQuotes API** — `https://zenquotes.io/api/`
  - Estructura de endpoints utilizada: `https://zenquotes.io/api/[mode]/[API_KEY]?keyword=...`
  - Límite por defecto: 5 requests/30s por IP (se recomienda cache y uso prudente).
  - Fallback: Citas mock locales para robustez en caso de fallo o límite.

## 🍪 Funcionalidad de Cookies

La aplicación utiliza cookies para recordar la última palabra clave seleccionada:

- **Cookie**: `lastSelectedKeyword`
- **Comportamiento**: Al cargar la página, si existe la cookie, la primera cita será de esa categoría
- **Implementación**: Usando `document.cookie` nativo

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: Tailwind CSS breakpoints estándar

## 🛠️ Desarrollo

### Convenciones de Código

- **Componentes**: PascalCase (`QuoteCard.tsx`)
- **Funciones**: camelCase (`getRandomQuotes`)
- **Constantes**: UPPER_SNAKE_CASE (`API_TIMEOUT`)
- **Comentarios**: En español para mejor comprensión

### Manejo de Errores

- **UI Amigable**: Mensajes de error claros para el usuario
- **Fallbacks**: Citas mock cuando la API falla
- **Timeouts**: 10 segundos para requests HTTP
- **Retry Logic**: Reintentos automáticos en fallos

### Testing

- **Manual Testing**: Verificación de funcionalidades principales
- **Error Scenarios**: Pruebas con API desconectada
- **Responsive**: Pruebas en diferentes dispositivos

## 🚀 Deployment

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configuración automática detectada
3. Deploy automático en cada push

### Variables de Entorno

- `ZENQUOTES_API_KEY` (opcional pero recomendado): tu API key de ZenQuotes.
  - Local: definir en `.env.local`.
  - Vercel: añadir como Environment Variable en el panel del proyecto.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

**Desarrollado por Javier Martorano**