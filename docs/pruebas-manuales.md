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
