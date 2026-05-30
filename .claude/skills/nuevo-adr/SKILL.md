---
name: nuevo-adr
description: >
  Úsalo cuando se quiere registrar una nueva decisión arquitectónica
  del proyecto. Recibe el contenido de la decisión y produce un archivo
  ADR numerado en docs/adr/ con formato estandarizado y completitud
  verificada.
---

Eres un procedimiento, no un rol. Tu trabajo es exclusivamente garantizar
formato y completitud. No propones decisiones, no juzgas si la decisión
es buena, no editas ADRs existentes.

## Paso 1 — Recopilar entradas

Antes de hacer cualquier otra cosa, verifica que tienes estos 5 datos.
Si falta alguno, pídelos explícitamente antes de continuar:

- **título**: frase corta que nombra la decisión (no el problema)
- **contexto**: por qué esta decisión es necesaria ahora
- **decisión**: qué se decide, en una oración directa
- **alternativas**: mínimo 1 alternativa real con trade-off explícito
- **consecuencias**: al menos 1 positiva y 1 negativa o trade-off aceptado

## Paso 2 — Validar (rechazar si falla alguna regla)

Aplica estas reglas en orden. Si alguna falla, detente y comunica el
problema específico. No continúes hasta que el invocador lo corrija.

**Regla 1 — Alternativa real**
Rechaza si la única "alternativa" es "no hacer nada", "mantener el estado
actual" o cualquier formulación que no nombre una tecnología, patrón o
enfoque técnico concreto distinto a la decisión elegida.

**Regla 2 — Trade-off explícito**
Rechaza si alguna alternativa no tiene trade-off. Un trade-off vacío es
cualquier enunciado que diga "es más simple" o "es más rápido" sin
especificar qué componente del stack se ve afectado y de qué forma
observable.

**Regla 3 — Consecuencia negativa**
Rechaza si las consecuencias no incluyen ninguna negativa ni trade-off
aceptado. Un ADR sin costo explícito no está completo.

**Regla 4 — Contexto no genérico**
Rechaza si el contexto es una descripción abstracta del problema sin
referencia concreta al proyecto (spec.md, un ADR existente, una
restricción del stack en AGENTS.md). El contexto debe anclar la decisión
a este proyecto.

## Paso 3 — Calcular el número del ADR

1. Lee los archivos en `docs/adr/` cuyos nombres empiezan con dígitos.
2. Extrae el número del prefijo de cada nombre (ej. `0003-` → `3`).
3. `número_siguiente = máximo encontrado + 1`. Si no hay archivos, `número_siguiente = 1`.
4. Formatea con zero-padding a 4 dígitos: `0001`, `0002`, etc.

## Paso 4 — Construir el archivo

Aplica la plantilla siguiente con los datos del invocador.
No agregues secciones, no reordenes, no omitas placeholders.

```markdown
# <NNNN> — <Título>

**Estado:** <propuesto | aceptado | deprecado>
**Fecha:** <YYYY-MM-DD>

---

## Contexto

<Por qué esta decisión es necesaria ahora. Hechos del proyecto,
restricciones o tensiones reales derivadas de spec.md, AGENTS.md
o ADRs existentes. Sin opiniones.>

---

## Decisión

<Qué se decide, en una oración directa y afirmativa.>

<Razonamiento técnico que justifica la elección.>

---

## Alternativas consideradas

### Opción A — <nombre>

<Descripción breve del enfoque.>

**Trade-off:** A cambio de <beneficio concreto>, esta opción requiere
<costo o restricción concreta en términos del stack del proyecto>.

[Repetir bloque para cada alternativa adicional.]

---

## Consecuencias

**Positivas:**
- <Beneficio observable.>

**Negativas / trade-offs aceptados:**
- <Costo real. Sin minimizar.>
```

Si el invocador no especificó `estado`, usa `propuesto`.
La fecha es siempre la fecha actual en formato `YYYY-MM-DD`.

## Paso 5 — Calcular la ruta y escribir

- slug = título en kebab-case, sin tildes, sin caracteres especiales, en minúsculas.
- Ruta: `docs/adr/<NNNN>-<slug>.md`
- Verifica que esa ruta no exista. Si existe, detente y pide revisión manual.
- Escribe el archivo.

## Paso 6 — Confirmar

Informa al invocador:
- Ruta exacta del archivo creado.
- Número asignado.
- Si hubo algún campo ajustado por formato (tildes removidas del slug, etc.).
