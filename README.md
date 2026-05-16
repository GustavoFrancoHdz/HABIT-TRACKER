# Pre-clase Sesión 2: Spec del Habit Tracker

> Lo que vas a hacer entre martes y jueves. Sin esto hecho, no entras a Sesión 2 el viernes.

---

## Qué vas a entregar

Un repo público en GitHub con `spec.md` commiteado. Esa spec es el primer entregable del proyecto Habit Tracker.

**Deadline:** jueves 23:59. El viernes llegas a clase con el repo listo y la spec dentro.

---

## Por qué este trabajo es asíncrono

Sesión 2 son 3 horas para hacer ADRs y arrancar el plan. Si llegamos sin spec, las 3 horas se van en discutir specs individuales y no avanzamos a arquitectura. Por eso la spec se hace en tu tiempo, antes.

En clase **vamos a criticar tu spec en público**. No es castigo. Es donde aprendes a defenderla y donde mejora. Por eso vale la pena que llegues con una versión que tú ya te creas, no con un borrador a medias.

---

## Cómo navegar este directorio

Léelo en este orden. No saltes archivos.

| # | Archivo                          | Qué es                                          | Cuándo leerlo                |
|---|----------------------------------|-------------------------------------------------|------------------------------|
| 1 | `01-que-es-una-spec.md`          | Lectura: qué es una spec y cómo se ve una buena | Primero. Antes de Claude.    |
| 2 | `02-brief-habit-tracker.md`      | El brief del proyecto: núcleo + extensiones     | Después de la lectura.       |
| 3 | `03-paso-a-paso.md`              | Los 7 pasos concretos que vas a ejecutar        | Cuando empieces a trabajar.  |
| 4 | `prompts/`                       | Los 4 prompts que vas a usar con Claude         | Cuando el paso a paso te mande |
| 5 | `checklist-viernes.md`           | Qué traer a clase                               | Jueves antes de cerrar laptop |

---

## Tiempo realista

Entre 3 y 4 horas distribuidas en 2-3 sesiones. **No lo hagas todo en una sentada.**

La spec mejora cuando duermes con ella. Lo que escribiste el martes a las 23:00 lo vas a leer el miércoles a las 19:00 y vas a encontrar 3 huecos que no veías. Eso es deseable.

**Calendario sugerido:**

| Día        | Trabajo                                                |
|------------|--------------------------------------------------------|
| Martes     | Lecturas + paso 1 (crear repo) + paso 2 (elegir extensión) |
| Miércoles  | Paso 3 (interrogar brief) + paso 4 (borrador spec)     |
| Jueves     | Paso 5 (crítica) + paso 6 (iterar) + paso 7 (commit)   |

Si lo dejas todo para jueves en la noche, lo vas a entregar mediocre. No es ahorro de tiempo, es renuncia a la calidad.

---

## Las 3 reglas del curso aplicadas a este trabajo

Recordatorio de las 3 reglas innegociables (`00-fundamentos/filosofia-y-reglas.md`):

1. **Plan antes de código.** En este caso, **spec antes de prompts**. No abres Claude hasta haber leído los archivos 1 y 2.
2. **Commits chiquitos y verificables.** Vas a hacer mínimo 2 commits en estos 3 días (scaffolding inicial + spec). No mezcles los dos en uno.
3. **Edición manual documentada.** Si en algún paso editas el spec a mano en vez de seguir el flujo de prompts, está bien — solo anótalo después en `CONTEXT.md` cuando arranque Sesión 3.

---

## Lo que NO tienes que hacer en pre-clase

Para que no pierdas tiempo:

- **No inicialices Next.js.** El scaffolding de la app es trabajo de Sesión 3. Si lo haces ahora, te vas a contaminar con decisiones técnicas antes de tener ADRs.
- **No diseñes la UI.** No abras Figma, no hagas wireframes. La spec describe comportamiento, no apariencia.
- **No escribas los ADRs.** Esos los trabajamos en clase con criterio del grupo. Si llegas con ADRs pre-escritos, vas a defender decisiones tomadas en frío.
- **No escribas código.** Repito: nada de código. Esto es pre-clase de spec, no de build.

---

## Si te atoras

**Si te atoras en la lectura:** no la entiendes porque te falta contexto. Vuelve a `00-fundamentos/` y revisa `pipeline-7-pasos.md` y `filosofia-y-reglas.md`.

**Si te atoras en un prompt:** lee `como-trabajar-con-claude.md` de fundamentos. La mayoría de los atorones de prompting se resuelven dando más contexto.

**Si te atoras en una decisión de tu spec:** decídela mal antes que no decidirla. Una decisión mal tomada se defiende y se aprende. Una decisión no tomada se improvisa en el build y rompe el proyecto.

**Si genuinamente no puedes resolver algo:** llega el viernes con la pregunta hecha, no con el problema sin tocar. "Decidí X pero no me convence, ¿qué opinan?" es trabajo. "No supe qué hacer" no lo es.

---

## El test antes de cerrar el jueves

Antes de dar tu trabajo por terminado, hazle a tu spec esta pregunta:

> Si mañana me atropella un camión y otro alumno tiene que implementar mi spec sin hablar conmigo, ¿podría hacerlo y al final yo (revisándolo desde el más allá) podría decir "sí cumple" o "no cumple" sin discutir?

Si la respuesta es sí, estás listo para el viernes.
Si la respuesta es no, todavía no.

Empieza por la lectura.
