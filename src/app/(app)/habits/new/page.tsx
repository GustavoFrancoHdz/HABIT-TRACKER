import { createClient } from '@/lib/supabase/server'
import { createHabit } from '@/features/habits/actions'
import HabitForm from '@/features/habits/HabitForm'
import { redirect } from 'next/navigation'

export default async function NewHabitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${user.id},is_predefined.eq.true`)
    .order('name')

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">Nuevo hábito</h1>
      </header>
      <div className="max-w-lg mx-auto px-4 py-8">
        <HabitForm action={createHabit} categories={categories ?? []} />
      </div>
    </main>
  )
}
