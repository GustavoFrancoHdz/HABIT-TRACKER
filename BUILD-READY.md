# BUILD-READY — Habit Tracker

Checklist de condiciones de arranque. Cada ítem es verificable con sí / no.
Si todos están en **sí**, el build puede empezar. Si alguno está en **no**, ese es el trabajo pendiente.

---

## 1. Spec sin huecos bloqueadores

- [ ] **CA #19 resuelta en spec.md.**
  `spec.md` línea 69 dice `[DECIDIR: ¿Qué período...]`. La decisión ya existe en `docs/adr/0003-modelo-de-datos.md` ("semana calendario actual, lunes a domingo"), pero no se trasladó de vuelta a la spec. Actualizar el CA o marcarlo como "Resuelto en ADR-0003".

- [ ] **CA #21 resuelta en spec.md.**
  `spec.md` línea 74 dice `[DECIDIR: ¿Un hábito puede pertenecer a más de una categoría?]`. La decisión ya existe en ADR-0003 ("categoría única, FK directa"), pero no se trasladó a la spec. Actualizar el CA o marcarlo como "Resuelto en ADR-0003".

- [x] **El resto de criterios de aceptación (CA #1–18, #20, #22–23) están redactados sin marcadores abiertos.**
  Verificado en `spec.md`.

- [x] **El scope "SÍ entra / NO entra" cubre todos los CAs sin contradicción.**
  Verificado: cada CA tiene correspondencia en el scope positivo o negativo de `spec.md`.

---

## 2. ADRs cerrados y consistentes con la spec

- [x] **Existen 5 ADRs y todos tienen estado "Aceptado".**
  `docs/adr/0001` a `0005`. Todos con `**Estado:** Aceptado`.

- [x] **ADR-0001 cubre la elección de framework (Next.js 15 App Router).**
  Consistente con `AGENTS.md` sección Stack.

- [x] **ADR-0002 cubre la elección de backend (Supabase).**
  Consistente con `AGENTS.md` sección Stack.

- [ ] **ADR-0003 es consistente con `plan.md` en el esquema SQL de `categories`.**
  ADR-0003 define `user_id uuid not null` en `categories`, pero `plan.md` T03 define `user_id uuid` (nullable) para admitir categorías predefinidas con `user_id = null`. Los dos documentos contradicen el mismo campo. Uno de los dos debe corregirse antes de ejecutar T03.

- [x] **ADR-0004 cubre la estrategia de autenticación (middleware centralizado).**
  Consistente con `AGENTS.md` y con `plan.md` T05.

- [x] **ADR-0005 cubre el patrón de mutaciones (Server Actions).**
  Consistente con la estructura de carpetas en `AGENTS.md` y `plan.md`.

---

## 3. Diseño coherente con los ADRs

- [x] **`docs/diseño.md` cubre los 5 dominios: paleta, tipografía, espaciado, componentes y páginas.**
  Verificado en `docs/diseño.md` secciones 1–5.

- [x] **Las páginas del diseño coinciden con las rutas definidas en `plan.md` y `spec.md`.**
  `/login`, `/register`, `/dashboard`, `/habits/new`, `/habits/[id]/edit` presentes en los tres documentos.

- [x] **Los componentes de dominio del diseño (`HabitCard`, `HabitForm`, `CheckInButton`, etc.) son consistentes con las tareas de `plan.md`.**
  Cada componente referenciado en el diseño aparece en al menos una tarea de plan.md.

- [ ] **shadcn/ui está autorizado explícitamente en `AGENTS.md`.**
  `docs/diseño.md` asume shadcn/ui como librería de primitivos. `AGENTS.md` prohíbe MUI, Chakra y Ant Design, pero no menciona shadcn. El agente reviewer sí la acepta (`.claude/agents/reviewer.md` línea 64). Añadir una línea en `AGENTS.md` sección "Stack" o "Prohibiciones" que diga explícitamente que shadcn/ui está autorizada.

---

## 4. Cada criterio de aceptación tiene su prueba manual

- [x] **CA #1** → Prueba 1 (registro de nuevo usuario).
- [ ] **CA #2** → Sin prueba. Falta: login con credenciales correctas → accede al dashboard.
- [ ] **CA #3** → Sin prueba. Falta: cerrar sesión → redirige a `/login`.
- [x] **CA #4** → Prueba 2 (redirección a login sin sesión).
- [ ] **CA #5** → Sin prueba. Falta: seleccionar plantilla → formulario precargado y editable.
- [x] **CA #6** → Prueba 3 (crear hábito con todos los campos).
- [x] **CA #7** → Prueba 4 (hábito semanal sin día seleccionado no guarda).
- [ ] **CA #8** → Sin prueba. Falta: editar frecuencia → check-ins anteriores se conservan.
- [x] **CA #9** → Prueba 9 (archivar hábito desaparece de vista activa).
- [x] **CA #10** → Prueba 5 (check-in del día actual).
- [x] **CA #11** → Prueba 6 (desmarcar check-in el mismo día).
- [ ] **CA #12** → Sin prueba. Falta: no desmarcar en día posterior al que fue marcado.
- [ ] **CA #13** → Sin prueba. Falta: check-in retroactivo de ayer → registrado.
- [x] **CA #14** → Prueba 7 (no marcar con fecha de hace 2+ días).
- [ ] **CA #15** → Sin prueba. Falta: hábito semanal no aparece en días no configurados.
- [x] **CA #16** → Prueba 8 parte A (racha diaria activa).
- [x] **CA #17** → Prueba 8 parte B (racha se rompe tras 2 días de falla).
- [ ] **CA #18** → Sin prueba. Falta: progreso semanal muestra porcentaje de cumplimiento.
- [ ] **CA #20** → Sin prueba. Falta: crear categoría personalizada desde el formulario de hábito.
- [ ] **CA #23** → Sin prueba. Falta: categoría personalizada aparece al filtrar en el dashboard.
- [x] **CA #22** → Prueba 10 (filtrado por categoría).

> CAs #19 y #21 no requieren prueba propia: son preguntas de diseño resueltas en ADR-0003, no comportamientos verificables en la UI por separado.

**Pruebas faltantes: 10 (CA #2, #3, #5, #8, #12, #13, #15, #18, #20, #23).**

---

## 5. `plan.md` con criterio de hecho por tarea

- [x] **Todas las tareas (T01–T17) tienen "Criterio de hecho" definido.**
  Verificado: cada tarea en `plan.md` cierra con su criterio o referencia a CA(s) que la validan.

- [x] **Las dependencias entre tareas están documentadas.**
  Verificado: `plan.md` sección "Secuencia de dependencias" y "Orden sugerido de ejecución".

---

## 6. `.env.example` y `SETUP.md` presentes

- [ ] **`.env.example` existe en la raíz del repositorio.**
  El archivo no existe. Debe contener como mínimo:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  ```

- [ ] **`SETUP.md` existe en la raíz del repositorio.**
  El archivo no existe. Debe cubrir como mínimo: requisitos previos, cómo clonar, cómo configurar `.env.local`, cómo levantar el proyecto en local y la advertencia de deshabilitar "Confirm email" en Supabase (mencionada en `plan.md` T01).

---

## 7. Agentes y skills con smoke-test pasado

- [x] **Agente `diseñador` presente en `.claude/agents/diseñador.md`.**
- [x] **Agente `arquitecto` presente en `.claude/agents/arquitecto.md`.**
- [x] **Agente `qa` presente en `.claude/agents/qa.md`.**
- [x] **Agente `reviewer` presente en `.claude/agents/reviewer.md`.**
- [ ] **Agente `implementer` mergeado a `develop`.**
  Existe en la rama `feat/agente-implementer` (commit `348f3fb`), smoke-test pasado en esta sesión, pero no está mergeado a `develop`.

- [x] **Skill `nuevo-adr` presente en `.claude/skills/nuevo-adr/SKILL.md`.**
- [x] **Skill `nueva-prueba-manual` presente en `.claude/skills/nueva-prueba-manual/SKILL.md`.**

---

## 8. Repositorio en gitflow con `develop` al día

- [x] **`main` y `develop` existen.**
- [x] **`develop` está por delante de `main`** (contiene todo el trabajo de preparación pre-build). No hay commits en `main` que no estén en `develop`.
- [x] **Las ramas de trabajo siguen la nomenclatura tipada** (`feat/`, `fix/`, `docs/`, `chore/`). Verificado en el log de commits.
- [x] **No hay trabajo sin commitear en ramas activas que bloquee el inicio del build.**
- [ ] **`feat/agente-implementer` está cerrada (mergeada o eliminada).**
  La rama existe localmente y en `origin` pero no está mergeada a `develop`. Resolver antes de arrancar para mantener `develop` como única fuente de verdad.

---

## Resumen

| Sección | Ítems | Listos | Pendientes |
|---|---|---|---|
| 1. Spec | 4 | 2 | 2 |
| 2. ADRs | 6 | 5 | 1 |
| 3. Diseño | 4 | 3 | 1 |
| 4. Pruebas por CA | 21 | 11 | 10 |
| 5. plan.md | 2 | 2 | 0 |
| 6. .env / SETUP | 2 | 0 | 2 |
| 7. Agentes y skills | 7 | 6 | 1 |
| 8. Gitflow | 5 | 4 | 1 |
| **Total** | **51** | **33** | **18** |

**Bloqueadores de mayor impacto (resuelven más ítems a la vez):**
1. Escribir las 10 pruebas manuales faltantes (CA #2, #3, #5, #8, #12, #13, #15, #18, #20, #23).
2. Crear `.env.example` y `SETUP.md`.
3. Cerrar los dos [DECIDIR] en `spec.md` (referencia a ADR-0003).
4. Corregir la inconsistencia `categories.user_id` entre ADR-0003 y `plan.md`.
5. Autorizar shadcn/ui en `AGENTS.md`.
6. Mergear `feat/agente-implementer` a `develop`.
