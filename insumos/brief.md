# Habit Tracker — Brief

## 1. El problema

Las personas que quieren construir hábitos consistentes recurren a papel, hojas de cálculo o apps de productividad genéricas. El papel no escala, las hojas de cálculo requieren demasiado setup manual, y las apps genéricas dispersan la atención en funciones irrelevantes para este caso de uso concreto.

Las apps de hábitos existentes tienden al extremo opuesto: gamificación agresiva, interfaces sobrecargadas, modelos de suscripción, o ecosistemas cerrados atados a plataformas móviles. El hueco está en una herramienta web directa que registre cumplimiento diario y semanal, muestre progreso real mediante rachas, y no se interponga en el camino del usuario.

## 2. Núcleo obligatorio

**1. Autenticación básica**
Registro e inicio de sesión con email y contraseña usando Supabase Auth. Cada usuario ve únicamente sus propios datos. Rutas protegidas redirigen al login si no hay sesión activa.

**2. Gestión de hábitos**
CRUD completo con nombre, descripción, frecuencia (diaria o semanal) y categoría. Los hábitos semanales requieren seleccionar días específicos de la semana. Al eliminar un hábito se archiva: desaparece de la vista activa pero el historial se conserva. Incluye creación desde plantillas predefinidas o desde cero.
Decisiones abiertas: ¿puede un hábito pertenecer a más de una categoría, o solo a una?

**3. Check-in diario**
El usuario marca hábitos como completados para el día actual o hasta 1 día atrás. Solo puede desmarcar un check-in el mismo día en que fue registrado. Los hábitos semanales solo aparecen disponibles para check-in en sus días configurados.
Decisiones abiertas: ¿el check-in retroactivo se registra con el mismo UI que el check-in normal, o se diferencia visualmente?

**4. Progreso y rachas**
Rachas diarias con período de gracia de 1 día antes de romperse. Progreso de hábitos semanales expresado como porcentaje de cumplimiento en el período visible. Al editar la frecuencia de un hábito, el historial anterior se preserva y el nuevo formato aplica solo desde la fecha de edición.
Decisiones abiertas: ¿qué período muestra el progreso para hábitos semanales — semana actual, mes actual, o un rango seleccionable?

**5. Categorías**
Catálogo predefinido de categorías más opción de crear categorías propias. Filtrado de hábitos activos por categoría en el dashboard principal.

## 3. Extensiones (elegir máximo 1)

| Nombre | Descripción |
|---|---|
| Dashboard de estadísticas | Vista de resumen con totales históricos, días más productivos y tendencias por categoría |
| Racha global | Indicador que agrega el rendimiento del usuario entre todos sus hábitos activos en una sola métrica |
| Notas por check-in | Campo de texto libre al registrar un check-in para anotar contexto o reflexión breve |
| Exportación CSV | Descarga del historial completo de check-ins para análisis externo |
| Modo público de perfil | URL compartible que muestra rachas y progreso de hábitos que el usuario elija hacer visibles |
| Recordatorios por email | Resumen diario o semanal enviado por email con los hábitos pendientes del día |

## 4. Restricciones técnicas

- Framework: Next.js 15 con App Router
- Base de datos y autenticación: Supabase (Postgres + Supabase Auth)
- Deploy: Vercel
- Lenguaje: TypeScript estricto
- Estilos: Tailwind CSS

## 5. Lo que NO se evalúa

- Diseño visual premium ni sistema de diseño propio
- Performance avanzada, caché o escalabilidad para muchos usuarios
- Tests automatizados (unitarios, integración, end-to-end)
- Responsive perfecto o experiencia optimizada para móvil
- Accesibilidad (a11y) más allá del comportamiento base del navegador
