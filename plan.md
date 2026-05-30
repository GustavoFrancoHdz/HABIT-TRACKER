# Plan de implementación — Habit Tracker (núcleo)

**Generado desde:** `spec.md`, ADRs 0001–0005, `docs/diseño.md`, `docs/pruebas-manuales.md`, `AGENTS.md`  
**Ejecutor:** agente `implementer`  
**Alcance:** núcleo funcional (auth + hábitos + check-ins + rachas + categorías + progreso semanal). Sin extensiones.

---

## Convenciones de lectura

- **Depende de:** las tareas que deben estar completas antes de iniciar esta.
- **Criterio de hecho:** una línea observable que confirma que la tarea terminó. No es subjetivo; es un estado verificable.
- Si una tarea no lista un ADR o prueba manual, no hay uno aplicable en ese punto.
- **Convención de días de semana:** `day_of_week` en base de datos usa el mismo mapeo que `Date.getDay()` de JavaScript: 0 = domingo, 1 = lunes, 2 = martes, 3 = miércoles, 4 = jueves, 5 = viernes, 6 = sábado. Toda comparación entre DB y JS debe respetar este mapeo.
- **Aritmética de fechas:** nunca usar `new Date('YYYY-MM-DD')` para comparar con hora local — lo parsea como UTC midnight y da diffs incorrectos fuera de UTC+0. Usar `new Date().toLocaleDateString('sv')` que devuelve `'YYYY-MM-DD'` en hora local, y operar sobre strings o sobre objetos `Date` construidos con `new Date(dateStr + 'T00:00:00')` (sin Z).

---

## Tarea 01 — Inicializar proyecto Next.js 15 con scaffolding completo

**Depende de:** ninguna

**Objetivo:** crear el repositorio de la aplicación con Next.js 15, App Router, TypeScript strict, Tailwind e instalar shadcn/ui inicializado.

### Precondición obligatoria antes de continuar

Antes de ejecutar cualquier prueba de autenticación (Prueba 1), desactivar la confirmación de email en Supabase: **Dashboard → Authentication → Settings → Enable email confirmations → OFF**. Sin esto, `signUp` deja al usuario en estado pendiente de confirmación y nunca redirige al dashboard.

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

`npm run dev` arranca sin errores y `http://localhost:3000` devuelve 200 mostrando el texto "Habit Tracker".

---

## Tarea 02 — Instalar y configurar clientes Supabase

**Depende de:** Tarea 01  
**ADR de referencia:** [ADR-0002](docs/adr/0002-supabase-como-backend.md)

**Objetivo:** instalar `@supabase/ssr` y crear los dos clientes (server y browser) en `src/lib/supabase/`, listos para ser importados. Los clientes usan `any` como genérico hasta que la Tarea 04 genere los tipos reales.

### Pasos

1. Instalar dependencias:
   ```bash
   npm install @supabase/ssr @supabase/supabase-js
   ```
2. Crear `.env.local` en la raíz (obtener valores en Supabase Dashboard → Settings → API):
   ```
   NEXT_PUBLIC_SUPABASE_URL=<url-del-proyecto>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```
3. Crear `src/lib/supabase/server.ts`:
   ```ts
   import { createServerClient } from '@supabase/ssr'
   import { cookies } from 'next/headers'

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   export async function createClient() {
     const cookieStore = await cookies()
     return createServerClient<any>(
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

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   export function createClient() {
     return createBrowserClient<any>(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     )
   }
   ```

### Criterio de hecho

`npm run dev` arranca sin errores. Los dos archivos existen en `src/lib/supabase/` y el servidor no lanza errores de importación al arrancar.

---

## Tarea 03 — Crear migración SQL y aplicar esquema en Supabase

**Depende de:** Tarea 02  
**ADR de referencia:** [ADR-0003](docs/adr/0003-modelo-de-datos.md)

**Objetivo:** crear las 4 tablas del modelo de datos, habilitar RLS, crear las políticas de acceso y poblar las categorías predefinidas.

### Pasos

1. **Ejecutar en el SQL Editor del dashboard de Supabase** (corre como `service_role`, bypasea RLS — no ejecutar con el cliente de la app ni con `supabase db push` sin `--role service_role`, ya que el seed inserta con `user_id = null` y la política de INSERT lo rechazaría como usuario autenticado):

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
-- day_of_week sigue el mapeo de JS: 0=domingo, 1=lunes, ..., 6=sábado
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

