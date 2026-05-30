# Plan de implementación — Habit Tracker (núcleo)

**Generado desde:** `spec.md`, ADRs 0001–0005, `docs/diseño.md`, `docs/pruebas-manuales.md`, `AGENTS.md`  
**Ejecutor:** agente `implementer`  
**Alcance:** núcleo funcional (auth + hábitos + check-ins + rachas). Sin extensiones.

---

## Convenciones de lectura

- **Depende de:** las tareas que deben estar completas antes de iniciar esta.
- **Criterio de hecho:** una línea observable que confirma que la tarea terminó. No es subjetivo; es un estado verificable.
- Si una tarea no lista un ADR o prueba manual, no hay uno aplicable en ese punto.

---

## Tarea 01 — Inicializar proyecto Next.js 15 con scaffolding completo

**Depende de:** ninguna

**Objetivo:** crear el repositorio de la aplicación con Next.js 15, App Router, TypeScript strict, Tailwind e instalar shadcn/ui inicializado.

### Pasos

1. Desde la carpeta raíz del workspace, ejecutar:
   ```bash
   npx create-next-app@latest habit-tracker \
     --typescript \
     --tailwind \
     --app \
     --src-dir \
     --import-alias "@/*" \
     --no-turbopack
   cd habit-tracker
   ```
2. Verificar que `tsconfig.json` contiene `"strict": true`. Si no está, agregarlo.
3. Instalar shadcn/ui:
   ```bash
   npx shadcn@latest init
   ```
   Cuando pregunte el tema, elegir `Default`. Confirmar que usa Tailwind CSS v3.
4. Instalar los componentes primitivos del sistema visual:
   ```bash
   npx shadcn@latest add button input label badge dialog select checkbox form
   ```
5. Crear la estructura de carpetas vacías definida en `AGENTS.md`:
   ```
   src/features/auth/
   src/features/habits/
   src/features/checkins/
   src/features/categories/
   src/lib/supabase/
   src/types/
   src/hooks/
   ```
6. Eliminar el contenido de `src/app/page.tsx` y reemplazarlo con un componente mínimo que solo renderice `<main>Habit Tracker</main>`.

### Criterio de hecho

`npm run dev` arranca sin errores, `http://localhost:3000` devuelve 200 y muestra el texto "Habit Tracker", y `npm run build` completa sin errores de TypeScript.

---

## Tarea 02 — Instalar y configurar clientes Supabase

**Depende de:** Tarea 01  
**ADR de referencia:** [ADR-0002](docs/adr/0002-supabase-como-backend.md)

**Objetivo:** instalar `@supabase/ssr` y crear los dos clientes (server y browser) en `src/lib/supabase/`, listos para ser importados desde cualquier parte del proyecto.

### Pasos

1. Instalar dependencias:
   ```bash
   npm install @supabase/ssr @supabase/supabase-js
   ```
2. Crear `.env.local` en la raíz con las dos variables requeridas (obtener los valores del dashboard de Supabase, sección Project Settings → API):
   ```
   NEXT_PUBLIC_SUPABASE_URL=<url-del-proyecto>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```
3. Crear `src/lib/supabase/server.ts`:
   ```ts
   import { createServerClient } from '@supabase/ssr'
   import { cookies } from 'next/headers'
   import type { Database } from '@/types/database.types'

   export async function createClient() {
     const cookieStore = await cookies()
     return createServerClient<Database>(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           getAll() { return cookieStore.getAll() },
           setAll(cookiesToSet) {
             try {
               cookiesToSet.forEach(({ name, value, options }) =>
                 cookieStore.set(name, value, options)
               )
             } catch {}
           },
         },
       }
     )
   }
   ```
4. Crear `src/lib/supabase/client.ts`:
   ```ts
   import { createBrowserClient } from '@supabase/ssr'
   import type { Database } from '@/types/database.types'

   export function createClient() {
     return createBrowserClient<Database>(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     )
   }
   ```
5. Crear un placeholder `src/types/database.types.ts` con contenido mínimo para que TypeScript no falle antes de la Tarea 04:
   ```ts
   export type Database = Record<string, unknown>
   ```

### Criterio de hecho

`npm run build` completa sin errores. Los archivos `src/lib/supabase/server.ts` y `src/lib/supabase/client.ts` existen y no tienen errores de TypeScript al correr `npx tsc --noEmit`.

