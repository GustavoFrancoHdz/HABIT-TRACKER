'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function resolveCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  categoryId: string | null,
  newCategoryName: string | null
): Promise<string | null> {
  if (newCategoryName) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('categories')
      .insert({ user_id: userId, name: newCategoryName, is_predefined: false })
      .select('id')
      .single() as { data: { id: string } | null }
    return data?.id ?? null
  }
  return categoryId
}

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
  const rawCategoryId = (formData.get('category_id') as string) || null
  const newCategoryName = (formData.get('new_category_name') as string)?.trim() || null
  const days = formData.getAll('days').map(Number)

  if (!name) return { error: 'El nombre es obligatorio' }
  if (!frequency) return { error: 'La frecuencia es obligatoria' }
  if (frequency === 'weekly' && days.length === 0) {
    return { error: 'Selecciona al menos un día de la semana' }
  }

  const category_id = await resolveCategory(supabase, user.id, rawCategoryId, newCategoryName)

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

export async function updateHabit(
  habitId: string,
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const frequency = formData.get('frequency') as 'daily' | 'weekly'
  const rawCategoryId = (formData.get('category_id') as string) || null
  const newCategoryName = (formData.get('new_category_name') as string)?.trim() || null
  const days = formData.getAll('days').map(Number)

  if (!name) return { error: 'El nombre es obligatorio' }
  if (!frequency) return { error: 'La frecuencia es obligatoria' }
  if (frequency === 'weekly' && days.length === 0) {
    return { error: 'Selecciona al menos un día de la semana' }
  }

  const category_id = await resolveCategory(supabase, user.id, rawCategoryId, newCategoryName)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('habits')
    .update({ name, description, frequency, category_id })
    .eq('id', habitId)
    .eq('user_id', user.id)

  if (updateError) return { error: 'Error al actualizar el hábito' }

  // Reemplazar días: borrar todos y reinsertar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('habit_days').delete().eq('habit_id', habitId)

  if (frequency === 'weekly' && days.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: daysError } = await (supabase as any)
      .from('habit_days')
      .insert(days.map((day: number) => ({ habit_id: habitId, day_of_week: day })))

    if (daysError) return { error: 'Error al guardar los días del hábito' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/habits/${habitId}/edit`)
  return undefined
}

export async function archiveHabit(habitId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('habits')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', habitId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
