# ADR-002: Supabase como plataforma de backend (base de datos y autenticación)

- **Estado:** Aceptado
- **Fecha:** 2026-05-29

## Contexto

La aplicación requiere una base de datos relacional para hábitos, check-ins, categorías y rachas, más un sistema de autenticación con sesiones por usuario. Se necesita que cada usuario acceda únicamente a sus propios datos.

## Opciones consideradas

1. **Supabase** — BaaS con Postgres gestionado, Auth con JWT, Row Level Security (RLS), y SDK oficial para Next.js.
2. **PlanetScale + NextAuth** — Base de datos MySQL serverless combinada con una librería de autenticación separada.
3. **Firebase (Firestore + Firebase Auth)** — BaaS de Google con base de datos NoSQL y autenticación integrada.
4. **Neon + Clerk** — Postgres serverless con Clerk como proveedor de identidad independiente.

## Decisión

Se usa **Supabase (Postgres + Supabase Auth)**.

Supabase ofrece Postgres real (no un ORM sobre NoSQL), lo que permite modelar las relaciones entre hábitos, check-ins y categorías con integridad referencial. Row Level Security permite que las políticas de aislamiento de datos por usuario vivan en la base de datos, reduciendo la probabilidad de fugas de datos por errores en el código de la aplicación. El SDK `@supabase/ssr` tiene soporte oficial para Next.js App Router con cookies de sesión gestionadas en servidor.

## Consecuencias

- Todas las tablas que almacenan datos de usuario tendrán una columna `user_id` referenciada con RLS habilitado.
- La autenticación se implementa con `@supabase/ssr` usando `createServerClient` en Server Components y `createBrowserClient` en Client Components.
- El esquema de base de datos se gestiona con migraciones de Supabase CLI.
- No se usarán ORMs adicionales (Prisma, Drizzle): se hace uso de los tipos generados por Supabase desde el esquema (`supabase gen types`).