---

## Tarea 03 — Crear migración SQL y aplicar esquema en Supabase

**Depende de:** Tarea 02  
**ADR de referencia:** [ADR-0003](docs/adr/0003-modelo-de-datos.md)

**Objetivo:** crear las 4 tablas del modelo de datos, habilitar RLS en cada una, crear las políticas de acceso por `user_id`, e insertar las categorías predefinidas.

### Pasos

1. En el dashboard de Supabase del proyecto, ir a **SQL Editor** y ejecutar el siguiente script en orden:

```sql
-- Tabla de categorías
create table categories (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  name          text not null,
  is_predefined boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Tabla de hábitos
create table habits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  category_id  uuid references categories(id) on delete set null,
  name         text not null,
  description  text,
  frequency    text not null check (frequency in ('daily', 'weekly')),
  archived_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- Días configurados para hábitos semanales
create table habit_days (
  habit_id     uuid not null references habits(id) on delete cascade,
  day_of_week  smallint not null check (day_of_week between 0 and 6),
  primary key (habit_id, day_of_week)
);

-- Registros de check-in
create table check_ins (
  id           uuid primary key default gen_random_uuid(),
  habit_id     uuid not null references habits(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  checked_date date not null,
  created_at   timestamptz not null default now(),
  unique (habit_id, checked_date)
);

-- RLS: habilitar en todas las tablas
alter table categories  enable row level security;
alter table habits      enable row level security;
alter table habit_days  enable row level security;
alter table check_ins   enable row level security;

-- Políticas de categories
create policy "categories: leer propias o predefinidas"
  on categories for select
  using (user_id = auth.uid() or is_predefined = true);

create policy "categories: insertar propias"
  on categories for insert
  with check (user_id = auth.uid());

create policy "categories: eliminar propias"
  on categories for delete
  using (user_id = auth.uid());

-- Políticas de habits
create policy "habits: leer propios"
  on habits for select
  using (user_id = auth.uid());

create policy "habits: insertar propios"
  on habits for insert
  with check (user_id = auth.uid());

create policy "habits: actualizar propios"
  on habits for update
  using (user_id = auth.uid());

-- Políticas de habit_days (acceso vía habit)
create policy "habit_days: leer de hábitos propios"
  on habit_days for select
  using (
    exists (
      select 1 from habits h
      where h.id = habit_id and h.user_id = auth.uid()
    )
  );

create policy "habit_days: insertar en hábitos propios"
  on habit_days for insert
  with check (
    exists (
      select 1 from habits h
      where h.id = habit_id and h.user_id = auth.uid()
    )
  );

create policy "habit_days: eliminar de hábitos propios"
  on habit_days for delete
  using (
    exists (
      select 1 from habits h
      where h.id = habit_id and h.user_id = auth.uid()
    )
  );

-- Políticas de check_ins
create policy "check_ins: leer propios"
  on check_ins for select
  using (user_id = auth.uid());

create policy "check_ins: insertar propios"
  on check_ins for insert
  with check (user_id = auth.uid());

create policy "check_ins: eliminar propios"
  on check_ins for delete
  using (user_id = auth.uid());

-- Seed: categorías predefinidas (user_id NULL = globales)
insert into categories (user_id, name, is_predefined) values
  (null, 'Salud',      true),
  (null, 'Deporte',    true),
  (null, 'Bienestar',  true),
  (null, 'Aprendizaje',true),
  (null, 'Productividad', true),
  (null, 'Nutrición',  true);
```

2. Guardar el SQL como `supabase/migrations/20260529000000_initial_schema.sql` en el repositorio para trazabilidad.

### Criterio de hecho

En el dashboard de Supabase, la sección **Table Editor** muestra las tablas `categories`, `habits`, `habit_days` y `check_ins`. La tabla `categories` contiene 6 filas de categorías predefinidas. En la sección **Authentication → Policies**, las 4 tablas listan sus políticas.

---

## Tarea 04 — Generar tipos TypeScript desde el esquema de Supabase

**Depende de:** Tarea 02, Tarea 03  
**ADR de referencia:** [ADR-0002](docs/adr/0002-supabase-como-backend.md), [ADR-0003](docs/adr/0003-modelo-de-datos.md)

**Objetivo:** reemplazar el placeholder `database.types.ts` con los tipos reales generados desde el esquema de Supabase, eliminando la necesidad de definir tipos de dominio manualmente.

