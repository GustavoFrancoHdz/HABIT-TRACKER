# Sistema visual — Habit Tracker

Generado por el agente `diseñador`. Fuente: `spec.md` + `AGENTS.md`.

---

## 1. Paleta de colores

| Nombre semántico | Hex | Clase Tailwind | Uso funcional |
|---|---|---|---|
| `primary` | `#4f46e5` | `indigo-600` | Botones de acción principal, check-in activo, enlaces, indicador de racha |
| `background` | `#f9fafb` | `gray-50` | Fondo de página; contraste suave sobre blanco de tarjetas |
| `text` | `#111827` | `gray-900` | Cuerpo de texto, nombres de hábitos, etiquetas de formulario |
| `error` | `#dc2626` | `red-600` | Errores de validación, acción de archivar (destructiva) |
| `success` | `#16a34a` | `green-600` | Estado completado del check-in, racha activa |

**Justificación del primary:** Indigo es reconocible como color de productividad sin ser el azul genérico de los dashboards. Tiene contraste WCAG AA sobre blanco para texto y sobre gris-50 para botones.

**Colores de apoyo implícitos en Tailwind** (no se extienden en config):
- Texto secundario: `gray-500`
- Bordes y separadores: `gray-200`
- Superficie de tarjeta: `white`
- Hover de primary: `indigo-700`

---

## 2. Tipografía

**Familia única:** Inter via `next/font/google`. Una sola familia para cuerpo y encabezados elimina decisiones de jerarquía y mantiene coherencia.

```ts
// src/app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
```

| Elemento | Clase Tailwind | Peso |
|---|---|---|
| Encabezado de página (h1) | `text-2xl` | `font-semibold` |
| Encabezado de sección (h2) | `text-xl` | `font-semibold` |
| Encabezado de tarjeta (h3) | `text-base` | `font-medium` |
| Cuerpo / descripción | `text-sm` | `font-normal` |
| Etiqueta de formulario | `text-sm` | `font-medium` |
| Metadata / timestamp | `text-xs` | `font-normal` |
| Contador de racha | `text-2xl` | `font-semibold` |

`font-bold` no se usa. `text-lg` no se usa (salto innecesario entre base y xl).

---

## 3. Espaciado

Unidad base: 4px (escala estándar de Tailwind). Se usa exclusivamente la siguiente escala:

| Token Tailwind | px | Uso |
|---|---|---|
| `1` | 4px | Gaps internos mínimos, iconos inline |
| `2` | 8px | Padding interno de badges y chips |
| `3` | 12px | Padding vertical de inputs |
| `4` | 16px | Padding de tarjetas, gap entre elementos de lista |
| `6` | 24px | Separación entre secciones dentro de una página |
| `8` | 32px | Padding horizontal de contenedor en mobile |
| `12` | 48px | Separación entre secciones mayores |
| `16` | 64px | Padding de página en desktop |

**Se evitan:** valores 5, 7, 9, 10, 11, 14 y cualquier valor mayor a 16 salvo en el layout raíz. El padding de contenedor máximo es `max-w-2xl mx-auto` — la app es de lectura vertical, no necesita ancho de pantalla completa.

---

## 4. Componentes UI

### Primitivos (desde shadcn/ui)

| Componente | Variantes | Origen |
|---|---|---|
| `Button` | `primary`, `secondary`, `destructive`, `ghost` | `[shadcn]` |
| `Input` | — | `[shadcn]` |
| `Label` | — | `[shadcn]` |
| `Badge` | `default`, `success`, `muted` | `[shadcn]` extendido |
| `Dialog` | — | `[shadcn]` |
| `Select` | — | `[shadcn]` |
| `Checkbox` | — | `[shadcn]` |
| `Form` + `FormField` + `FormMessage` | — | `[shadcn]` (react-hook-form) |

### Componentes de dominio (custom)

| Componente | Variantes | Responsabilidad |
|---|---|---|
| `HabitCard` | activo, archivado | Muestra nombre, categoría, racha y botón de check-in de un hábito |
| `CheckInButton` | pendiente, completado, deshabilitado | Toggle de marcado/desmarcado; deshabilitado si la ventana temporal expiró |
| `StreakBadge` | — | Muestra el contador de racha con ícono de fuego; usa `Badge success` |
| `WeeklyProgress` | — | Barra de progreso de cumplimiento semanal para hábitos semanales |
| `CategoryChip` | seleccionado, no-seleccionado | Chip de filtro en el dashboard; scroll horizontal en mobile |
| `CategoryFilter` | — | Contenedor de `CategoryChip` con scroll horizontal y estado de filtro activo |
| `DayPicker` | — | Selección de días de la semana para hábitos semanales (7 botones toggle) |
| `HabitForm` | crear, editar | Formulario completo de hábito: nombre, descripción, frecuencia, días, categoría |
| `PageHeader` | con acción, sin acción | Título de página + botón opcional en el extremo derecho |
| `EmptyState` | — | Mensaje + CTA cuando no hay hábitos en la vista activa |
| `ConfirmDialog` | — | Modal de confirmación para archivar un hábito; usa `Dialog` de shadcn |
| `NavBar` | — | Barra superior con nombre de la app y menú de usuario (logout) |

---

## 5. Páginas y estructura

| Ruta | Título | Componentes |
|---|---|---|
| `/login` | Iniciar sesión | `NavBar` mínimo (solo logo), `FormField` ×2 (email, password), `Button primary`, enlace a `/register` |
| `/register` | Crear cuenta | `NavBar` mínimo, `FormField` ×2 (email, password), `Button primary`, enlace a `/login` |
| `/dashboard` | Mis hábitos | `NavBar`, `PageHeader` (título + botón "Nuevo hábito"), `CategoryFilter`, lista de `HabitCard`, `EmptyState` (si no hay hábitos) |
| `/habits/new` | Nuevo hábito | `NavBar`, `PageHeader` (título + botón volver), `HabitForm` en modo crear, `Button primary` (guardar), `Button ghost` (cancelar) |
| `/habits/[id]/edit` | Editar hábito | `NavBar`, `PageHeader`, `HabitForm` en modo editar, `Button primary` (guardar), `Button destructive` (archivar) → `ConfirmDialog` |
