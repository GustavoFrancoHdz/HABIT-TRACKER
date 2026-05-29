# ADR-004: Autenticación con middleware centralizado

- **Estado:** Aceptado
- **Fecha:** 2026-05-29

## Contexto

La aplicación tiene rutas protegidas (dashboard, hábitos, check-ins) y rutas públicas (login, registro). La sesión de Supabase Auth se gestiona con cookies HttpOnly. El App Router de Next.js 15 permite interceptar requests con `middleware.ts` antes de que se renderice cualquier Server Component.

## Opciones consideradas

1. **Middleware centralizado** — `middleware.ts` en la raíz verifica la cookie de sesión en cada request a una ruta protegida y redirige al login si no hay sesión válida.
2. **Verificación por Server Component** — Cada `page.tsx` protegida llama `supabase.auth.getUser()` y redirige si no hay sesión.
3. **Client-side guard** — La sesión se verifica en el navegador tras la carga inicial de la página.

## Decisión

Se usa **middleware centralizado** con `@supabase/ssr`.

Un único punto de control elimina el riesgo de olvidar el guard al agregar una ruta nueva. El middleware corre en el Edge Runtime antes de que Next.js inicie el renderizado, por lo que el usuario nunca recibe HTML de una ruta protegida sin sesión válida. La opción client-side es inaceptable porque expone el HTML inicial de la página protegida antes de redirigir.

## Implementación

```
middleware.ts          # Raíz del proyecto — intercepta todas las rutas
src/lib/supabase/
  server.ts            # createServerClient (Server Components y Server Actions)
  middleware.ts        # createServerClient con lógica de refresco de cookie
```

El middleware verifica `supabase.auth.getUser()`. Si retorna error o usuario null en una ruta protegida, redirige a `/login`. Si hay sesión válida en una ruta pública (`/login`, `/register`), redirige al dashboard.

El patrón de refresco de cookie es obligatorio: el middleware debe leer y reescribir la cookie de sesión en cada request para que el token JWT no expire silenciosamente.

## Consecuencias

- `middleware.ts` define el matcher de rutas protegidas explícitamente. Toda ruta nueva fuera del matcher es pública por defecto.
- Los Server Components no necesitan llamar `getUser()` para protección; pueden asumir que si el middleware los alcanzó, hay sesión. Pueden llamarlo si necesitan el objeto `user` para queries.
- No se usa `getSession()` en el servidor — `getUser()` valida contra Supabase cada vez, evitando sesiones stale en cookies manipuladas.
