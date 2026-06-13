---
name: nueva-prueba-manual
description: >
  Úsalo cuando se quiere agregar una prueba manual al plan de pruebas
  del proyecto.
---

Eres un procedimiento, no un rol. Tu trabajo es exclusivamente garantizar
formato, completitud y coherencia de una prueba manual. No ejecutas pruebas,
no decides si una prueba pasó o falló, no extiendes criterios de la spec.

## Paso 1 — Recopilar entradas

Antes de hacer cualquier otra cosa, verifica que tienes estos 4 datos.
Si falta alguno, pídelos explícitamente antes de continuar:

- **criterio**: referencia exacta al criterio de aceptación en `spec.md`
  (e.g., "Criterio 3 — El usuario puede registrar un hábito diario")
- **precondición**: estado del sistema y datos necesarios antes de ejecutar
  la prueba (usuarios existentes, hábitos creados, sesión iniciada, etc.)
- **pasos**: lista numerada de acciones del usuario, cada una con dato de
  entrada explícito cuando aplica
- **resultado esperado**: comportamiento observable en la UI al finalizar
  los pasos (texto visible, redirección a URL concreta, elemento presente
  o ausente)

## Paso 2 — Validar (rechazar si falla alguna regla)

Aplica estas reglas en orden. Si alguna falla, detente y comunica el
problema específico. No continúes hasta que el invocador lo corrija.

**Regla 1 — Un criterio por prueba**
Rechaza si el campo `criterio` referencia más de un criterio de `spec.md`.
Si la prueba cubre múltiples criterios, indica al invocador cuántas pruebas
separadas debe crear y cuál criterio corresponde a cada una.

**Regla 2 — Resultado esperado observable**
Rechaza si el resultado esperado no puede verificarse con sí/no mirando
la UI. Son inaceptables formulaciones como:
- "la app funciona bien"
- "el sistema responde correctamente"
- "no hay errores"
- "el proceso termina exitosamente"

Un resultado esperado válido describe qué texto aparece, a qué URL
redirige, qué elemento está visible o ausente, o qué valor muestra
la pantalla.

**Regla 3 — Pasos sin ambigüedad**
Rechaza si algún paso no puede ejecutarse por una persona sin contexto
previo del proyecto. Son inaceptables formulaciones como:
- "el usuario navega un poco"
- "interactúa con la pantalla principal"
- "completa el formulario"

Cada paso debe nombrar el elemento de UI con el que interactúa (botón,
campo, enlace) y, cuando hay dato de entrada, incluirlo literalmente
(no "un email válido" sino `test@example.com`).

**Regla 4 — Precondición concreta**
Rechaza si la precondición es genérica o no describe el estado mínimo
necesario. "Estar en la app" no es precondición. Una precondición válida
especifica: estado de sesión, datos preexistentes y URL o pantalla de
inicio de la prueba.

## Paso 3 — Calcular el ID correlativo

1. Lee el archivo `docs/pruebas-manuales.md` si existe.
2. Busca líneas que coincidan con el patrón `**Prueba N —` donde N es
   un número entero.
3. `id_siguiente = máximo N encontrado + 1`. Si el archivo no existe o
   no hay pruebas, `id_siguiente = 1`.

## Paso 4 — Construir el bloque de prueba

Aplica la plantilla siguiente con los datos del invocador.
No agregues secciones, no reordenes, no omitas placeholders.

```markdown
**Prueba <N> — <título conciso derivado del criterio>**

- **Criterio:** <referencia exacta a spec.md>
- **Precondición:** <estado exacto del sistema antes de ejecutar>
- **Pasos:**
  1. <Acción con dato de entrada explícito si aplica.>
  2. …
- **Resultado esperado:** <comportamiento observable en la UI>
- **Estado:** pendiente
```

La fecha no se incluye en la prueba. El estado es siempre `pendiente`
al crear; solo una persona ejecutando la prueba puede cambiarlo a
`pasada` o `fallida`.

## Paso 5 — Escribir en docs/pruebas-manuales.md

- Si el archivo no existe, créalo con este encabezado antes del bloque:

  ```markdown
  # Plan de pruebas manuales

  Generado desde `spec.md`. Una prueba por criterio de aceptación.
  No editar manualmente el ID ni el criterio referenciado.

  ---

  ```

- Si el archivo ya existe, agrega el bloque al final, precedido de `---`
  como separador.
- No modifiques pruebas existentes.

## Paso 6 — Confirmar

Informa al invocador:
- ID asignado a la prueba.
- Ruta del archivo donde se escribió.
- Si algún campo fue reformateado (e.g., criterio normalizado a la
  referencia canónica de spec.md).
