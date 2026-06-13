# SETUP — Habit Tracker

## Prerequisitos

- Node.js 20 o superior
- npm 10 o superior
- Cuenta en [Supabase](https://supabase.com) (plan gratuito es suficiente)
- Cuenta en [Vercel](https://vercel.com) (solo para deploy, no para desarrollo local)

---

## 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd habit-tracker
```

---

## 2. Instalar dependencias

```bash
npm install
```

---

## 3. Crear el proyecto en Supabase

1. Ir a [https://app.supabase.com](https://app.supabase.com) y crear un nuevo proyecto.
2. Esperar a que el proyecto termine de provisionar (~2 min).
3. Ir a **Settings → API** y copiar:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ⚠️ Desactivar confirmación de email

Para que el registro funcione en desarrollo sin flujo de email:

1. Ir a **Authentication → Providers → Email**.
2. Desactivar la opción **"Confirm email"**.
3. Guardar.

---

## 4. Configurar variables de entorno

Copiar el archivo de ejemplo y rellenar con los valores de tu proyecto Supabase:

```bash
cp .env.example .env.local
```

Editar `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
```

---

## 5. Crear el esquema de base de datos

Ejecutar el SQL de `plan.md` (tarea T03) en el **SQL Editor** de Supabase:

1. Ir a **SQL Editor** en el panel de Supabase.
2. Pegar y ejecutar el bloque SQL completo de T03 (tablas + RLS + seed de categorías predefinidas).

---

## 6. Correr en desarrollo

```bash
npm run dev
```

La app estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 7. Deploy a Vercel

1. Conectar el repositorio en [vercel.com](https://vercel.com).
2. Agregar las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) en **Settings → Environment Variables**.
3. Deploy automático en cada push a `main`.