### Pasos

1. Instalar Supabase CLI si no está disponible:
   ```bash
   npm install supabase --save-dev
   ```
2. Iniciar sesión y vincular el proyecto:
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   ```
   El `project-ref` se encuentra en Settings → General del dashboard de Supabase.
3. Generar los tipos:
   ```bash
   npx supabase gen types typescript --linked > src/types/database.types.ts
   ```
4. Crear los tipos de dominio de la aplicación en `src/types/index.ts`:
   ```ts
   import type { Database } from './database.types'

   export type Category  = Database['public']['Tables']['categories']['Row']
   export type Habit     = Database['public']['Tables']['habits']['Row']
   export type HabitDay  = Database['public']['Tables']['habit_days']['Row']
   export type CheckIn   = Database['public']['Tables']['check_ins']['Row']

   export type HabitFrequency = 'daily' | 'weekly'
   ```

### Criterio de hecho

`npx tsc --noEmit` completa sin errores. El archivo `src/types/database.types.ts` contiene los tipos `categories`, `habits`, `habit_days` y `check_ins` con sus columnas reales.

---

## Tarea 05 — Implementar middleware.ts de autenticación

**Depende de:** Tarea 02  
**ADR de referencia:** [ADR-0004](docs/adr/0004-autenticacion-middleware.md)  
**Prueba manual:** [Prueba 2](docs/pruebas-manuales.md) (redirección a login sin sesión)

**Objetivo:** crear `src/middleware.ts` que proteja todas las rutas excepto `/login` y `/register`, refresque la cookie de sesión en cada request y redirija al dashboard si hay sesión activa en rutas públicas.

### Pasos

1. Crear `src/middleware.ts`:
   ```ts
   import { createServerClient } from '@supabase/ssr'
   import { NextResponse, type NextRequest } from 'next/server'

   export async function middleware(request: NextRequest) {
     let supabaseResponse = NextResponse.next({ request })

     const supabase = createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           getAll() { return request.cookies.getAll() },
           setAll(cookiesToSet) {
             cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
             supabaseResponse = NextResponse.next({ request })
             cookiesToSet.forEach(({ name, value, options }) =>
               supabaseResponse.cookies.set(name, value, options)
             )
           },
         },
       }
     )

     const { data: { user } } = await supabase.auth.getUser()
     const { pathname } = request.nextUrl

     const isPublicRoute = pathname === '/login' || pathname === '/register'

     if (!user && !isPublicRoute) {
       return NextResponse.redirect(new URL('/login', request.url))
     }

     if (user && isPublicRoute) {
       return NextResponse.redirect(new URL('/dashboard', request.url))
     }

     return supabaseResponse
   }

   export const config = {
     matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
   }
   ```
2. Crear páginas placeholder para que las rutas existan:
   - `src/app/login/page.tsx` → componente que renderice `<div>Login</div>`
   - `src/app/register/page.tsx` → componente que renderice `<div>Register</div>`
   - `src/app/dashboard/page.tsx` → componente que renderice `<div>Dashboard</div>`

### Criterio de hecho

Abrir una ventana de incógnito y navegar a `http://localhost:3000/dashboard` redirige automáticamente a `http://localhost:3000/login`. Navegar a `/login` con una sesión activa redirige a `/dashboard`.

---

## Tarea 06 — Crear páginas /login y /register con formularios de UI

**Depende de:** Tarea 01, Tarea 05  
**ADR de referencia:** [ADR-0001](docs/adr/0001-nextjs-app-router.md)

**Objetivo:** implementar los formularios de autenticación con los componentes del sistema visual definidos en `docs/diseño.md`. La UI es funcional visualmente; las acciones se conectan en la Tarea 08.

### Pasos

1. Crear `src/app/(auth)/layout.tsx` — layout compartido para login y register:
   ```tsx
   export default function AuthLayout({ children }: { children: React.ReactNode }) {
     return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-8">
         <div className="w-full max-w-sm bg-white rounded-lg p-8 shadow-sm">
           {children}
         </div>
       </div>
     )
   }
   ```
