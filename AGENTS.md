# AGENTS.md — Contrato de proyecto

Fuente de verdad para todos los agentes y developers de este repositorio.
Las decisiones documentadas aquí están cerradas. Las que no aparecen están abiertas.

---

## Stack

- Framework: Next.js 15, App Router exclusivamente (sin Pages Router)
- Base de datos y autenticación: Supabase (Postgres + Supabase Auth)
- Deploy: Vercel
- Lenguaje: TypeScript 5 con `strict: true`
- Estilos: Tailwind CSS

---

## Convenciones de TypeScript

- `strict: true` en `tsconfig.json`. No se relaja bajo ninguna circunstancia.
- `any` está prohibido sin un comentario que justifique la excepción en la misma línea.
- Tipos de dominio van en `src/types/`. No se definen inline en componentes si se reutilizan.
- `interface` para contratos de objeto; `type` para uniones y aliases.
- Exports nombrados siempre. `export default` solo en archivos `page.tsx` y `layout.tsx`.

---

## Estructura de carpetas

```
src/
  app/           # Rutas y layouts (App Router)
  components/    # Componentes reutilizables sin lógica de negocio
  features/      # Módulos por dominio: auth, habits, checkins, categories
  lib/
    supabase/    # createServerClient (server.ts), createBrowserClient (client.ts), middleware (middleware.ts)
                 # utilidades genéricas en lib/ directamente
  types/         # Interfaces y tipos compartidos
  hooks/         # React hooks reutilizables
insumos/         # Documentos de referencia: brief, specs de entrada
docs/            # Specs técnicas y decisiones generadas por agentes
```

Cada carpeta dentro de `features/` contiene sus propios componentes, hooks y server actions.

---

## Política de commits

- Un commit por unidad funcional. No se mezclan cambios no relacionados en un mismo commit.
- Formato: `<tipo>(<scope>): <descripción en infinitivo, minúsculas>`
- Tipos válidos: `feat`, `fix`, `docs`, `chore`, `refactor`
- Ejemplos correctos:
  - `feat(habits): agregar formulario de creación`
  - `fix(auth): corregir redirección tras expiración de sesión`
  - `docs(agents): crear contrato de proyecto`

---

## Flujo git (gitflow)

- `main`: siempre estable y desplegable. Solo recibe merges desde `develop`.
- `develop`: rama de integración. Todo el trabajo aterriza aquí antes de ir a `main`.
- Ramas de trabajo: se crean desde `develop`, tipadas según el cambio:
  - `feat/<nombre>` — funcionalidades nuevas
  - `fix/<nombre>` — correcciones de errores
  - `docs/<nombre>` — documentación
  - `chore/<nombre>` — configuración, scaffolding, mantenimiento
- Flujo obligatorio: `develop` → rama tipada → trabajo → merge a `develop`.
- Ningún trabajo se hace directo en `main` ni en `develop`.
- Nada queda sin commitear. Todo cambio va en su rama correspondiente.

---

## Regla de CONTEXT.md

Toda edición manual de código (no generada por un agente) se documenta en `CONTEXT.md` en la raíz.
Cada entrada debe indicar: archivo modificado, líneas afectadas y justificación de la decisión.
Sin esta entrada, la edición se considera no trazable y puede revertirse.

---

## Prohibiciones explícitas

- Usar `any` sin justificación comentada en la misma línea.
- Instalar librerías de componentes pesadas: Material UI, Chakra UI, Ant Design.
- Escribir tests automatizados: unitarios, de integración o end-to-end (fuera del alcance).
- Generar código de implementación sin plan aprobado previamente.
- Commits que mezclen más de una unidad funcional.
- Trabajar directamente sobre `main` o `develop`.
