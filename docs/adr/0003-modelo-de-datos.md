# 0003 — Modelo de datos: esquema de tablas y cálculo de rachas

**Estado:** Aceptado  
**Fecha:** 2026-05-29

---

## Contexto

El modelo de datos es la decisión más bloqueante antes de escribir código: determina el esquema SQL, los tipos TypeScript generados y las queries de dominio. Tres sub-decisiones estaban abiertas:

1. **Categorías:** ¿puede un hábito pertenecer a una o varias categorías?
2. **Rachas:** ¿se persiste el contador o se computa desde los check-ins?
3. **Archivado:** ¿cómo se marca un hábito eliminado sin borrar su historial?

Estas decisiones son incompatibles entre sí: elegir "múltiples categorías" implica una junction table que cambia todos los queries del dashboard.

---

## Decisión

**Categoría única por hábito.** FK directa `habits.category_id → categories.id`. Un hábito pertenece a cero o una categoría.

**Racha computada en tiempo real.** No se persiste `current_streak` en la tabla `habits`. La racha se calcula desde `check_ins` ordenados por `checked_date DESC` al momento de renderizar.

**Archivado con `archived_at TIMESTAMPTZ`.** NULL significa activo. Una fecha significa archivado en ese momento. El historial de check-ins se preserva.

**Período de progreso semanal:** semana calendario actual (lunes a domingo).

### Esquema resultante

```sql
create table categories (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  is_predefined boolean not null default false,
  created_at    timestamptz not null default now()
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
  habit_id     uuid not null references habits(id) on delete cascade,
  day_of_week  smallint not null check (day_of_week between 0 and 6),
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

---

## Alternativas consideradas

### Opción A — Múltiples categorías por hábito (junction table)

Una tabla `habit_categories (habit_id, category_id)` permite que un hábito pertenezca a varias categorías simultáneamente.

**Trade-off:** Cada query del dashboard necesita un JOIN con agregación. El filtro por categoría pasa de `WHERE category_id = $1` a un EXISTS o un JOIN con GROUP BY. La spec no define ningún caso de uso que requiera múltiples categorías: el filtrado del dashboard funciona igual con una. Se descarta por complejidad sin beneficio demostrado.

### Opción B — Racha persistida en `habits.current_streak`

Guardar el contador de racha en la tabla `habits` y actualizarlo con cada check-in o un cron job nocturno. La lectura del dashboard es O(1) en lugar de O(check-ins).

**Trade-off:** Con el volumen de un usuario personal (cientos de check-ins por hábito, no millones), la diferencia de performance es imperceptible. El costo real es de consistencia: si hay un bug en la lógica de actualización del contador (por ejemplo, al desmarcar un check-in), el estado persiste en base de datos y la racha mostrada es incorrecta hasta que se detecta y corrige. Computar desde la fuente de verdad (`check_ins`) elimina este riesgo.

### Opción C — `is_archived BOOLEAN` en lugar de `archived_at TIMESTAMPTZ`

Un booleano es semánticamente más claro para el filtro `WHERE is_archived = false`.

**Trade-off:** Pierde la fecha de archivado. `archived_at` permite saber cuándo se archivó el hábito, información útil si en el futuro se quiere mostrar "archivado hace N días" o filtrar el historial por período activo. El costo de usar TIMESTAMPTZ en lugar de BOOLEAN es cero.

---

## Reglas de negocio sobre check-ins: dónde se enforcean

Dos criterios de aceptación de la spec no se pueden expresar como constraints de DB sin lógica de fecha dinámica, y se delegan íntegramente a la capa de Server Action:

- **CA #5 / CA #7 — Ventana de check-in:** Solo se puede registrar un check-in para el día actual o hasta 1 día atrás. Con 2 o más días de antigüedad la acción no está disponible. El Server Action `createCheckIn` compara `checked_date` con `now()::date` antes de insertar y retorna error si la diferencia supera 1 día.
- **CA #6 — Ventana de desmarque:** Solo se puede eliminar un check-in el mismo día en que fue creado. El Server Action `deleteCheckIn` compara `check_ins.created_at::date` con `now()::date` y rechaza la operación si no coinciden.

El esquema no tiene constraints para estas reglas. La decisión es deliberada: la app es de un solo usuario sin acceso externo a la base de datos, por lo que la validación en el servidor es suficiente. Si en el futuro hubiera acceso directo a la DB, habría que agregar constraints o policies de RLS.

---

## Consecuencias

**Positivas:**
- El esquema es plano y predecible. Las queries de dominio son directas: `WHERE archived_at IS NULL` para activos, `WHERE checked_date BETWEEN lunes AND domingo` para el progreso semanal.
- La racha computada siempre refleja el estado real de `check_ins`, sin posibilidad de desincronización.
- `archived_at` registra cuándo ocurrió el archivado sin columna adicional.

**Negativas / trade-offs aceptados:**
- Categoría única significa que un usuario no puede clasificar un hábito en dos categorías a la vez. Si el uso real revela que esta limitación frustra al usuario, migrar a junction table requiere una migración de esquema y reescribir todos los queries del dashboard.
- La racha computada en tiempo real implica una query sobre `check_ins` por cada hábito mostrado en el dashboard. Si un usuario tiene 20 hábitos activos y varios años de historial, esto puede volverse lento. Por ahora se acepta; si ocurre, se puede mitigar con un índice parcial sobre `checked_date` o con un cron que calcule rachas de forma diferida.
- Las reglas de ventana de check-in y desmarque viven solo en el servidor. Un insert directo en Supabase (dashboard de Supabase, script ad hoc) las saltea sin error.