-- Seed: categorías predefinidas
-- Se ejecuta con service_role (SQL Editor), por eso user_id puede ser null
insert into categories (user_id, name, is_predefined) values
  (null, 'Salud',         true),
  (null, 'Deporte',       true),
  (null, 'Bienestar',     true),
  (null, 'Aprendizaje',   true),
  (null, 'Productividad', true),
  (null, 'Nutrición',     true);
```

2. Guardar el SQL como `supabase/migrations/20260529000000_initial_schema.sql` en el repositorio para trazabilidad.

### Criterio de hecho

En Supabase Dashboard → Table Editor: las tablas `categories`, `habits`, `habit_days` y `check_ins` existen con sus columnas. La tabla `categories` tiene 6 filas con `is_predefined = true`. En Authentication → Policies: las 4 tablas listan sus políticas.

---

## Tarea 04 — Generar tipos TypeScript desde el esquema de Supabase

**Depende de:** Tarea 02, Tarea 03  
**ADR de referencia:** [ADR-0002](docs/adr/0002-supabase-como-backend.md), [ADR-0003](docs/adr/0003-modelo-de-datos.md)

**Objetivo:** generar `src/types/database.types.ts` desde el esquema real de Supabase y reemplazar el `any` de los clientes por el tipo `Database` correcto.

### Pasos

1. Instalar Supabase CLI:
   ```bash
   npm install supabase --save-dev
   ```
2. Iniciar sesión y vincular el proyecto (el `project-ref` está en Settings → General):
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   ```
3. Generar los tipos:
   ```bash
   npx supabase gen types typescript --linked > src/types/database.types.ts
   ```
4. Crear `src/types/index.ts` con aliases de dominio:
   ```ts
   import type { Database } from './database.types'

   export type Category  = Database['public']['Tables']['categories']['Row']
   export type Habit     = Database['public']['Tables']['habits']['Row']
   export type HabitDay  = Database['public']['Tables']['habit_days']['Row']
   export type CheckIn   = Database['public']['Tables']['check_ins']['Row']

   export type HabitFrequency = 'daily' | 'weekly'
   ```
5. Actualizar `src/lib/supabase/server.ts` y `src/lib/supabase/client.ts`: reemplazar `<any>` por `<Database>` e importar `Database` desde `@/types/database.types`. Eliminar los comentarios `eslint-disable` del paso anterior.

### Criterio de hecho

`npx tsc --noEmit` completa sin errores. `src/types/database.types.ts` contiene los tipos de las cuatro tablas con sus columnas reales.

---

## Tarea 05 — Middleware de autenticación + páginas /login y /register

**Depende de:** Tarea 02  
**ADR de referencia:** [ADR-0004](docs/adr/0004-autenticacion-middleware.md), [ADR-0001](docs/adr/0001-nextjs-app-router.md)  
**Prueba manual:** [Prueba 2](docs/pruebas-manuales.md) (redirección a login sin sesión)

**Objetivo:** crear `src/middleware.ts` que proteja todas las rutas excepto `/login` y `/register`, e implementar los formularios de autenticación con UI completa en un route group `(auth)`. La UI es funcional visualmente; las acciones se conectan en la Tarea 07.

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
2. Crear `src/app/(auth)/layout.tsx`:
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
3. Crear `src/app/(auth)/login/page.tsx` como `"use client"` con `react-hook-form`: campos `email` y `password`, botón "Iniciar sesión" (primary), enlace a `/register`. Validación básica: email válido, contraseña mínimo 6 caracteres, errores vía `FormMessage`.
4. Crear `src/app/(auth)/register/page.tsx` con el mismo patrón: botón "Crear cuenta", enlace a `/login`.
5. Crear `src/app/dashboard/page.tsx` con un placeholder `<div>Dashboard</div>` para que el middleware tenga a dónde redirigir.

### Criterio de hecho

Abrir una ventana de incógnito y navegar a `http://localhost:3000/dashboard` redirige a `/login`. `http://localhost:3000/login` muestra el formulario con dos campos y un botón. Ingresar un email inválido y hacer submit muestra el error de validación sin redirigir.

---

## Tarea 06 — Implementar Server Actions de autenticación

