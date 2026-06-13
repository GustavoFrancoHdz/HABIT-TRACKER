# Plan de Pruebas Manuales — Habit Tracker

**Basado en:** `insumos/spec-borrador.md` (criterios de aceptación 1–10)
**Fecha:** 2026-05-29

---

**Prueba 1 — Registro de nuevo usuario con email y contraseña**

- **Precondición:** El visitante no tiene cuenta. La aplicación está corriendo y el navegador muestra la página `/register`. No hay sesión activa en el navegador.
- **Pasos:**
  1. Navegar a `http://localhost:3000/register`.
  2. En el campo "Email", ingresar `prueba.habittracker@example.com`.
  3. En el campo "Contraseña", ingresar `Contraseña123!`.
  4. Hacer clic en el botón "Registrarse".
- **Resultado esperado:** La aplicación redirige al dashboard. El email o nombre del usuario aparece visible en la interfaz (barra de navegación u otro elemento). No se muestra ningún mensaje de error.

---

**Prueba 2 — Redirección al login al acceder a ruta protegida sin sesión**

- **Precondición:** No hay sesión activa en el navegador (cookies de sesión ausentes o expiradas). La aplicación está corriendo.
- **Pasos:**
  1. Abrir una ventana de incógnito (o limpiar cookies del sitio).
  2. Navegar directamente a `http://localhost:3000/dashboard`.
- **Resultado esperado:** El navegador es redirigido automáticamente a la página de login (`/login`). El dashboard no se muestra en ningún momento; la URL final corresponde a la página de login.

---

**Prueba 3 — Creación de un hábito con todos los campos requeridos**

- **Precondición:** El usuario `prueba.habittracker@example.com` está autenticado. El dashboard muestra su lista de hábitos activos (puede estar vacía).
- **Pasos:**
  1. Hacer clic en el botón "Crear hábito" en el dashboard.
  2. En el campo "Nombre", ingresar `Leer 30 minutos`.
  3. En el campo "Descripción", ingresar `Leer antes de dormir`.
  4. En el selector "Frecuencia", seleccionar `Diaria`.
  5. En el selector "Categoría", seleccionar `Salud`.
  6. Hacer clic en el botón "Guardar".
- **Resultado esperado:** El formulario se cierra. En la lista de hábitos activos del dashboard aparece una nueva entrada con el nombre `Leer 30 minutos`. No se muestra ningún mensaje de error.

---

**Prueba 4 — Hábito semanal no se guarda sin seleccionar al menos un día**

- **Precondición:** El usuario `prueba.habittracker@example.com` está autenticado. El formulario de creación de hábito está abierto.
- **Pasos:**
  1. En el campo "Nombre", ingresar `Correr en el parque`.
  2. En el selector "Frecuencia", seleccionar `Semanal`.
  3. Verificar que ningún día de la semana está seleccionado (si el formulario pre-selecciona alguno, deseleccionarlo).
  4. Hacer clic en el botón "Guardar".
- **Resultado esperado:** El formulario no se cierra. Se muestra un mensaje de validación visible en la UI indicando que se debe seleccionar al menos un día de la semana. El hábito `Correr en el parque` no aparece en la lista del dashboard.

---

**Prueba 5 — Check-in del día actual en un hábito activo**

- **Precondición:** El usuario `prueba.habittracker@example.com` está autenticado. Existe el hábito `Leer 30 minutos` con frecuencia diaria, activo y sin check-in registrado para hoy (2026-05-29).
- **Pasos:**
  1. En el dashboard, localizar el hábito `Leer 30 minutos`.
  2. Verificar que aparece como pendiente para hoy (sin marca de completado).
  3. Hacer clic en el botón o checkbox de marcar como completado junto a `Leer 30 minutos`.
- **Resultado esperado:** El hábito `Leer 30 minutos` cambia visualmente a estado completado (checkbox marcado, icono de tilde, color diferente o texto "Completado hoy"). El cambio es inmediato y visible sin necesidad de recargar la página.

---

**Prueba 6 — Desmarcar un check-in el mismo día en que fue registrado**