2. Mover `src/app/login/page.tsx` a `src/app/(auth)/login/page.tsx` y reemplazar su contenido con el formulario real usando `Form`, `FormField`, `Input`, `Label`, `Button` de shadcn/ui. El formulario tiene campos `email` y `password`, un botón "Iniciar sesión" y un enlace a `/register`.
3. Crear `src/app/(auth)/register/page.tsx` con el mismo patrón: campos `email` y `password`, botón "Crear cuenta", enlace a `/login`.
4. Ambas páginas son `"use client"` y usan `react-hook-form` para gestionar el estado del formulario. Los campos tienen validación básica (email válido, contraseña mínimo 6 caracteres) con mensajes de error visibles vía `FormMessage`.
5. Actualizar el matcher del middleware si los paths cambiaron por el route group `(auth)`.

### Criterio de hecho

`http://localhost:3000/login` muestra un formulario con dos campos y un botón. Ingresar un email inválido y hacer submit muestra el mensaje de error de validación en la UI. No hay errores de TypeScript.

---

## Tarea 07 — Implementar Server Actions de autenticación

**Depende de:** Tarea 02, Tarea 04  
**ADR de referencia:** [ADR-0005](docs/adr/0005-server-actions-para-mutaciones.md)

**Objetivo:** crear `src/features/auth/actions.ts` con las tres acciones: `registerUser`, `loginUser` y `logoutUser`, siguiendo el contrato `{ data, error }` definido en el ADR.

### Pasos

1. Crear `src/features/auth/actions.ts`:
   ```ts
   'use server'

   import { revalidatePath } from 'next/cache'
   import { redirect } from 'next/navigation'
   import { createClient } from '@/lib/supabase/server'

   export async function registerUser(email: string, password: string) {
     const supabase = await createClient()
     const { error } = await supabase.auth.signUp({ email, password })
     if (error) {
       if (error.code === 'user_already_exists') return { error: 'Este email ya está registrado.' }
       return { error: 'No se pudo crear la cuenta. Intenta de nuevo.' }
     }
     revalidatePath('/', 'layout')
     redirect('/dashboard')
   }

   export async function loginUser(email: string, password: string) {
     const supabase = await createClient()
     const { error } = await supabase.auth.signInWithPassword({ email, password })
     if (error) return { error: 'Credenciales incorrectas.' }
     revalidatePath('/', 'layout')
     redirect('/dashboard')
   }

   export async function logoutUser() {
     const supabase = await createClient()
     await supabase.auth.signOut()
     revalidatePath('/', 'layout')
     redirect('/login')
   }
   ```

### Criterio de hecho

Llamar `registerUser('test@example.com', 'password123')` desde un Server Component de prueba crea el usuario en Supabase Auth (visible en el dashboard de Supabase, sección Authentication → Users). `loginUser` con credenciales incorrectas retorna `{ error: 'Credenciales incorrectas.' }` sin redirigir.

---

## Tarea 08 — Conectar formularios de auth a Server Actions

**Depende de:** Tarea 06, Tarea 07  
**ADR de referencia:** [ADR-0001](docs/adr/0001-nextjs-app-router.md), [ADR-0005](docs/adr/0005-server-actions-para-mutaciones.md)  
**Prueba manual:** [Prueba 1](docs/pruebas-manuales.md) (registro de nuevo usuario), [Prueba 2](docs/pruebas-manuales.md) (redirección tras login)

**Objetivo:** conectar los formularios de login y register a sus respectivas Server Actions usando `useTransition` para gestionar el estado de carga. Mostrar errores de la acción en la UI.

### Pasos

1. En `src/app/(auth)/register/page.tsx`, importar `registerUser` y llamarla en `onSubmit` con `startTransition`. Mostrar cualquier `error` retornado como mensaje de error visible bajo el formulario.
2. En `src/app/(auth)/login/page.tsx`, mismo patrón con `loginUser`.
3. Deshabilitar el botón de submit mientras `isPending` sea `true`.
4. Crear el layout del dashboard en `src/app/dashboard/layout.tsx` con `NavBar` (componente a crear en `src/components/NavBar.tsx`) que muestre el email del usuario y un botón que llame a `logoutUser`.
5. Para obtener el email del usuario en el NavBar (Server Component), llamar `supabase.auth.getUser()` desde el layout del dashboard.

### Criterio de hecho

Completar el flujo completo: registrar un usuario nuevo con `prueba.habittracker@example.com` + contraseña, confirmar que redirige al dashboard, hacer clic en "Cerrar sesión" y confirmar que redirige a `/login`. Prueba 1 del plan de pruebas pasa íntegramente.

