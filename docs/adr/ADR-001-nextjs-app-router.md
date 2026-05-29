# ADR-001: Next.js 15 con App Router como framework web

- **Estado:** Aceptado
- **Fecha:** 2026-05-29

## Contexto

El proyecto necesita un framework web para construir una aplicación de seguimiento de hábitos con autenticación, rutas protegidas y renderizado de datos por usuario. Se requiere un stack que facilite el deploy en Vercel y la integración con Supabase.

## Opciones consideradas

1. **Next.js 15 con App Router** — Framework React con SSR/RSC, routing basado en carpetas, y soporte nativo de Server Actions.
2. **Next.js con Pages Router** — La variante anterior del mismo framework, sin Server Components.
3. **Remix** — Framework React orientado a web fundamentals, con soporte de loaders y actions por ruta.
4. **SvelteKit** — Framework basado en Svelte, menor ecosistema pero menor overhead de bundle.

## Decisión

Se usa **Next.js 15 con App Router**.

El App Router permite colocar la lógica de autenticación y autorización directamente en Server Components y middleware, reduciendo la superficie de datos expuesta al cliente. Los Server Actions simplifican las mutaciones (crear, editar, archivar hábitos) sin necesidad de un API layer explícito. El ecosistema Next.js tiene integración directa con Vercel y Supabase via sus SDKs oficiales.

## Consecuencias

- Las rutas protegidas se implementan con middleware de Next.js (`middleware.ts`) que verifica la sesión de Supabase antes de renderizar.
- Los datos sensibles por usuario se leen en Server Components; el cliente recibe solo los props necesarios.
- El equipo debe conocer la distinción entre Server Components y Client Components (`"use client"`).
- Pages Router queda fuera de consideración: no mezclar los dos sistemas de routing.