**Depende de:** Tarea 02, Tarea 04  
**ADR de referencia:** [ADR-0005](docs/adr/0005-server-actions-para-mutaciones.md)

**Objetivo:** crear `src/features/auth/actions.ts` con `registerUser`, `loginUser` y `logoutUser` siguiendo el contrato `{ data?, error? }` del ADR.

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
       if (error.code === 'user_already_registered') return { error: 'Este email ya está registrado.' }
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

Completar el formulario de registro en `/register` con un email nuevo crea el usuario en Supabase Dashboard → Authentication → Users (verificación visual). Completar el formulario de login con credenciales incorrectas muestra "Credenciales incorrectas." sin redirigir (se verifica en Tarea 07 una vez conectados los formularios).

---

## Tarea 07 — Conectar formularios de auth a Server Actions

**Depende de:** Tarea 05, Tarea 06  
**ADR de referencia:** [ADR-0001](docs/adr/0001-nextjs-app-router.md), [ADR-0005](docs/adr/0005-server-actions-para-mutaciones.md)  
**Prueba manual:** [Prueba 1](docs/pruebas-manuales.md) (registro de nuevo usuario), [Prueba 2](docs/pruebas-manuales.md) (redirección tras login)

**Objetivo:** conectar los formularios de login y register a sus Server Actions con `useTransition`, mostrar errores de la acción en la UI, y crear el layout del dashboard con `NavBar` y logout.

### Pasos

1. En `src/app/(auth)/register/page.tsx`, importar `registerUser` y llamarla en `onSubmit` dentro de `startTransition`. Mostrar el `error` retornado bajo el formulario. Deshabilitar el botón mientras `isPending`.
2. En `src/app/(auth)/login/page.tsx`, mismo patrón con `loginUser`.
3. Crear `src/components/LogoutButton.tsx` como `"use client"` — un botón que llama a `logoutUser` con `useTransition`.
4. Crear `src/components/NavBar.tsx` como Server Component: muestra el nombre de la app y recibe `userEmail: string` como prop. Renderiza `LogoutButton` como hijo (composición Server → Client).
5. Crear `src/app/dashboard/layout.tsx`: llama `supabase.auth.getUser()`, obtiene el email y renderiza `NavBar` con ese email. Los hijos van en `<main className="max-w-2xl mx-auto px-8 py-6">`.

### Criterio de hecho

Prueba 1 pasa íntegramente: registrar `prueba.habittracker@example.com`, confirmar redirección al dashboard, el email aparece en la NavBar, hacer clic en "Cerrar sesión" redirige a `/login`.

---

## Tarea 08 — Implementar Server Actions de hábitos y categorías

**Depende de:** Tarea 04  
**ADR de referencia:** [ADR-0003](docs/adr/0003-modelo-de-datos.md), [ADR-0005](docs/adr/0005-server-actions-para-mutaciones.md)

**Objetivo:** crear `src/features/habits/actions.ts` con `createHabit` y `archiveHabit`, y `src/features/categories/actions.ts` con `createCategory`. Todas verifican sesión y aplican las reglas de negocio.

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
2. Crear `src/features/categories/actions.ts` con `createCategory`:
   ```ts
   'use server'

   import { revalidatePath } from 'next/cache'
   import { createClient } from '@/lib/supabase/server'

   export async function createCategory(name: string) {
     const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()
     if (!user) return { error: 'No autenticado.' }

     const { data, error } = await supabase
       .from('categories')
       .insert({ user_id: user.id, name, is_predefined: false })
       .select()
       .single()

     if (error) return { error: 'No se pudo crear la categoría.' }
     revalidatePath('/dashboard')
     return { data }
   }
   ```

### Criterio de hecho

Desde el formulario de la Tarea 09 (una vez implementado), crear un hábito diario inserta una fila en `habits` visible en el Table Editor de Supabase. Intentar crear un hábito semanal sin días seleccionados retorna el error de validación y no inserta ninguna fila.

---

## Tarea 09 — Crear HabitForm y página /habits/new

**Depende de:** Tarea 07, Tarea 08  
**ADR de referencia:** [ADR-0001](docs/adr/0001-nextjs-app-router.md)  
**Prueba manual:** [Prueba 4](docs/pruebas-manuales.md) (validación de días en hábito semanal)