---

## Tarea 09 — Implementar Server Actions de hábitos y categorías

**Depende de:** Tarea 04  
**ADR de referencia:** [ADR-0003](docs/adr/0003-modelo-de-datos.md), [ADR-0005](docs/adr/0005-server-actions-para-mutaciones.md)

**Objetivo:** crear `src/features/habits/actions.ts` con `createHabit` y `archiveHabit`, y `src/features/categories/actions.ts` con `createCategory`. Incluir validación de sesión y reglas de negocio (días requeridos para hábitos semanales).

### Pasos

1. Crear `src/features/habits/actions.ts`:
   ```ts
   'use server'

   import { revalidatePath } from 'next/cache'
   import { createClient } from '@/lib/supabase/server'
   import type { HabitFrequency } from '@/types'

   interface CreateHabitInput {
     name: string
     description?: string
     frequency: HabitFrequency
     categoryId?: string
     daysOfWeek?: number[]
   }

   export async function createHabit(input: CreateHabitInput) {
     const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()
     if (!user) return { error: 'No autenticado.' }

     if (input.frequency === 'weekly' && (!input.daysOfWeek || input.daysOfWeek.length === 0)) {
       return { error: 'Debes seleccionar al menos un día para un hábito semanal.' }
     }

     const { data: habit, error: habitError } = await supabase
       .from('habits')
       .insert({
         user_id:     user.id,
         name:        input.name,
         description: input.description ?? null,
         frequency:   input.frequency,
         category_id: input.categoryId ?? null,
       })
       .select()
       .single()

     if (habitError || !habit) return { error: 'No se pudo crear el hábito.' }

     if (input.frequency === 'weekly' && input.daysOfWeek) {
       await supabase.from('habit_days').insert(
         input.daysOfWeek.map(day => ({ habit_id: habit.id, day_of_week: day }))
       )
     }

     revalidatePath('/dashboard')
     return { data: habit }
   }

   export async function archiveHabit(habitId: string) {
     const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()
     if (!user) return { error: 'No autenticado.' }

     const { error } = await supabase
       .from('habits')
       .update({ archived_at: new Date().toISOString() })
       .eq('id', habitId)
       .eq('user_id', user.id)

     if (error) return { error: 'No se pudo archivar el hábito.' }
     revalidatePath('/dashboard')
     return { data: { success: true } }
   }
   ```
2. Crear `src/features/categories/actions.ts` con `createCategory` que inserta una categoría no predefinida con `user_id` del usuario autenticado y llama `revalidatePath('/dashboard')`.

### Criterio de hecho

Invocar `createHabit({ name: 'Test', frequency: 'weekly', daysOfWeek: [] })` retorna `{ error: 'Debes seleccionar al menos un día...' }`. Invocar `createHabit({ name: 'Test', frequency: 'daily' })` con usuario autenticado inserta una fila en la tabla `habits` de Supabase (verificable en el Table Editor).

---

## Tarea 10 — Crear HabitForm y página /habits/new

**Depende de:** Tarea 06, Tarea 09  
**ADR de referencia:** [ADR-0001](docs/adr/0001-nextjs-app-router.md)  
**Prueba manual:** [Prueba 3](docs/pruebas-manuales.md) (crear hábito), [Prueba 4](docs/pruebas-manuales.md) (validación de días en hábito semanal)

**Objetivo:** implementar el componente `HabitForm` (Client Component) y la página `/habits/new` que lo usa. El formulario debe gestionar el condicional de días de semana cuando la frecuencia es "semanal" y llamar a `createHabit` al enviarse.

### Pasos

1. Crear `src/features/habits/components/HabitForm.tsx` como `"use client"`. Campos requeridos:
   - `name` (Input + Label)
   - `description` (Input, opcional)
   - `frequency` (Select con opciones "Diaria" / "Semanal")
   - `daysOfWeek` — aparece solo si frecuencia es "Semanal": 7 botones toggle (L M X J V S D) usando el componente `DayPicker` a crear en `src/components/DayPicker.tsx`
   - `categoryId` (Select cargado con las categorías disponibles, pasadas como prop)
   - Botón "Guardar" (primary) y botón "Cancelar" (ghost) que navega a `/dashboard`
