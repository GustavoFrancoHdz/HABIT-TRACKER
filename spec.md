# Habit Tracker — Spec

## Objetivo

App web de seguimiento de hábitos personales que permite a individuos crear, organizar por categorías y registrar el cumplimiento diario o semanal de sus hábitos, visualizando su progreso mediante rachas.

---

## Scope

### SÍ entra

- Registro e inicio de sesión con email y contraseña
- CRUD de hábitos con nombre, descripción, frecuencia (diaria o semanal) y categoría
- Creación de hábitos desde plantillas predefinidas o desde cero
- Selección de días específicos de la semana al crear un hábito semanal
- Check-in diario: marcar hábitos como completados el día actual o hasta 1 día atrás
- Deshacer un check-in únicamente el mismo día en que fue marcado
- Hábitos semanales visibles solo en los días configurados, no todos los días
- Racha diaria con periodo de gracia de 1 día antes de romperse
- Progreso de hábitos semanales expresado como porcentaje de cumplimiento en el período
- Historial preservado al editar la frecuencia de un hábito; el nuevo formato aplica solo hacia adelante
- Archivado de hábitos eliminados: desaparecen de la vista activa pero sus datos históricos se conservan
- Sistema de categorías: catálogo predefinido + opción de crear categorías propias
- Filtrado de hábitos activos por categoría

### NO entra

- Notificaciones, recordatorios push, email ni SMS
- Funciones sociales: compartir hábitos, ver progreso de otros usuarios, rankings
- Recuperación o edición de hábitos archivados desde la interfaz
- Exportación de datos o reportes en PDF, CSV u otros formatos
- Registro retroactivo de check-ins con más de 1 día de antigüedad
- Integración con wearables, Apple Health, Google Fit ni servicios de terceros

---

## Criterios de aceptación

### Autenticación

1. Dado un visitante sin cuenta, cuando completa el formulario de registro con email y contraseña válidos y envía el formulario, entonces su cuenta es creada y queda autenticado en la app.
2. Dado un usuario registrado, cuando ingresa su email y contraseña correctos, entonces accede a su dashboard personal.
3. Dado un usuario autenticado, cuando hace clic en "cerrar sesión", entonces su sesión finaliza y es redirigido a la pantalla de login.
4. Dado un usuario no autenticado, cuando intenta acceder a cualquier ruta protegida de la app, entonces es redirigido al login sin ver el contenido.

### CRUD de hábitos

5. Dado un usuario autenticado, cuando selecciona una plantilla predefinida para crear un hábito, entonces el formulario de creación aparece con nombre, descripción y frecuencia precargados desde esa plantilla, y todos los campos son editables antes de guardar.
6. Dado un usuario autenticado, cuando crea un hábito personalizado completando nombre, descripción, frecuencia y categoría, entonces el hábito aparece en su lista de hábitos activos.
7. Dado un usuario creando un hábito con frecuencia semanal, cuando llega al campo de días, entonces debe seleccionar al menos un día específico de la semana antes de poder guardar el hábito.
8. Dado un hábito existente, cuando el usuario edita su frecuencia (por ejemplo, de diario a semanal), entonces todos los check-ins anteriores a la fecha de edición se conservan sin recalcular, y el nuevo formato de frecuencia aplica únicamente desde la fecha de edición en adelante.
9. Dado un usuario que elimina un hábito y confirma la acción, entonces el hábito desaparece de la vista activa y ya no acepta nuevos check-ins, pero sus datos históricos quedan archivados y no son eliminados permanentemente.

### Check-in

10. Dado un hábito activo que corresponde al día actual, cuando el usuario lo marca como completado, entonces el check-in queda registrado para la fecha de hoy.
11. Dado un hábito marcado como completado hoy, cuando el usuario lo desmarca el mismo día, entonces el check-in se elimina y el hábito vuelve a aparecer como pendiente para hoy.
12. Dado un hábito marcado como completado hoy, cuando el usuario intenta desmarcarlo en un día posterior al que fue marcado, entonces la opción de desmarcar no está disponible y el check-in permanece.
13. Dado un hábito que el usuario no marcó ayer, cuando intenta registrarlo hoy con fecha de ayer, entonces el check-in retroactivo queda registrado si no han pasado más de 1 día calendario desde esa fecha.
14. Dado un hábito sin marcar, cuando el usuario intenta registrarlo con una fecha de hace 2 o más días, entonces la acción no está disponible y no se crea ningún check-in.
15. Dado un hábito semanal configurado para días específicos, cuando el usuario ve su lista de hábitos en un día que no está entre los configurados, entonces ese hábito no aparece disponible para check-in ese día.

### Vista de progreso y racha

16. Dado un hábito diario, cuando el usuario consulta su progreso, entonces ve el número de días consecutivos completados que conforman su racha actual.
17. Dado un hábito diario con racha activa, cuando el usuario falla exactamente 1 día, entonces la racha se mantiene (período de gracia). Cuando falla un segundo día consecutivo, entonces la racha se rompe y el contador vuelve a cero.
18. Dado un hábito semanal, cuando el usuario consulta su progreso, entonces ve el porcentaje de días programados que completó dentro del período visualizado.
19. Dado un hábito semanal, cuando el usuario consulta su progreso, entonces el período visualizado es la semana calendario actual (lunes a domingo). *(Decidido en ADR-0003)*

### Categorías

20. Dado un usuario creando o editando un hábito, cuando llega al campo de categoría, entonces puede elegir una del catálogo predefinido o escribir el nombre de una categoría nueva para crearla.
21. Un hábito pertenece a cero o una categoría (FK directa). Las categorías funcionan como carpetas, no como etiquetas. *(Decidido en ADR-0003)*
22. Dado un usuario en su dashboard con hábitos de distintas categorías, cuando selecciona filtrar por una categoría específica, entonces la lista muestra únicamente los hábitos activos que pertenecen a esa categoría.
23. Dado un usuario que creó una categoría personalizada, cuando asigna esa categoría a un hábito y guarda, entonces el hábito aparece listado bajo esa categoría al filtrar.

---

## No-goals

- **Notificaciones y recordatorios:** la app no enviará alertas push, email ni SMS. El usuario es responsable de recordar por su cuenta.
- **Funciones sociales:** no existe perfil público, compartir hábitos, ver el progreso de otros ni ningún componente comunitario o competitivo.
- **Recuperación de hábitos archivados:** los hábitos eliminados no son recuperables desde la interfaz. El archivado solo preserva el historial para integridad de datos.
- **Retroactividad mayor a 1 día:** no es posible registrar check-ins con más de 1 día de antigüedad. Los días anteriores sin marcar quedan permanentemente como no completados.
- **Exportación de datos:** no hay generación de reportes en ningún formato ni exportación del historial.
- **Integración con servicios externos:** la app no se conecta con wearables, plataformas de salud ni ningún API de terceros.