**Objetivo:** implementar `HabitForm` (Client Component) y la página `/dashboard/habits/new`. El formulario maneja el condicional de días de semana y conecta con `createHabit`.

### Pasos

1. Crear `src/components/DayPicker.tsx` como `"use client"`: recibe `value: number[]` y `onChange: (days: number[]) => void`. Renderiza 7 botones toggle con las letras D L M X J V S (mapeadas a valores 0–6 según la convención del plan). Al hacer clic en un botón, agrega o quita su valor del array.
2. Crear `src/features/habits/components/HabitForm.tsx` como `"use client"` con `react-hook-form`. Campos:
   - `name` (Input + Label, requerido)
   - `description` (Input, opcional)
   - `frequency` (Select: "Diaria" / "Semanal")
   - `daysOfWeek` — `DayPicker`, solo visible si `frequency === 'weekly'`; validación: al menos un día seleccionado
   - `categoryId` (Select con las categorías pasadas como prop `categories: Category[]`)
   - Botón "Guardar" (primary), botón "Cancelar" (ghost) que navega a `/dashboard`
3. Crear `src/app/dashboard/habits/new/page.tsx` como Server Component:
   - Lee categorías (predefinidas + propias del usuario) con una query que filtra `is_predefined = true OR user_id = auth.uid()`.
   - Renderiza `HabitForm` pasando las categorías.
4. Al enviar, `HabitForm` llama `createHabit` con `useTransition`. Si retorna `error`, muestra el mensaje en la UI. Si retorna `data`, navega programáticamente a `/dashboard` con `useRouter`.

### Criterio de hecho

Navegar a `/dashboard/habits/new`, seleccionar frecuencia "Semanal", dejar todos los días sin seleccionar y hacer clic en "Guardar" muestra el mensaje de validación sin cerrar el formulario ni insertar nada (Prueba 4). Completar los campos correctamente y guardar inserta la fila en Supabase y redirige a `/dashboard`.

---

## Tarea 10 — Listar hábitos activos en el dashboard (HabitCard)

**Depende de:** Tarea 09  
**ADR de referencia:** [ADR-0001](docs/adr/0001-nextjs-app-router.md), [ADR-0003](docs/adr/0003-modelo-de-datos.md)

**Objetivo:** reemplazar el placeholder del dashboard con un Server Component que lee hábitos activos con una query única (LEFT JOIN) y los renderiza con `HabitCard`.

### Pasos

1. Actualizar `src/app/dashboard/page.tsx` como Server Component:
   - Obtener `user` y `todayStr = new Date().toLocaleDateString('sv')` (fecha local en formato YYYY-MM-DD).
   - Obtener `todayDow = new Date().getDay()` (0=domingo … 6=sábado, según la convención del plan).
   - Ejecutar una sola query que traiga hábitos activos con sus días y el check-in de hoy:
     ```ts
     const { data: habits } = await supabase
       .from('habits')
       .select(`
         *,
         categories ( id, name ),
         habit_days ( day_of_week ),
         check_ins!left ( id, checked_date )
       `)
       .eq('user_id', user.id)
       .is('archived_at', null)
       .eq('check_ins.checked_date', todayStr)
     ```
   - Filtrar en memoria: excluir hábitos semanales cuyos `habit_days` no incluyan `todayDow`.
   - Si no hay hábitos, renderizar `EmptyState` con CTA a `/dashboard/habits/new`.
   - Renderizar lista de `HabitCard`.
2. Crear `src/features/habits/components/HabitCard.tsx` como Client Component con props:
   `habit: Habit`, `categoryName: string | null`, `checkInId: string | null`, `streak: number`
   Por ahora `streak` recibe 0 como placeholder (se conecta en Tarea 13). Renderiza nombre, categoría y un `CheckInButton` placeholder (botón simple, se conecta en Tarea 12).
3. Crear `src/components/EmptyState.tsx` con mensaje y botón CTA.
4. Crear `src/components/PageHeader.tsx` con props `title: string` y `action?: React.ReactNode`. Usarlo en el dashboard con título "Mis hábitos" y un botón "Nuevo hábito" que navega a `/dashboard/habits/new`.

### Criterio de hecho