2. El formulario usa `react-hook-form`. La validación de días de semana se hace en `resolver` o en `onSubmit` antes de llamar la acción. El error de validación aparece vía `FormMessage`.
3. Crear `src/app/dashboard/habits/new/page.tsx` como Server Component:
   - Lee las categorías disponibles (predefinidas + propias del usuario) desde Supabase.
   - Renderiza `HabitForm` pasando las categorías como prop.
4. Al enviar, llama `createHabit` con `useTransition`. Si retorna error, muestra el mensaje en la UI. Si retorna `data`, el `revalidatePath` del Server Action actualiza el dashboard automáticamente y la navegación programática redirige a `/dashboard`.

### Criterio de hecho

Navegar a `/dashboard/habits/new`, completar todos los campos con frecuencia "Semanal" sin seleccionar ningún día y hacer clic en "Guardar" muestra el mensaje de validación sin cerrar el formulario (Prueba 4). Completar los campos correctamente y guardar crea el hábito y aparece en el dashboard (Prueba 3).

---

## Tarea 11 — Listar hábitos activos en el dashboard (HabitCard)

**Depende de:** Tarea 10  
**ADR de referencia:** [ADR-0001](docs/adr/0001-nextjs-app-router.md), [ADR-0003](docs/adr/0003-modelo-de-datos.md)  
**Prueba manual:** [Prueba 3](docs/pruebas-manuales.md) (hábito aparece en lista)

**Objetivo:** reemplazar el placeholder del dashboard con un Server Component que lea los hábitos activos del usuario y los renderice con `HabitCard`. Hábitos semanales solo aparecen si el día actual está entre sus `habit_days`.

### Pasos

1. Crear `src/features/habits/components/HabitCard.tsx` como Client Component con las props: `habit: Habit`, `isCheckedToday: boolean`, `streak: number`. Por ahora renderiza nombre, categoría y un `CheckInButton` placeholder (botón simple, se conecta en Tarea 13). El `StreakBadge` puede ser un placeholder textual hasta la Tarea 14.
2. Actualizar `src/app/dashboard/page.tsx` como Server Component:
   - Obtener `user` desde `supabase.auth.getUser()`.
   - Query: `habits` donde `archived_at IS NULL` y `user_id = user.id`, con join a `categories` y `habit_days`.
   - Filtrar en memoria los hábitos semanales: mostrar solo si `day_of_week` del día actual (usando `new Date().getDay()`) está en sus días configurados.
   - Para cada hábito, verificar si existe un `check_in` con `checked_date = today`.
   - Si no hay hábitos, renderizar `EmptyState` (componente a crear en `src/components/EmptyState.tsx`) con un CTA a `/dashboard/habits/new`.
   - Renderizar la lista de `HabitCard`.
3. Crear `src/components/PageHeader.tsx` con props `title: string` y `action?: React.ReactNode`. Usarlo en el dashboard con título "Mis hábitos" y un botón "Nuevo hábito" que navega a `/dashboard/habits/new`.

### Criterio de hecho

Después de crear un hábito diario, aparece en el dashboard. Un hábito semanal configurado para lunes no aparece en el dashboard un martes. Con cero hábitos, el dashboard muestra el estado vacío con el botón "Nuevo hábito".

---

## Tarea 12 — Implementar Server Actions de check-in con reglas de negocio

**Depende de:** Tarea 04, Tarea 09  
**ADR de referencia:** [ADR-0003](docs/adr/0003-modelo-de-datos.md), [ADR-0005](docs/adr/0005-server-actions-para-mutaciones.md)  
**Prueba manual:** [Prueba 7](docs/pruebas-manuales.md) (no se puede marcar con fecha antigua)

**Objetivo:** crear `src/features/checkins/actions.ts` con `createCheckIn` y `deleteCheckIn`. Ambas acciones verifican la ventana temporal permitida antes de ejecutar la mutación.

### Pasos

