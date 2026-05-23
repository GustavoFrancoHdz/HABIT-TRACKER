# Habit Tracker — Spec

## Objetivo

App web para que individuos registren el cumplimiento diario o semanal de sus hábitos y visualicen su progreso mediante rachas.

---

## Scope

### SÍ entra

- Registro e inicio de sesión con email y contraseña
- CRUD de hábitos con nombre, descripción, frecuencia (diaria o semanal) y categoría
- Creación de hábitos desde plantillas predefinidas o desde cero
- Hábitos semanales configurados para días específicos de la semana
- Check-in del día actual o hasta 1 día atrás; desmarcar solo el mismo día en que se marcó
- Racha diaria con período de gracia de 1 día antes de romperse
- Progreso de hábitos semanales expresado como porcentaje de cumplimiento
- Categorías predefinidas y personalizadas; filtrado por categoría en el dashboard
- Archivado de hábitos al eliminar: desaparecen de la vista activa, historial preservado

### NO entra

- Notificaciones ni recordatorios de ningún tipo
- Funciones sociales ni perfil público
- Registro retroactivo con más de 1 día de antigüedad
- Exportación de datos en ningún formato

---

## Criterios de aceptación

1. Dado un visitante sin cuenta, cuando se registra con email y contraseña válidos, su cuenta es creada y queda autenticado.
2. Dado un usuario sin sesión activa, cuando intenta acceder a una ruta protegida, es redirigido al login.
3. Dado un usuario autenticado, cuando crea un hábito completando todos los campos requeridos, el hábito aparece en su lista activa.
4. Dado un hábito con frecuencia semanal, cuando se intenta guardar sin seleccionar al menos un día, el guardado no procede.
5. Dado un hábito activo que corresponde al día actual, cuando el usuario lo marca, el check-in queda registrado para hoy.
6. Dado un check-in registrado hoy, cuando el usuario lo desmarca el mismo día, el hábito vuelve a aparecer como pendiente.
7. Dado un hábito activo, cuando el usuario intenta marcarlo con fecha de hace 2 o más días, la acción no está disponible.
8. Dado un hábito diario con racha activa, cuando falla 1 día, la racha se mantiene; cuando falla 2 días consecutivos, el contador vuelve a cero.
9. Dado un usuario que elimina un hábito y confirma, el hábito desaparece de la vista activa y no acepta nuevos check-ins, pero el historial se conserva.
10. Dado un usuario en el dashboard, cuando filtra por una categoría, solo se muestran los hábitos activos de esa categoría.

---

## No-goals

- Diseño visual premium ni sistema de diseño propio
- Tests automatizados (unitarios, integración, e2e)
- Performance avanzada o escalabilidad para muchos usuarios
- Accesibilidad (a11y) más allá del comportamiento base del navegador