Después de crear un hábito diario en Tarea 09, recargando `/dashboard` aparece en la lista. Con cero hábitos, el dashboard muestra el estado vacío con el botón "Nuevo hábito". (La verificación de hábitos semanales por día se valida en Tarea 12 una vez que los check-ins están activos.)

---

## Tarea 11 — Implementar Server Actions de check-in con reglas de negocio

**Depende de:** Tarea 04, Tarea 08  
**ADR de referencia:** [ADR-0003](docs/adr/0003-modelo-de-datos.md), [ADR-0005](docs/adr/0005-server-actions-para-mutaciones.md)  
**Prueba manual:** [Prueba 7](docs/pruebas-manuales.md) (no se puede marcar con fecha antigua)

**Objetivo:** crear `src/features/checkins/actions.ts` con `createCheckIn` y `deleteCheckIn`. La aritmética de fechas usa comparación de strings en hora local para evitar bugs de timezone.

### Pasos

1. Crear `src/features/checkins/actions.ts`:
   ```ts
   'use server'

   import { revalidatePath } from 'next/cache'
   import { createClient } from '@/lib/supabase/server'

   function getTodayStr() {
     return new Date().toLocaleDateString('sv') // 'YYYY-MM-DD' en hora local
   }

   function getYesterdayStr() {
     const d = new Date()
     d.setDate(d.getDate() - 1)
     return d.toLocaleDateString('sv')
   }

   export async function createCheckIn(habitId: string, checkedDate: string) {
     const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()
     if (!user) return { error: 'No autenticado.' }

     const todayStr     = getTodayStr()
     const yesterdayStr = getYesterdayStr()

     if (checkedDate !== todayStr && checkedDate !== yesterdayStr) {
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

     const createdStr = new Date(checkIn.created_at).toLocaleDateString('sv')
     const todayStr   = getTodayStr()

     if (createdStr !== todayStr) {
       return { error: 'Solo puedes desmarcar un check-in el mismo día en que fue registrado.' }
     }

     await supabase.from('check_ins').delete().eq('id', checkInId)
     revalidatePath('/dashboard')
     return { data: { success: true } }
   }
   ```

### Criterio de hecho

Usando el formulario de la Tarea 12 (una vez implementado): marcar un hábito hoy lo registra en `check_ins` (verificable en Table Editor). Intentar registrar con `checkedDate = '2026-05-01'` retorna el error de ventana temporal sin insertar fila (verificable porque la tabla no cambia).

---

## Tarea 12 — Conectar CheckInButton al dashboard

**Depende de:** Tarea 10, Tarea 11  
**ADR de referencia:** [ADR-0005](docs/adr/0005-server-actions-para-mutaciones.md)  
**Prueba manual:** [Prueba 5](docs/pruebas-manuales.md) (marcar check-in), [Prueba 6](docs/pruebas-manuales.md) (desmarcar)

**Objetivo:** reemplazar el botón placeholder de `HabitCard` con `CheckInButton` que llama a `createCheckIn` o `deleteCheckIn` según el estado actual.

### Pasos

1. Crear `src/components/CheckInButton.tsx` como `"use client"`:
   - Props: `habitId: string`, `checkInId: string | null`, `isCheckedToday: boolean`
   - Si `isCheckedToday`: botón en estado completado (fondo `green-600`, texto "Completado"). Al hacer clic llama `deleteCheckIn(checkInId!)`.
   - Si no: botón en estado pendiente (borde `indigo-600`). Al hacer clic llama `createCheckIn(habitId, new Date().toLocaleDateString('sv'))`.
   - Deshabilitar mientras `isPending` (useTransition).
2. Actualizar `HabitCard` para usar `CheckInButton` en lugar del placeholder.
3. El dashboard ya tiene `checkInId` desde la query de Tarea 10 — pasarlo a `HabitCard`.

### Criterio de hecho

Prueba 5 y Prueba 6 pasan íntegramente: marcar un hábito pendiente lo cambia a completado visualmente sin recargar; desmarcar lo devuelve a pendiente.

---

## Tarea 13 — Computar racha y mostrar StreakBadge

**Depende de:** Tarea 10, Tarea 04  
**ADR de referencia:** [ADR-0003](docs/adr/0003-modelo-de-datos.md)  
**Prueba manual:** [Prueba 8](docs/pruebas-manuales.md) (período de gracia de 1 día)

