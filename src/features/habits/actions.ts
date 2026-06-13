'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createHabit(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const frequency = formData.get('frequency') as 'daily' | 'weekly'
  const category_id = (formData.get('category_id') as string) || null
  const days = formData.getAll('days').map(Number)

  if (!name) return { error: 'El nombre es obligatorio' }
  if (!frequency) return { error: 'La frecuencia es obligatoria' }
  if (frequency === 'weekly' && days.length === 0) {
    return { error: 'Selecciona al menos un día de la semana' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: habit, error: habitError } = await (supabase as any)
    .from('habits')
    .insert({ user_id: user.id, name, description, frequency, category_id })
    .select('id')
    .single() as { data: { id: string } | null; error: unknown }

  if (habitError || !habit) return { error: 'Error al crear el hábito' }

  if (frequency === 'weekly' && days.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: daysError } = await (supabase as any)
      .from('habit_days')
      .insert(days.map((day: number) => ({ habit_id: habit.id, day_of_week: day })))

    if (daysError) return { error: 'Error al guardar los días del hábito' }
  }

  revalidatePath('/dashboard')
  return undefined
}