1. Crear `src/features/checkins/actions.ts`:
   ```ts
   'use server'

   import { revalidatePath } from 'next/cache'
   import { createClient } from '@/lib/supabase/server'

   export async function createCheckIn(habitId: string, checkedDate: string) {
     const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()
     if (!user) return { error: 'No autenticado.' }

     const today = new Date()
     today.setHours(0, 0, 0, 0)
     const target = new Date(checkedDate)
     target.setHours(0, 0, 0, 0)
     const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000)

     if (diffDays > 1 || diffDays < 0) {
       return { error: 'Solo puedes registrar check-ins de hoy o de ayer.' }
     }

     const { error } = await supabase.from('check_ins').insert({
       habit_id:     habitId,
       user_id:      user.id,
       checked_date: checkedDate,
     })

     if (error) return { error: 'No se pudo registrar el check-in.' }
     revalidatePath('/dashboard')
     return { data: { success: true } }
   }

   export async function deleteCheckIn(checkInId: string) {
     const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()
     if (!user) return { error: 'No autenticado.' }

     const { data: checkIn } = await supabase
       .from('check_ins')
       .select('created_at')
       .eq('id', checkInId)
       .eq('user_id', user.id)
       .single()

     if (!checkIn) return { error: 'Check-in no encontrado.' }

     const createdDate = new Date(checkIn.created_at)
     createdDate.setHours(0, 0, 0, 0)
     const today = new Date()
     today.setHours(0, 0, 0, 0)

     if (createdDate.getTime() !== today.getTime()) {
       return { error: 'Solo puedes desmarcar un check-in el mismo día en que fue registrado.' }
     }

     await supabase.from('check_ins').delete().eq('id', checkInId)
     revalidatePath('/dashboard')
     return { data: { success: true } }
   }
   ```

### Criterio de hecho

Llamar `createCheckIn(habitId, '2026-05-01')` (fecha con más de 1 día de antigüedad) retorna `{ error: 'Solo puedes registrar check-ins de hoy o de ayer.' }` sin insertar nada en la base de datos. Llamar con la fecha de hoy inserta la fila correctamente.

---

## Tarea 13 — Conectar CheckInButton al dashboard

**Depende de:** Tarea 11, Tarea 12  
**ADR de referencia:** [ADR-0005](docs/adr/0005-server-actions-para-mutaciones.md)  
**Prueba manual:** [Prueba 5](docs/pruebas-manuales.md) (marcar check-in), [Prueba 6](docs/pruebas-manuales.md) (desmarcar)

**Objetivo:** reemplazar el botón placeholder de `HabitCard` con el componente `CheckInButton` que llama a `createCheckIn` o `deleteCheckIn` según el estado actual, usando `useTransition` para optimismo visual.

### Pasos

1. Crear `src/components/CheckInButton.tsx` como `"use client"`:
   - Props: `habitId: string`, `checkInId: string | null`, `isCheckedToday: boolean`
   - Si `isCheckedToday`: muestra botón en estado completado (fondo `green-600`, texto "Completado"). Al hacer clic, llama `deleteCheckIn(checkInId!)`.
   - Si no `isCheckedToday`: muestra botón en estado pendiente (borde `indigo-600`). Al hacer clic, llama `createCheckIn(habitId, today)` donde `today` es la fecha actual en formato `YYYY-MM-DD`.
   - Deshabilitar el botón mientras `isPending` es `true` (useTransition).
2. Actualizar `HabitCard` para recibir `checkInId: string | null` y usar `CheckInButton` en lugar del placeholder.
3. Actualizar el dashboard para pasar `checkInId` a cada `HabitCard` (ya se tienen los check-ins de hoy desde la Tarea 11).

### Criterio de hecho

Hacer clic en un hábito pendiente lo cambia visualmente a completado sin recargar la página. Hacer clic de nuevo lo desmarca. Prueba 5 y Prueba 6 pasan íntegramente.

---

## Tarea 14 — Computar racha y mostrar StreakBadge

**Depende de:** Tarea 11, Tarea 04  
**ADR de referencia:** [ADR-0003](docs/adr/0003-modelo-de-datos.md)  
**Prueba manual:** [Prueba 8](docs/pruebas-manuales.md) (período de gracia de 1 día)

**Objetivo:** implementar la función `computeStreak` que calcula la racha actual desde los check-ins históricos respetando el período de gracia de 1 día, y mostrarla en `StreakBadge` dentro de `HabitCard`.

### Pasos

