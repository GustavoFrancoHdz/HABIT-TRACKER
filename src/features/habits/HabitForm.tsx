'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/supabase/database.types'

type Category = Database['public']['Tables']['categories']['Row']

const DAYS = [
  { label: 'L', value: 1 },
  { label: 'M', value: 2 },
  { label: 'X', value: 3 },
  { label: 'J', value: 4 },
  { label: 'V', value: 5 },
  { label: 'S', value: 6 },
  { label: 'D', value: 0 },
]

interface Props {
  action: (prevState: { error: string } | undefined, formData: FormData) => Promise<{ error: string } | undefined>
  categories: Category[]
  defaultFrequency?: 'daily' | 'weekly'
  defaultDays?: number[]
  defaultValues?: {
    name?: string
    description?: string
    frequency?: 'daily' | 'weekly'
    category_id?: string | null
    days?: number[]
  }
}

export default function HabitForm({ action, categories, defaultValues }: Props) {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [state, formAction, pending] = useActionState(action, undefined)

  useEffect(() => {
    if (submitted && !pending && state === undefined) {
      router.push('/dashboard')
    }
  }, [submitted, pending, state, router])

  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(
    defaultValues?.frequency ?? 'daily'
  )

  return (
    <form action={formAction} onSubmit={() => setSubmitted(true)} className="space-y-5">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{state.error}</p>
      )}

      {/* Nombre */}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Descripción */}
      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={defaultValues?.description}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Frecuencia */}
      <div className="space-y-2">
        <span className="block text-sm font-medium text-gray-700">Frecuencia <span className="text-red-500">*</span></span>
        <div className="flex gap-4">
          {(['daily', 'weekly'] as const).map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="frequency"
                value={f}
                checked={frequency === f}
                onChange={() => setFrequency(f)}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-700">{f === 'daily' ? 'Diaria' : 'Semanal'}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Días (solo weekly) */}
      {frequency === 'weekly' && (
        <div className="space-y-2">
          <span className="block text-sm font-medium text-gray-700">
            Días <span className="text-red-500">*</span>
          </span>
          <div className="flex gap-2">
            {DAYS.map((d) => (
              <label key={d.value} className="flex flex-col items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  name="days"
                  value={d.value}
                  defaultChecked={defaultValues?.days?.includes(d.value)}
                  className="sr-only peer"
                />
                <span className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-sm font-medium text-gray-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 select-none">
                  {d.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Categoría */}
      <div className="space-y-1">
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Categoría</label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={defaultValues?.category_id ?? ''}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Nueva categoría personalizada */}
      <div className="space-y-1">
        <label htmlFor="new_category_name" className="block text-sm font-medium text-gray-700">
          O crea una categoría nueva
        </label>
        <input
          id="new_category_name"
          name="new_category_name"
          type="text"
          placeholder="Ej: Trabajo, Salud mental…"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-400">Si rellenas este campo se ignora la selección de arriba.</p>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
