# SETUP — Prerrequisitos antes de ejecutar la Tarea 01

Sigue estos pasos en orden. Al final encontrarás un checklist; la Tarea 01
del plan solo puede iniciarse cuando todas las casillas estén marcadas.

---

## 1. Software local

| Herramienta | Versión mínima | Verificar |
|-------------|---------------|-----------|
| Node.js | 20 LTS | `node -v` |
| npm | 10 | `npm -v` |
| Git | cualquiera reciente | `git -v` |

Node 20 LTS es el mínimo para `create-next-app@latest` con Next.js 15.
Puedes usar `nvm` o `fnm` para manejar versiones si ya tienes otra instalada.

---

## 2. Crear el proyecto Supabase de desarrollo

1. Ve a [supabase.com](https://supabase.com) e inicia sesión (o crea una cuenta gratuita).
2. Haz clic en **New project**.
3. Nombre sugerido: `habit-tracker-dev`.
4. Elige la región más cercana a tu ubicación.
5. Anota (o guarda en un gestor de contraseñas) la **Database Password** que Supabase genera — la necesitarás si alguna vez conectas un cliente Postgres directamente.
6. Espera a que el proyecto termine de aprovisionarse (~60 segundos).

---

## 3. Obtener las credenciales del proyecto dev

Una vez creado el proyecto:

1. En el panel izquierdo, ve a **Settings → API**.
2. Copia los siguientes valores:

| Variable en `.env.local` | Dónde está en el dashboard |
|--------------------------|---------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sección "Project URL" → campo **URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sección "Project API keys" → fila **anon / public** |

3. Copia `.env.example` a `.env.local` en la raíz del proyecto y pega los valores:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

> **Nota sobre la `service_role` key:** no la copies a `.env.local` ni la uses
> en la app. Es una clave de administrador sin RLS. Solo se usa desde la CLI de
> Supabase o desde scripts de server que nunca llegan al cliente.

---

## 4. Desactivar confirmación de email (proyecto dev)

**Este paso es obligatorio antes de la Prueba 1 de autenticación.** Sin él,
`signUp` deja al usuario en estado pendiente y la app nunca redirige al
dashboard.

1. En el dashboard del proyecto dev, ve a **Authentication → Settings**.
2. En la sección "Email Auth", desactiva **Enable email confirmations**.
3. Guarda los cambios.

---

## 5. Crear el proyecto Supabase de producción

Repite los pasos 2 y 3 para un segundo proyecto:

- Nombre sugerido: `habit-tracker-prod`.
- Guarda las credenciales de prod en tu gestor de contraseñas — se configurarán
  en Vercel (no en `.env.local`) cuando llegue el momento del deploy.
- **No** configures prod en `.env.local`; ese archivo es exclusivo del entorno local.

> El proyecto prod puede crearse ahora o cuando llegues al deploy en Vercel.
> Lo importante es tenerlo listo antes de necesitar el `project-ref` de prod
> para la CLI de Supabase.

---

## 6. Nota de la CLI de Supabase (Tarea 04)

La Tarea 04 del plan usa la CLI de Supabase para generar tipos TypeScript desde
el esquema real. No necesitas instalarla ahora, pero sí tener a mano el
**Reference ID** del proyecto dev:

- Dashboard → **Settings → General → Reference ID**
- Formato: cadena alfanumérica de 20 caracteres, p. ej. `abcdefghijklmnopqrst`

Guárdalo junto a las credenciales; lo usarás en `npx supabase link --project-ref <ref>`.

---

## 7. Servicios externos — extensión del núcleo

El núcleo de Habit Tracker (spec actual) no usa APIs de terceros. Si la
extensión que estás desarrollando requiere llaves externas:

1. Crea la cuenta en el servicio correspondiente.
2. Genera las credenciales necesarias (API key, secret, etc.).
3. Agrega cada variable a `.env.example` con un comentario que indique de dónde
   obtenerla, y cópiala también a tu `.env.local`.

---

## Checklist — La Tarea 01 puede ejecutarse cuando todo esto esté listo

- [ ] Node.js 20 LTS instalado y `node -v` muestra versión 20.x
- [ ] npm instalado y `npm -v` muestra versión 10.x
- [ ] Git instalado
- [ ] Proyecto Supabase **dev** creado en supabase.com
- [ ] `NEXT_PUBLIC_SUPABASE_URL` copiado al `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` copiado al `.env.local`
- [ ] **Email confirmations desactivado** en el proyecto dev (Auth → Settings)
- [ ] Proyecto Supabase **prod** creado (o agendado para antes del deploy)
- [ ] Reference ID del proyecto dev anotado (para la Tarea 04)
- [ ] Llaves de servicios externos de la extensión agregadas a `.env.local` (si aplica)
