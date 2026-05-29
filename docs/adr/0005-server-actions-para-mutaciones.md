# 0005 — Server Actions para mutaciones

**Estado:** Aceptado  
**Fecha:** 2026-05-29

---

## Contexto

La aplicación necesita un mecanismo para ejecutar escrituras: crear, editar y archivar hábitos; registrar y desmarcar check-ins; crear categorías. Estas operaciones requieren acceso autenticado a Supabase, validación de entrada y, tras ejecutarse, invalidación del caché de Next.js para reflejar el cambio en la UI.

En Next.js App Router hay tres patrones para mutaciones: Server Actions, Route Handlers y llamadas directas al cliente Supabase desde el navegador. La elección determina dónde vive la lógica de negocio y qué tan expuesta queda al cliente.

---

## Decisión

Las mutaciones se implementan como **Server Actions** en archivos `actions.ts` dentro de cada feature.

```
src/features/
  auth/
    actions.ts      # register, login, logout
  habits/
    actions.ts      # createHabit, updateHabit, archiveHabit
  checkins/
    actions.ts      # createCheckIn, deleteCheckIn
  categories/
    actions.ts      # createCategory
```

Las acciones de `auth` siguen el mismo patrón que el resto pero con una diferencia: llaman a `supabase.auth.signUp()`, `supabase.auth.signInWithPassword()` y `supabase.auth.signOut()` en lugar de queries directas a tablas. Los errores de Supabase Auth (`invalid_credentials`, `email_already_registered`) se mapean a mensajes de usuario antes de retornar `{ error }`.

Cada Server Action: (1) verifica la sesión con `getUser()`, (2) valida los parámetros, (3) ejecuta la mutación en Supabase, (4) llama `revalidatePath()` para invalidar el caché, (5) retorna `{ data, error }`. Los Client Components que las llaman usan `useTransition` para gestionar el estado de carga.

---

## Alternativas consideradas

### Opción A — Route Handlers (`app/api/*/route.ts`)

Endpoints REST tradicionales consumidos con `fetch` desde Client Components. Patrón familiar para quien viene de Next.js Pages Router o de backends Express.

**Trade-off:** Para una aplicación sin cliente externo (no hay app móvil ni terceros consumiendo la API), los Route Handlers son una capa de indirection sin beneficio: el cliente hace `fetch('/api/habits', { method: 'POST', body: ... })`, el handler valida, ejecuta en Supabase y retorna JSON, y el cliente parsea la respuesta. Los Server Actions hacen lo mismo con menos boilerplate y sin abandonar el modelo de tipado de TypeScript end-to-end. Los Route Handlers se reservan para integraciones externas si surgieran en el futuro.

### Opción B — Llamadas directas al cliente Supabase desde el navegador

Mutaciones ejecutadas en Client Components con `createBrowserClient` de `@supabase/ssr`.

**Trade-off:** El cliente del navegador tiene acceso a Supabase con la sesión del usuario. RLS previene acceso a datos de otros usuarios, pero no impide que el cliente envíe datos malformados o bypass validaciones de negocio (por ejemplo, marcar un check-in con fecha de hace 3 días, que la spec prohíbe). Toda validación de negocio tendría que replicarse en el cliente, donde puede ser inspeccionada y manipulada. La lógica de negocio pertenece al servidor.

---

## Consecuencias

**Positivas:**
- La lógica de negocio vive en el servidor, inaccesible para el cliente. Las validaciones de dominio (período de check-in, integridad de rachas) no pueden ser bypaseadas desde el navegador.
- Tipado end-to-end: el tipo de retorno del Server Action es visible en el componente que lo llama, sin necesidad de definir tipos de respuesta de API manualmente.
- Sin boilerplate de `fetch` ni manejo de status codes HTTP en el cliente.

**Negativas / trade-offs aceptados:**
- `revalidatePath()` invalida el caché de la ruta completa. Si la UI necesita actualizaciones más granulares (solo un componente, no toda la página), la invalidación de ruta entera puede provocar re-renders innecesarios o un flash de contenido. Mitigable con `revalidateTag()` y etiquetas de caché por recurso, pero añade complejidad.
- Los errores de un Server Action no propagan la traza completa al cliente en producción (Next.js los redacta por seguridad). Depurar un error en producción requiere revisar los logs del servidor, no la consola del navegador. El desarrollador debe implementar logging explícito en los Server Actions para tener observabilidad.
- Los Server Actions no son cacheables. Cada invocación es un round-trip al servidor. Para operaciones de lectura frecuentes, esto es subóptimo; pero este ADR aplica solo a mutaciones, donde el round-trip es necesario.
