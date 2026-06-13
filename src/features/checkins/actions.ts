'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createCheckIn(habitId: string, checkedDate: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const today = new Date().toLocaleDateString('sv')
  const yesterday = new Date(Date.now() - 86_400_000).toLocaleDateString('sv')

  if (checkedDate !== today && checkedDate !== yesterday) {
    return { error: 'Solo puedes registrar check-ins de hoy o de ayer' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('check_ins')
    .insert({ habit_id: habitId, user_id: user.id, checked_date: checkedDate })

  if (error && error.code !== '23505') return { error: 'Error al registrar el check-in' }

  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteCheckIn(checkInId: string, checkInCreatedAt: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const today = new Date().toLocaleDateString('sv')
  const createdDay = new Date(checkInCreatedAt).toLocaleDateString('sv')

  if (createdDay !== today) {
    return { error: 'Solo puedes desmarcar el mismo día en que marcaste' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('check_ins')
    .delete()
    .eq('id', checkInId)
    .eq('user_id', user.id)

  if (error) return { error: 'Error al eliminar el check-in' }

  revalidatePath('/dashboard')
  return { error: null }
}
