# ADR-003: Modelo de datos

- **Estado:** Aceptado
- **Fecha:** 2026-05-29

## Contexto

La aplicación necesita persistir hábitos, check-ins, categorías y rachas de un único usuario autenticado. Las decisiones de esquema son bloqueantes para el build: afectan las queries, la RLS de Supabase y la forma de los tipos TypeScript generados.

## Decisiones tomadas en conjunto

### Categoría única por hábito

Cada hábito pertenece a exactamente una categoría. La alternativa (múltiples categorías via junction table) añade JOINs en cada query del dashboard sin un caso de uso que lo justifique.

### Racha computada en tiempo real

La racha actual no se persiste en `habits`. Se calcula desde `check_ins` al renderizar. Con el volumen de un usuario personal (centenares de check-ins), el costo de la query es despreciable y se elimina el riesgo de desincronización por bugs en la lógica de actualización.

### Archivado suave con `archived_at`

Un hábito eliminado no se borra físicamente. Se marca con `archived_at TIMESTAMPTZ`. Valor NULL significa activo. Esto preserva el historial de check-ins y registra cuándo se archivó.

### Período de progreso semanal: semana calendario

El progreso de hábitos semanales se calcula sobre la semana calendario actual (lunes a domingo). No es un rolling de 7 días ni el mes completo.

## Esquema de tablas

```sql
-- Gestionada por Supabase Auth
-- auth.users (id uuid)

create table categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  is_predefined boolean not null default false,
  created_at  timestamptz not null default now()
);

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

-- Solo para hábitos con frequency = 'weekly'
create table habit_days (
  habit_id    uuid not null references habits(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = lunes
  primary key (habit_id, day_of_week)
);

create table check_ins (
  id           uuid primary key default gen_random_uuid(),
  habit_id     uuid not null references habits(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  checked_date date not null,
  created_at   timestamptz not null default now(),
  unique (habit_id, checked_date)
);
```

## Row Level Security

Todas las tablas tienen RLS habilitado. La política base en cada tabla:

```sql
-- Ejemplo para habits; se replica en categories, habit_days, check_ins
alter table habits enable row level security;

create policy "Usuario accede solo a sus propios hábitos"
  on habits for all
  using (user_id = auth.uid());
```

`habit_days` no tiene `user_id` propio; su aislamiento viene del CASCADE desde `habits` y de que el join siempre pasa por `habits.user_id = auth.uid()`.

## Consecuencias

- Los tipos TypeScript se generan con `supabase gen types typescript` desde el esquema de producción.
- `archived_at IS NULL` es el filtro estándar para "hábitos activos" en todas las queries.
- La racha se calcula con una función que recorre `check_ins` ordenados por `checked_date DESC` para el `habit_id` dado, aplicando la lógica de período de gracia de 1 día.
- El progreso semanal se calcula con `COUNT(check_ins)` donde `checked_date` está entre el lunes y el domingo de la semana actual.