- **Precondición:** El usuario `prueba.habittracker@example.com` está autenticado. El hábito `Leer 30 minutos` tiene un check-in registrado hoy (2026-05-29) y aparece como completado en el dashboard.
- **Pasos:**
  1. En el dashboard, localizar el hábito `Leer 30 minutos` en estado completado.
  2. Hacer clic en el botón o checkbox de desmarcar (el mismo control usado para marcar).
- **Resultado esperado:** El hábito `Leer 30 minutos` vuelve a aparecer como pendiente (sin marca de completado). El cambio es inmediato y visible en el dashboard. No se muestra ningún mensaje de error.

---

**Prueba 7 — No es posible marcar check-in con fecha de hace 2 o más días**

- **Precondición:** El usuario `prueba.habittracker@example.com` está autenticado. La fecha actual del sistema es 2026-05-29. Existe el hábito `Leer 30 minutos` activo.
- **Pasos:**
  1. En el dashboard, localizar el hábito `Leer 30 minutos`.
  2. Intentar acceder a cualquier control o selector de fecha que permita registrar un check-in con fecha 2026-05-27 (hace 2 días) o anterior.
- **Resultado esperado:** No existe ningún control en la UI que permita seleccionar o registrar un check-in con fecha 2026-05-27 o anterior. Si existe un selector de fecha, las fechas de hace 2 o más días aparecen deshabilitadas o no seleccionables. Ninguna interacción resulta en un check-in registrado para esa fecha.

---

**Prueba 8 — Comportamiento de racha diaria con período de gracia**

- **Precondición:** El usuario `prueba.habittracker@example.com` está autenticado. El hábito `Leer 30 minutos` tiene frecuencia diaria con check-ins registrados en 2026-05-25, 2026-05-26 y 2026-05-27; sin check-in en 2026-05-28 (ayer). La fecha actual es 2026-05-29.

  *Nota: requiere configurar el estado previo de check-ins directamente en la base de datos antes de ejecutar.*

- **Pasos — Parte A (un día de falla, racha se mantiene):**
  1. Navegar al dashboard y localizar el hábito `Leer 30 minutos`.
  2. Observar el contador de racha mostrado en la UI.
- **Resultado esperado (Parte A):** El contador de racha muestra un valor mayor a cero (la racha no se rompió por fallar solo 1 día: 2026-05-28).

- **Pasos — Parte B (dos días consecutivos de falla, racha vuelve a cero):**
  1. Sin registrar check-in hoy (2026-05-29), avanzar la fecha del sistema al día siguiente (2026-05-30) o esperar a que transcurra.
  2. Ingresar al dashboard y localizar el hábito `Leer 30 minutos`.
  3. Observar el contador de racha mostrado en la UI.
- **Resultado esperado (Parte B):** El contador de racha muestra `0` (la racha se rompió por fallar 2 días consecutivos: 2026-05-28 y 2026-05-29).

---

**Prueba 9 — Archivado de hábito: desaparece de la vista activa**

- **Precondición:** El usuario `prueba.habittracker@example.com` está autenticado. El hábito `Leer 30 minutos` está activo y visible en el dashboard con al menos un check-in registrado en el historial.
- **Pasos:**
  1. En el dashboard, localizar el hábito `Leer 30 minutos`.
  2. Hacer clic en el botón "Eliminar" del hábito.
  3. Cuando aparezca el diálogo de confirmación, hacer clic en "Confirmar".
- **Resultado esperado:** El hábito `Leer 30 minutos` desaparece de la lista de hábitos activos inmediatamente. No aparece ningún control para registrar un nuevo check-in asociado a ese hábito. La UI no muestra mensajes de error.

---

**Prueba 10 — Filtrado de hábitos activos por categoría en el dashboard**

- **Precondición:** El usuario `prueba.habittracker@example.com` está autenticado. Existen al menos dos hábitos activos con categorías distintas: `Correr en el parque` (categoría `Deporte`) y `Meditar 10 minutos` (categoría `Bienestar`). Ambos son visibles en el dashboard sin ningún filtro activo.
- **Pasos:**
  1. En el dashboard, localizar el selector o menú de filtro por categoría.
  2. Seleccionar la categoría `Deporte`.
