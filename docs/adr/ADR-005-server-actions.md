# ADR-005: Mutaciones vía Server Actions

- **Estado:** Aceptado
- **Fecha:** 2026-05-29

## Contexto

La aplicación necesita un mecanismo para ejecutar operaciones de escritura: crear, editar y archivar hábitos; registrar y desmarcar check-ins. Estas operaciones requieren validación de sesión, lógica de negocio y acceso a Supabase.

## Opciones consideradas

1. **Server Actions** — Funciones `async` marcadas con `"use server"`, coubicadas en `features/`, llamadas directamente desde formularios o event handlers de Client Components.
2. **Route Handlers** — Endpoints REST en `app/api/*/route.ts`, consumidos con `fetch` desde el cliente.
3. **Supabase client directo desde el navegador** — Mutaciones ejecutadas en Client Components usando `createBrowserClient`.

## Decisión

Se usan **Server Actions**.

No hay cliente externo (app móvil, terceros) que consuma la API, por lo que un API REST es indirection sin beneficio. Los Server Actions corren en el servidor, tienen acceso al cliente Supabase autenticado con cookies HttpOnly, y permiten colocar la lógica de negocio junto al feature que la necesita. Las validaciones del lado del servidor son la norma, no la excepción.

La opción de cliente Supabase directo expone la lógica de negocio al navegador y traslada la responsabilidad de validación al cliente, donde puede ser manipulada.

## Estructura

```
src/features/
  habits/
    actions.ts     # createHabit, updateHabit, archiveHabit
  checkins/
    actions.ts     # createCheckIn, deleteCheckIn
  categories/
    actions.ts     # createCategory
```

Cada Server Action:
1. Verifica la sesión con `supabase.auth.getUser()`.
2. Valida los parámetros de entrada.
3. Ejecuta la mutación en Supabase.
4. Llama `revalidatePath()` para invalidar el caché de Next.js y reflejar el cambio en la UI.
5. Retorna `{ data, error }` para que el componente maneje el estado de éxito o error.

## Consecuencias

- Los Route Handlers (`app/api/`) no se crean para mutaciones internas. Se reservan para integraciones externas si en el futuro surgieran.
- La invalidación de caché se hace con `revalidatePath` o `revalidateTag`; no con refetching manual desde el cliente.
- Los Client Components que disparan mutaciones usan `useTransition` de React para manejar el estado de carga mientras el Server Action ejecuta.