1. Crear `src/features/habits/streak.ts` con la función `computeStreak`:
   ```ts
   export function computeStreak(checkedDates: string[]): number {
     if (checkedDates.length === 0) return 0

     const sorted = [...checkedDates]
       .map(d => new Date(d))
       .sort((a, b) => b.getTime() - a.getTime())

     const today = new Date()
     today.setHours(0, 0, 0, 0)

     const mostRecent = new Date(sorted[0])
     mostRecent.setHours(0, 0, 0, 0)

     const daysSinceLast = Math.round((today.getTime() - mostRecent.getTime()) / 86400000)
     // Período de gracia: si falló ayer (daysSinceLast === 1), la racha no se rompió aún
     // Si falló hace 2+ días, la racha es 0
     if (daysSinceLast > 1) return 0

     let streak = 1
     for (let i = 1; i < sorted.length; i++) {
       const prev = new Date(sorted[i - 1])
       const curr = new Date(sorted[i])
       prev.setHours(0, 0, 0, 0)
       curr.setHours(0, 0, 0, 0)
       const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000)
       if (diff === 1) {
         streak++
       } else {
         break
       }
     }
     return streak
   }
   ```
2. Crear `src/components/StreakBadge.tsx` que recibe `streak: number` y renderiza el contador con ícono de fuego usando la clase `text-green-600` cuando `streak > 0`.
3. Actualizar el dashboard para cargar los `checked_date` de todos los check-ins de cada hábito (no solo el de hoy), calcular la racha con `computeStreak` y pasarla a `HabitCard`.

### Criterio de hecho

Un hábito con check-ins en los últimos 3 días muestra racha "3" en el `StreakBadge`. Un hábito con check-ins hasta avant-ayer (sin ayer ni hoy) muestra racha "0". Un hábito con check-ins hasta ayer (sin hoy) muestra racha igual al número de días consecutivos previos (período de gracia activo). Prueba 8 — Parte A pasa.

---

## Tarea 15 — Archivar hábito: página /habits/[id]/edit y ConfirmDialog

**Depende de:** Tarea 09, Tarea 11  
**ADR de referencia:** [ADR-0003](docs/adr/0003-modelo-de-datos.md), [ADR-0005](docs/adr/0005-server-actions-para-mutaciones.md)  
**Prueba manual:** [Prueba 9](docs/pruebas-manuales.md) (hábito archivado desaparece del dashboard)

**Objetivo:** crear la página de edición de hábito y el flujo de archivado con confirmación. Al archivar, el hábito desaparece del dashboard y no acepta nuevos check-ins, pero sus datos históricos se preservan en la base de datos.

### Pasos

1. Crear `src/app/dashboard/habits/[id]/edit/page.tsx` como Server Component que:
   - Carga el hábito por ID desde Supabase (verificando que pertenece al usuario autenticado).
   - Si no existe o no pertenece al usuario, llama `notFound()`.
   - Renderiza `HabitForm` en modo edición con los valores precargados y un botón destructivo "Archivar hábito".
2. Crear `src/components/ConfirmDialog.tsx` como Client Component usando `Dialog` de shadcn/ui. Props: `trigger: React.ReactNode`, `title: string`, `description: string`, `onConfirm: () => void`. Al confirmar, llama `onConfirm` y cierra el diálogo.
3. El botón "Archivar hábito" en la página de edición abre el `ConfirmDialog`. Al confirmar, llama `archiveHabit(id)` con `useTransition` y navega a `/dashboard`.
4. Agregar en cada `HabitCard` del dashboard un enlace o botón secundario que navega a `/dashboard/habits/[id]/edit`.
5. Actualizar `createHabit` en `actions.ts` para también manejar la edición: agregar `updateHabit(id, input)` que actualiza los campos editables y preserva `created_at` y el historial de check-ins intacto.

### Criterio de hecho

Archivar el hábito "Leer 30 minutos" desde la página de edición y confirmar hace que desaparezca de la lista del dashboard inmediatamente. En el Table Editor de Supabase, la fila en `habits` tiene `archived_at` no nulo. Los registros en `check_ins` asociados al hábito siguen existiendo. Prueba 9 pasa íntegramente.

---

## Resumen de orden y dependencias

```
T01 ──→ T02 ──→ T03 ──→ T04 ──→ T07 ──→ T08
         │                └──→ T09 ──→ T10 ──→ T11 ──→ T13
         │                      └──→ T12 ──┘           │
         └──→ T05                                       │
         └──→ T06 ──→ T08                               │
                       └──────────────────────────────→ T13
                                                T11 ──→ T14
                                           T09, T11 ──→ T15
```

**Ruta crítica:** T01 → T02 → T03 → T04 → T09 → T10 → T11 → T13

Las tareas T05, T06, T07, T08 pueden avanzar en paralelo con T03 y T04 una vez T02 esté completa.