- **Resultado esperado:** El dashboard muestra únicamente el hábito `Correr en el parque`. El hábito `Meditar 10 minutos` no aparece en la lista. Si existen otros hábitos activos con categorías distintas a `Deporte`, tampoco aparecen.

---

**Prueba 11 — Login con credenciales correctas**

- **Criterio:** CA #2 — El usuario puede iniciar sesión con email y contraseña válidos.
- **Precondición:** Existe la cuenta `prueba.habittracker@example.com` con contraseña `Contraseña123!`. No hay sesión activa en el navegador. La aplicación está corriendo.
- **Pasos:**
  1. Navegar a `http://localhost:3000/login`.
  2. En el campo "Email", ingresar `prueba.habittracker@example.com`.
  3. En el campo "Contraseña", ingresar `Contraseña123!`.
  4. Hacer clic en el botón "Iniciar sesión".
- **Resultado esperado:** La aplicación redirige al dashboard (`/dashboard`). El email `prueba.habittracker@example.com` o el nombre del usuario es visible en la interfaz (barra de navegación u otro elemento). No se muestra ningún mensaje de error.
- **Estado:** pendiente

---

**Prueba 20 — Categoría personalizada aparece en el filtro del dashboard**

- **Criterio:** CA #23 — Una categoría creada por el usuario aparece disponible en el filtro del dashboard y permite filtrar los hábitos que la tienen asignada.
- **Precondición:** El usuario `prueba.habittracker@example.com` tiene sesión activa. Existe el hábito `Journaling` con frecuencia `Diaria` asignado a la categoría personalizada `Desarrollo personal` (creada por el usuario, visible en la tabla `categories` con `is_predefined = false`). El filtro de categoría del dashboard no tiene ninguna selección activa. La URL actual es `http://localhost:3000/dashboard`.
- **Pasos:**
  1. En el dashboard, localizar el selector o menú de filtro por categoría.
  2. Hacer clic en el selector para desplegar las opciones disponibles.
  3. Verificar que `Desarrollo personal` aparece en la lista de opciones junto a las categorías predefinidas.
  4. Hacer clic en `Desarrollo personal` para aplicar el filtro.
- **Resultado esperado:** Tras el paso 3, `Desarrollo personal` es visible en la lista del filtro. Tras el paso 4, el dashboard muestra únicamente el hábito `Journaling`; los hábitos con otras categorías desaparecen de la lista.
- **Estado:** pendiente

---

**Prueba 19 — Crear categoría nueva desde el formulario de hábito**

- **Criterio:** CA #20 — El usuario puede crear una categoría nueva escribiendo su nombre directamente en el campo de categoría del formulario de hábito.
- **Precondición:** El usuario `prueba.habittracker@example.com` tiene sesión activa. La URL actual es `http://localhost:3000/habits/new`. El campo "Categoría" muestra únicamente las categorías predefinidas del sistema (Salud, Deporte, Bienestar, Productividad). La categoría `Desarrollo personal` no existe en la base de datos.
- **Pasos:**
  1. En el formulario, localizar el campo "Categoría".
  2. Escribir el texto `Desarrollo personal` en ese campo.
  3. Verificar que aparece una opción para crear la nueva categoría (e.g., botón o sugerencia "Crear Desarrollo personal" o "Añadir Desarrollo personal").
  4. Hacer clic en esa opción para confirmar la creación.
  5. En el campo "Nombre", ingresar `Journaling`.
  6. En el selector "Frecuencia", seleccionar `Diaria`.
  7. Hacer clic en el botón "Guardar".
  8. Hacer clic en "Crear hábito" para abrir un nuevo formulario vacío.
  9. Hacer clic en el campo "Categoría" y observar las opciones disponibles.
- **Resultado esperado:** Tras el paso 7, el formulario se cierra y en el dashboard aparece el hábito `Journaling` con la categoría `Desarrollo personal` visible. Tras el paso 9, la categoría `Desarrollo personal` aparece en la lista de opciones del selector de categoría.
- **Estado:** pendiente

---

**Prueba 18 — Porcentaje de progreso semanal de hábito semanal**