**Objetivo:** implementar `computeStreak` con comparación de strings y mostrarla en `StreakBadge`. Los check-ins se cargan con un límite de 365 días para acotar la query.

### Pasos

1. Crear `src/features/habits/streak.ts`:
   ```ts
   function toLocalDateStr(date: Date): string {
     return date.toLocaleDateString('sv') // 'YYYY-MM-DD' en hora local
   }

   export function computeStreak(checkedDates: string[]): number {
     if (checkedDates.length === 0) return 0

     const sorted = [...checkedDates].sort().reverse() // descendente: más reciente primero

     const todayStr     = toLocalDateStr(new Date())
     const yesterdayStr = toLocalDateStr(new Date(new Date().setDate(new Date().getDate() - 1)))

     const mostRecent = sorted[0]
     // Período de gracia: si el check más reciente no es hoy ni ayer, la racha se rompió
     if (mostRecent !== todayStr && mostRecent !== yesterdayStr) return 0

     let streak = 1
     for (let i = 1; i < sorted.length; i++) {
       // Calcular la fecha esperada: un día antes de sorted[i-1]
       const prev = new Date(sorted[i - 1] + 'T00:00:00') // local midnight
       prev.setDate(prev.getDate() - 1)
       const expectedStr = toLocalDateStr(prev)
       if (sorted[i] === expectedStr) {
         streak++
       } else {
         break
       }
     }
     return streak
   }
   ```
2. Crear `src/components/StreakBadge.tsx`: recibe `streak: number`, renderiza `🔥 {streak}` con clase `text-green-600` cuando `streak > 0`, y `text-gray-400` cuando es 0. El ícono puede ser el carácter emoji o un SVG inline — no instalar librería adicional para un solo icono.
3. Actualizar `src/app/dashboard/page.tsx` para cargar los `checked_date` de los últimos 365 días de cada hábito añadiendo al select:
   ```ts
   .gte('check_ins.checked_date', (() => {
     const d = new Date(); d.setFullYear(d.getFullYear() - 1);
     return d.toLocaleDateString('sv')
   })())
   ```
   Calcular `computeStreak` para cada hábito y pasarlo como prop `streak` a `HabitCard`.
4. Actualizar `HabitCard` para reemplazar el placeholder textual de racha con `StreakBadge`.

### Criterio de hecho

Un hábito con check-ins en los últimos 3 días consecutivos muestra racha "3". Un hábito sin check-ins en los últimos 2 días muestra racha "0". Prueba 8 — Parte A pasa (requiere insertar check-ins de prueba directamente en el Table Editor de Supabase para configurar el estado previo).

---

## Tarea 14 — Archivar hábito: ConfirmDialog y flujo desde HabitCard

**Depende de:** Tarea 08, Tarea 10  
**ADR de referencia:** [ADR-0003](docs/adr/0003-modelo-de-datos.md), [ADR-0005](docs/adr/0005-server-actions-para-mutaciones.md)  
**Prueba manual:** [Prueba 9](docs/pruebas-manuales.md) (hábito archivado desaparece del dashboard)

**Objetivo:** crear el componente `ConfirmDialog` y el flujo completo de archivado iniciado desde `HabitCard`. El archivar usa `archiveHabit` ya existente en Tarea 08.

### Pasos

1. Crear `src/components/ConfirmDialog.tsx` como `"use client"` usando `Dialog` de shadcn/ui:
   - Props: `trigger: React.ReactNode`, `title: string`, `description: string`, `onConfirm: () => void`, `isPending?: boolean`
   - Al confirmar llama `onConfirm` y cierra el diálogo.
   - Botón de confirmación deshabilitado mientras `isPending`.
2. Agregar en `HabitCard` un botón secundario (ghost, pequeño) "Archivar". Al hacer clic abre el `ConfirmDialog`. Al confirmar, llama `archiveHabit(habit.id)` con `useTransition`. El `revalidatePath` del Server Action refresca el dashboard.

### Criterio de hecho

Prueba 9 pasa íntegramente: archivar "Leer 30 minutos" y confirmar hace que desaparezca del dashboard. En el Table Editor, la fila en `habits` tiene `archived_at` no nulo. Los registros en `check_ins` asociados siguen existiendo.

---

## Tarea 15 — Editar hábito: updateHabit y página /habits/[id]/edit

