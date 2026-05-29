# 0001 — Next.js 15 con App Router como framework web

**Estado:** Aceptado  
**Fecha:** 2026-05-29

---

## Contexto

El proyecto necesita un framework React con capacidades de renderizado en servidor, enrutamiento y deploy sencillo en Vercel. El equipo (un solo desarrollador) no tiene presupuesto de tiempo para configurar SSR desde cero ni mantener un API layer separado del frontend. La integración con Supabase y la autenticación basada en cookies HttpOnly son requisitos no negociables.

El App Router de Next.js 15 y el Pages Router coexisten en el ecosistema, pero son arquitecturalmente incompatibles: mezclarlos crea deuda inmediata. Elegir uno implica descartar el otro desde el inicio.

---

## Decisión

Se usa **Next.js 15 con App Router exclusivamente**.

El App Router habilita Server Components por defecto, lo que permite leer datos de Supabase y validar sesiones sin exponer lógica al cliente. Los Server Actions reemplazan al API layer para mutaciones internas. El soporte oficial de Vercel para Next.js elimina configuración de infraestructura.

---

## Alternativas consideradas

### Opción A — Next.js 15 con Pages Router

El Pages Router es el sistema anterior de Next.js. Más documentación disponible, menor curva de aprendizaje inicial.

**Trade-off:** No tiene Server Components ni Server Actions nativos. Las mutaciones requieren Route Handlers (`/api/*`) y el cliente gestiona más lógica. A medida que el App Router se consolida como el estándar de Next.js, el Pages Router acumula deuda técnica. Elegirlo hoy es apostar por un sistema en modo mantenimiento.

### Opción B — Remix

Remix tiene un modelo de loaders/actions por ruta que comparte filosofía con el App Router, con excelente soporte de formularios progresivos y manejo de errores por ruta.

**Trade-off:** El ecosistema de Remix con Supabase está menos documentado que el de Next.js. El deploy en Vercel funciona pero sin la integración nativa que tiene Next.js (edge config, analytics, image optimization). Agrega una variable de riesgo sin un beneficio diferencial para este proyecto.

---

## Consecuencias

**Positivas:**
- Los Server Components permiten leer datos de Supabase directamente sin exponer queries al cliente.
- El middleware de Next.js centraliza la verificación de sesión antes de renderizar cualquier ruta protegida.
- Deploy con cero configuración en Vercel.

**Negativas / trade-offs aceptados:**
- La distinción entre Server Components y Client Components (`"use client"`) requiere atención constante. Un componente que usa hooks o estado del navegador mal clasificado como Server Component genera errores en runtime que no siempre son obvios.
- El App Router tiene comportamientos de caché agresivos (full-route cache, request memoization) que pueden causar datos stale si no se llama `revalidatePath` o `revalidateTag` explícitamente tras una mutación. Este comportamiento no es visible durante el desarrollo con `next dev` porque el caché está deshabilitado.