- **Criterio:** CA #18 — El usuario ve el porcentaje de días programados completados dentro de la semana calendario actual (lunes a domingo).
- **Precondición:** El usuario `prueba.habittracker@example.com` tiene sesión activa. Existe el hábito `Yoga matutino` con frecuencia `Semanal` configurado para `Lunes`, `Miércoles` y `Viernes` (3 días programados). La semana actual es 2026-06-08 (lunes) a 2026-06-14 (domingo). Hay check-ins registrados para `2026-06-08` y `2026-06-10` (2 de 3 días completados). La URL actual es `http://localhost:3000/dashboard`.
- **Pasos:**
  1. En el dashboard, localizar el hábito `Yoga matutino`.
  2. Observar el indicador de progreso semanal asociado al hábito.
- **Resultado esperado:** El indicador de progreso semanal muestra `67%`, `2/3` o una barra de progreso equivalente al 67%. Ningún otro valor numérico es aceptable.
- **Estado:** pendiente

---

**Prueba 17 — Hábito semanal no disponible para check-in en días no configurados**

- **Criterio:** CA #15 — Un hábito semanal no aparece disponible para check-in en días que no están entre los configurados.
- **Precondición:** El usuario `prueba.habittracker@example.com` tiene sesión activa. Existe el hábito `Yoga matutino` con frecuencia `Semanal` configurado únicamente para `Lunes` y `Miércoles` (registrado en la tabla `habit_days` con `day_of_week = 1` y `day_of_week = 3`). La fecha actual del sistema es martes 2026-06-09. La URL actual es `http://localhost:3000/dashboard`.
- **Pasos:**
  1. En el dashboard, buscar visualmente el hábito `Yoga matutino` en la lista de hábitos del día.
  2. Si el hábito aparece en la lista, verificar si tiene algún botón o checkbox de check-in habilitado (con cursor activo o color normal).
- **Resultado esperado:** El hábito `Yoga matutino` no aparece en la lista de hábitos disponibles para check-in el día martes, o aparece con el control de check-in deshabilitado (gris, sin `cursor: pointer`). No es posible registrar ningún check-in para ese hábito en esa fecha.
- **Estado:** pendiente

---

**Prueba 16 — Check-in retroactivo de ayer queda registrado**

- **Criterio:** CA #13 — El usuario puede registrar un check-in con fecha de ayer si no han pasado más de 1 día calendario desde esa fecha.
- **Precondición:** El usuario `prueba.habittracker@example.com` tiene sesión activa. Existe el hábito `Leer 30 minutos` con frecuencia `Diaria`, activo y sin ningún check-in registrado para ayer (2026-06-11) ni para hoy (2026-06-12). La URL actual es `http://localhost:3000/dashboard`.
- **Pasos:**
  1. En el dashboard, localizar el hábito `Leer 30 minutos`.
  2. Verificar que existe un control (botón, enlace o indicador de día anterior) que permita registrar el check-in de ayer.
  3. Hacer clic en ese control para registrar el check-in con fecha `2026-06-11`.
  4. Ir a Supabase Dashboard → Table Editor → tabla `check_ins` y buscar registros del hábito `Leer 30 minutos`.
- **Resultado esperado:** Tras el paso 3, la UI muestra el check-in de ayer como registrado (control de ayer marcado o contador de racha incrementado). Tras el paso 4, existe un registro en `check_ins` con `checked_date = 2026-06-11` para ese hábito.
- **Estado:** pendiente

---

**Prueba 15 — No es posible desmarcar un check-in al día siguiente de haberlo creado**

- **Criterio:** CA #12 — Un check-in solo puede desmarcarse el mismo día en que fue creado; al día siguiente el control de desmarque no está disponible.
- **Precondición:** El usuario `prueba.habittracker@example.com` tiene sesión activa. Existe el hábito `Leer 30 minutos` con un check-in cuyo campo `created_at` corresponde a la fecha de ayer (insertado directamente en Supabase Dashboard → Table Editor → check_ins). La fecha actual del sistema es hoy. La URL actual es `http://localhost:3000/dashboard`.
- **Pasos:**
  1. En el dashboard, localizar el hábito `Leer 30 minutos`.
  2. Verificar si existe algún control (botón, checkbox) que muestre o represente el check-in registrado ayer.
  3. Si el control existe y parece activo, hacer clic sobre él.
  4. Verificar en Supabase Dashboard → Table Editor → tabla `check_ins` si el registro de ayer sigue presente.