**Depende de:** Tarea 08, Tarea 09, Tarea 10  
**ADR de referencia:** [ADR-0003](docs/adr/0003-modelo-de-datos.md), [ADR-0005](docs/adr/0005-server-actions-para-mutaciones.md)

**Objetivo:** agregar `updateHabit` al Server Action de hábitos y crear la página de edición que reutiliza `HabitForm` con valores precargados, incluyendo la actualización de `habit_days` cuando cambia la frecuencia.

### Pasos

1. Agregar `updateHabit` en `src/features/habits/actions.ts`:
   ```ts
   export async function updateHabit(habitId: string, input: CreateHabitInput) {
     const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()
     if (!user) return { error: 'No autenticado.' }

     if (input.frequency === 'weekly' && (!input.daysOfWeek || input.daysOfWeek.length === 0)) {
       return { error: 'Debes seleccionar al menos un día para un hábito semanal.' }
     }

     const { error: updateError } = await supabase
       .from('habits')
       .update({
         name:        input.name,
         description: input.description ?? null,
         frequency:   input.frequency,
         category_id: input.categoryId ?? null,
       })
       .eq('id', habitId)
       .eq('user_id', user.id)

     if (updateError) return { error: 'No se pudo actualizar el hábito.' }

     // Reemplazar habit_days: borrar los existentes e insertar los nuevos
     await supabase.from('habit_days').delete().eq('habit_id', habitId)
     if (input.frequency === 'weekly' && input.daysOfWeek && input.daysOfWeek.length > 0) {
       await supabase.from('habit_days').insert(
         input.daysOfWeek.map(day => ({ habit_id: habitId, day_of_week: day }))
       )
     }

     revalidatePath('/dashboard')
     revalidatePath(`/dashboard/habits/${habitId}/edit`)
     return { data: { success: true } }
   }
   ```
2. Actualizar `HabitForm` para aceptar props opcionales `defaultValues?: CreateHabitInput & { id?: string }` y `mode: 'create' | 'edit'`. En modo edición, los campos se inicializan con `defaultValues`. El `DayPicker` recibe los días precargados desde `defaultValues.daysOfWeek`.
3. Crear `src/app/dashboard/habits/[id]/edit/page.tsx` como Server Component:
   - Carga el hábito y sus `habit_days` por ID verificando `user_id = auth.uid()`. Si no existe, llama `notFound()`.
   - Lee categorías disponibles (misma query que `/habits/new`).
   - Renderiza `HabitForm` en modo edición con `defaultValues` precargados.
4. En `HabitForm` modo edición: al enviar, llama `updateHabit(id, input)` en lugar de `createHabit`.
5. Agregar en `HabitCard` un enlace secundario (icono de lápiz o texto "Editar") que navega a `/dashboard/habits/[id]/edit`.

### Criterio de hecho

Navegar a `/dashboard/habits/[id]/edit` muestra el formulario con los valores del hábito precargados (nombre, descripción, frecuencia, días si es semanal, categoría). Cambiar la frecuencia de "Diaria" a "Semanal", seleccionar días y guardar actualiza la fila en `habits` y crea filas en `habit_days` (verificable en Table Editor). Los check-ins previos no se modifican.

---

## Tarea 16 — CategoryFilter y filtrado por categoría en el dashboard

**Depende de:** Tarea 10, Tarea 08  
**ADR de referencia:** [ADR-0003](docs/adr/0003-modelo-de-datos.md)  
**Prueba manual:** [Prueba 10](docs/pruebas-manuales.md) (filtrado por categoría)

**Objetivo:** implementar `CategoryFilter` con `CategoryChip` y filtrar los hábitos del dashboard por la categoría seleccionada. El filtro es URL-driven (query param `?category=<id>`) para que funcione como Server Component sin estado en cliente.

### Pasos

1. Crear `src/components/CategoryChip.tsx` como `"use client"`: recibe `label: string`, `href: string` e `isActive: boolean`. Renderiza un chip con fondo `indigo-600` cuando activo y borde `gray-200` cuando inactivo. Al hacer clic navega a `href` con `router.push`.
2. Crear `src/components/CategoryFilter.tsx` como `"use client"`: recibe `categories: Category[]` y `activeCategoryId: string | null`. Renderiza un `CategoryChip` por categoría + uno "Todas" que limpia el filtro. Scroll horizontal en mobile.
3. Actualizar `src/app/dashboard/page.tsx` para:
   - Leer `searchParams.category` como el `activeCategoryId`.
   - Añadir `.eq('category_id', activeCategoryId)` a la query de hábitos si `activeCategoryId` no es null.
   - Cargar las categorías que el usuario tiene asignadas en al menos un hábito activo (query sobre `habits` agrupada) para no mostrar chips vacíos.
   - Renderizar `CategoryFilter` arriba de la lista de `HabitCard`.

