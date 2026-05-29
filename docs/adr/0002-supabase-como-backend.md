# 0002 — Supabase como plataforma de backend

**Estado:** Aceptado  
**Fecha:** 2026-05-29

---

## Contexto

La aplicación necesita una base de datos relacional para hábitos, check-ins y categorías, y un sistema de autenticación con sesiones por usuario. El modelo de datos requiere integridad referencial y aislamiento estricto entre usuarios. El equipo (un desarrollador) no puede mantener infraestructura propia ni un servidor de autenticación separado.

La decisión involucra no solo la base de datos sino también cómo se implementa el aislamiento de datos: en la capa de aplicación (el servidor valida `user_id` en cada query) o en la base de datos misma (RLS).

---

## Decisión

Se usa **Supabase**: Postgres gestionado + Supabase Auth + Row Level Security.

Supabase provee Postgres real (no NoSQL), lo que permite modelar relaciones con integridad referencial. Row Level Security delega el aislamiento de datos a la base de datos: aunque haya un bug en el servidor que omita el filtro `user_id`, la política de RLS bloquea el acceso. El SDK `@supabase/ssr` tiene soporte oficial para Next.js App Router con cookies HttpOnly.

---

## Alternativas consideradas

### Opción A — PlanetScale (MySQL serverless) + NextAuth

PlanetScale ofrece MySQL con branching de esquemas y escalado automático. NextAuth gestiona sesiones con adaptadores para múltiples bases de datos.

**Trade-off:** MySQL no tiene Row Level Security. El aislamiento de datos entre usuarios depende completamente del código de la aplicación: si una query olvida el filtro `WHERE user_id = ?`, los datos de un usuario son accesibles para otro. Además, combinar dos servicios externos aumenta la superficie de configuración y el número de secretos a gestionar.

### Opción B — Firebase (Firestore + Firebase Auth)

Firebase es un BaaS maduro con Firestore como base de datos NoSQL y Firebase Auth integrado. Las Security Rules de Firestore cumplen un rol similar al RLS de Postgres.

**Trade-off:** Firestore es una base de datos de documentos. El modelo de datos del proyecto (hábitos → check-ins → rachas, con joins y agregaciones de fechas) es inherentemente relacional. Implementarlo en Firestore requiere desnormalización o múltiples reads donde un JOIN en SQL resuelve todo en una query. El vendor lock-in con el ecosistema de Google es más pronunciado que con Supabase, que expone Postgres estándar.

---

## Consecuencias

**Positivas:**
- RLS garantiza el aislamiento de datos a nivel de base de datos, independientemente de la lógica del servidor.
- Los tipos TypeScript se generan automáticamente con `supabase gen types typescript` desde el esquema, eliminando la necesidad de un ORM con su propio sistema de tipos.
- Migraciones con Supabase CLI permiten versionar el esquema en git junto al código.

**Negativas / trade-offs aceptados:**
- RLS añade una capa de lógica que vive fuera del código TypeScript: las políticas se definen en SQL y no son visibles en el IDE. Un error en una política puede bloquear acceso legítimo o (peor) abrir acceso no autorizado, y el error solo es visible en runtime.
- El cliente de Supabase para Next.js App Router requiere dos instancias distintas (`createServerClient` para el servidor, `createBrowserClient` para el cliente) con configuración diferente. Mezclarlos genera bugs de sesión silenciosos.
- Supabase en el plan gratuito pausa la base de datos tras 7 días de inactividad. Esto es irrelevante en producción con uso real, pero puede sorprender en desarrollo.