- **Resultado esperado:** Tras el paso 2, el control de desmarque no existe o aparece visualmente deshabilitado (gris, sin `cursor: pointer`). Tras el paso 3, no ocurre ningún cambio de estado en la UI. Tras el paso 4, el registro de check-in de ayer sigue presente en la tabla `check_ins`.
- **Estado:** pendiente

---

**Prueba 14 — Editar frecuencia de un hábito preserva los check-ins existentes**

- **Criterio:** CA #8 — Al editar la frecuencia de un hábito, los check-ins registrados previamente se conservan.
- **Precondición:** El usuario `prueba.habittracker@example.com` tiene sesión activa. Existe el hábito `Correr en el parque` con frecuencia `Diaria` y al menos 3 check-ins registrados en fechas anteriores (insertados directamente en Supabase Dashboard → Table Editor → check_ins). La URL actual es `http://localhost:3000/habits/[id]/edit` donde `[id]` corresponde a ese hábito.
- **Pasos:**
  1. En el formulario de edición, localizar el selector "Frecuencia" que muestra el valor `Diaria`.
  2. Cambiar el selector "Frecuencia" a `Semanal`.
  3. En el selector de días de la semana que aparece, seleccionar `Lunes`.
  4. Hacer clic en el botón "Guardar".
  5. Ir a Supabase Dashboard → Table Editor → tabla `check_ins` y filtrar por el `habit_id` del hábito editado.
- **Resultado esperado:** Tras el paso 4, el formulario se cierra y el hábito `Correr en el parque` aparece en el dashboard con frecuencia `Semanal`. Tras el paso 5, los registros previos de `check_ins` del hábito siguen presentes en la tabla con sus fechas originales; ninguno fue eliminado.
- **Estado:** pendiente

---

**Prueba 13 — Seleccionar plantilla prellenar el formulario de creación**

- **Criterio:** CA #5 — Al seleccionar una plantilla, el formulario de creación se rellena con los valores predefinidos de esa plantilla.
- **Precondición:** El usuario `prueba.habittracker@example.com` tiene sesión activa. La URL actual es `http://localhost:3000/habits/new`. El formulario está vacío. Existen plantillas predefinidas visibles en la UI (e.g., "Ejercicio 30 min", "Leer", "Meditación").
- **Pasos:**
  1. En el formulario de creación, localizar la sección o selector de plantillas.
  2. Hacer clic en la plantilla "Ejercicio 30 min".
  3. Observar el valor del campo "Nombre".
  4. Observar los valores de los campos "Frecuencia" y "Categoría".
  5. Hacer clic dentro del campo "Nombre" e intentar modificar el texto.
- **Resultado esperado:** Tras el paso 2, el campo "Nombre" muestra el texto `Ejercicio 30 min`. Los campos "Frecuencia" y "Categoría" muestran los valores predefinidos de la plantilla. Tras el paso 5, el campo "Nombre" es editable y acepta cambios de texto.
- **Estado:** pendiente

---

**Prueba 12 — Logout redirige al login**

- **Criterio:** CA #3 — El usuario puede cerrar sesión y es redirigido a la página de login.
- **Precondición:** El usuario `prueba.habittracker@example.com` tiene sesión activa. La URL actual es `http://localhost:3000/dashboard`.
- **Pasos:**
  1. En el dashboard, localizar el botón o enlace "Cerrar sesión" (barra de navegación o menú de usuario).
  2. Hacer clic en "Cerrar sesión".
  3. Una vez en `/login`, abrir una nueva pestaña e intentar navegar directamente a `http://localhost:3000/dashboard`.
- **Resultado esperado:** Tras el paso 2, el navegador redirige a `/login`. Tras el paso 3, la nueva pestaña también redirige a `/login` (la sesión quedó destruida). No se muestra ningún mensaje de error.
- **Estado:** pendiente
