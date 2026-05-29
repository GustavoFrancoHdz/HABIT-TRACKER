# 0004 — Autenticación: validación de sesión con middleware centralizado

**Estado:** Aceptado  
**Fecha:** 2026-05-29

---

## Contexto

La aplicación tiene rutas protegidas (dashboard, gestión de hábitos) y rutas públicas (login, registro). La sesión de Supabase Auth se transmite en cookies HttpOnly que el servidor debe leer y validar en cada request.

El App Router de Next.js ofrece tres lugares donde puede vivir esta validación: el middleware de Edge Runtime, los Server Components de cada página, o el cliente del navegador. La elección determina cuánto del HTML de una ruta protegida llega al navegador antes de detectar que no hay sesión, y cuánto código de seguridad puede olvidarse o duplicarse.

---

## Decisión

La validación de sesión vive en **`middleware.ts`** usando `@supabase/ssr`.

El middleware intercepta el request antes de que Next.js inicie el renderizado de cualquier ruta. Redirige a `/login` si no hay sesión válida en rutas protegidas, y redirige al dashboard si hay sesión en rutas públicas. También refresca la cookie de sesión en cada request para mantener el token JWT vigente.

Los Server Components pueden asumir que si el middleware los alcanzó, la sesión existe. Llaman `getUser()` solo cuando necesitan el objeto `user` para queries, no como mecanismo de protección.

---

## Alternativas consideradas

### Opción A — Verificación por Server Component (guard por página)

Cada `page.tsx` protegida llama `supabase.auth.getUser()` al inicio y hace `redirect('/login')` si no hay sesión.

**Trade-off:** Requiere que el desarrollador recuerde agregar el guard en cada página nueva. Una página olvidada no tiene protección: el usuario sin sesión recibe el HTML completo de la página antes de que el cliente redirija. No es un error que el compilador detecta; solo se descubre en prueba manual o con un bug en producción. El middleware resuelve esto con un único punto de control que aplica a todas las rutas por patrón.

### Opción B — Validación client-side

La sesión se verifica en un componente de layout con `useSession()` o `onAuthStateChange()` del cliente Supabase.

**Trade-off:** El servidor renderiza y envía el HTML de la ruta protegida antes de que el cliente detecte la ausencia de sesión. El usuario sin sesión ve un flash del contenido protegido. Además, los datos cargados en Server Components ya se ejecutaron sin autenticación. Inaceptable.

---

## Consecuencias

**Positivas:**
- Agregar una ruta nueva no requiere recordar un guard: si el patrón del matcher la incluye, está protegida automáticamente.
- El middleware refresca la cookie en cada request, eliminando sesiones que expiran silenciosamente.
- Los Server Components son más simples: no mezclan lógica de protección con lógica de datos.

**Negativas / trade-offs aceptados:**
- El matcher del middleware debe mantenerse sincronizado con la estructura de rutas. Si se agrega una ruta que debería ser pública pero no está excluida del matcher, el middleware la protegerá aunque no debería. Requiere revisión al agregar rutas.
- El middleware corre en Edge Runtime, que tiene un subconjunto limitado de APIs de Node.js. Si en el futuro se necesita lógica de autorización más compleja (roles, permisos por recurso), el Edge Runtime puede ser insuficiente y la lógica deberá moverse a Server Components o a un endpoint dedicado.
- `getUser()` hace una llamada a Supabase en cada request del middleware. Es una llamada de red adicional por request. Para una app personal con tráfico bajo esto es irrelevante, pero es un costo real a tener en cuenta si el proyecto escala.