### Criterio de hecho

Prueba 10 pasa íntegramente: con hábitos de categorías "Deporte" y "Bienestar" visibles, hacer clic en el chip "Deporte" actualiza la URL a `?category=<id>` y el dashboard muestra únicamente los hábitos de esa categoría. Hacer clic en "Todas" limpia el filtro y muestra todos.

---

## Tarea 17 — Progreso semanal: computeWeeklyProgress y WeeklyProgress

**Depende de:** Tarea 10, Tarea 11  
**ADR de referencia:** [ADR-0003](docs/adr/0003-modelo-de-datos.md)

**Objetivo:** mostrar en `HabitCard` para hábitos semanales el porcentaje de días programados completados en la semana actual (lunes a domingo), en lugar del `StreakBadge` que aplica solo a hábitos diarios.

### Pasos

1. Crear `src/features/habits/weekly-progress.ts`:
   ```ts
   export function computeWeeklyProgress(
     checkedDates: string[],
     daysOfWeek: number[]
   ): number {
     if (daysOfWeek.length === 0) return 0

     // Calcular lunes y domingo de la semana actual en hora local
     const today = new Date()
     const dow = today.getDay() // 0=domingo, 1=lunes...
     const monday = new Date(today)
     monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
     const sunday = new Date(monday)
     sunday.setDate(monday.getDate() + 6)

     const mondayStr = monday.toLocaleDateString('sv')
     const sundayStr = sunday.toLocaleDateString('sv')

     // Días programados que caen dentro de la semana actual
     const scheduledDates: string[] = []
     for (let i = 0; i <= 6; i++) {
       const d = new Date(monday)
       d.setDate(monday.getDate() + i)
       if (daysOfWeek.includes(d.getDay())) {
         scheduledDates.push(d.toLocaleDateString('sv'))
       }
     }

     const completed = checkedDates.filter(
       d => d >= mondayStr && d <= sundayStr && scheduledDates.includes(d)
     ).length

     return scheduledDates.length === 0
       ? 0
       : Math.round((completed / scheduledDates.length) * 100)
   }
   ```
2. Crear `src/components/WeeklyProgress.tsx`: recibe `percentage: number`. Renderiza una barra de progreso (`div` con `bg-indigo-600` al ancho `${percentage}%` sobre fondo `gray-200`) y el texto `${percentage}%` a la derecha. Ancho total `100%`.
3. Actualizar el dashboard para cargar también los `checked_date` de la semana actual para hábitos semanales (la query ya trae check-ins — filtrar en memoria los de la semana).
4. Actualizar `HabitCard`: si `habit.frequency === 'weekly'`, renderizar `WeeklyProgress` en lugar de `StreakBadge`.

### Criterio de hecho

Un hábito semanal configurado para L/M/X (3 días) con 2 check-ins registrados esta semana muestra "67%" en la barra de progreso. Un hábito con todos sus días completados esta semana muestra "100%". Un hábito semanal sin ningún check-in esta semana muestra "0%".

---

## Resumen de orden y dependencias

```
T01 ──→ T02 ──→ T03 ──→ T04 ──→ T06 ──→ T07
         │                └──→ T08 ──→ T09 ──→ T10 ──→ T12
         │                      └──→ T11 ──┘     │
         └──→ T05 ──→ T07                         ├──→ T13
                                             T10  ├──→ T14
                                        T08,T09  └──→ T15
                                        T10,T08 ──→ T16
                                        T10,T11 ──→ T17
```

**Ruta crítica:** T01 → T02 → T03 → T04 → T08 → T09 → T10 → T12

Las tareas T05, T06 pueden avanzar en paralelo con T03 y T04 una vez T02 esté completa.  
T13, T14, T16 y T17 son independientes entre sí y pueden ejecutarse en paralelo después de T10.
