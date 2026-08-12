# Fuerzas Básicas Jaguares de Córdoba

Plataforma digital oficial de las Fuerzas Básicas Jaguares de Córdoba: sitio institucional público y plataforma interna de gestión deportiva (`/plataforma`) para el cuerpo técnico.

**Producción:** https://fbjaguares.hakunnafit.com

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend / datos:** Supabase (Postgres, Auth, Storage)
- **Despliegue:** Vercel

## Estructura

```
src/
  app/
    (site)/            → sitio público (Inicio, Nosotros, Jugadores, Galería, Inscripciones…)
    plataforma/
      (dashboard)/      → plataforma interna: Dashboard, Jugadores, Entrenamientos, Partidos,
                          Evaluaciones, Asistencia, Informes, Gestión Financiera, Configuración
  components/
    dashboard/          → componentes de la plataforma interna
    site/               → componentes del sitio público
  lib/
    data/                → capa de datos (consultas a Supabase)
    informes/            → generador de Informes de Evolución (sistema experto por reglas)
    supabase/            → clientes de Supabase + tipos generados
```

## Desarrollo local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.example` a `.env.local` y completar las variables de Supabase:
   ```bash
   cp .env.example .env.local
   ```
3. Levantar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run start` — servidor de producción (tras el build)
- `npm run lint` — linter

## Despliegue

El proyecto se despliega en Vercel. Cada push a `main` genera un deploy con el historial de commits visible en el dashboard de Vercel.

## Alcance actual

La plataforma interna inicia enfocada en la categoría **Sub-15** (jugadores, entrenamientos, partidos, evaluaciones, asistencia e informes). Sub-13 y Sub-17 están preparadas en la arquitectura y se activan a medida que tengan plantel real.
