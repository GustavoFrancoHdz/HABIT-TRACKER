import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateHabit } from '@/features/habits/actions'
import HabitForm from '@/features/habits/HabitForm'
import ArchiveButton from '@/features/habits/ArchiveButton'
import Link from 'next/link'

export default async function EditHabitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: habit } = await (supabase as any)
    .from('habits')
    .select('id, name, description, frequency, category_id, archived_at, habit_days(day_of_week)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as {
      data: {
        id: string
        name: string
        description: string | null
        frequency: 'daily' | 'weekly'
        category_id: string | null
        archived_at: string | null
        habit_days: { day_of_week: number }[]
      } | null
    }

  if (!habit || habit.archived_at) notFound()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${user.id},is_predefined.eq.true`)
    .order('name')

  const boundAction = updateHabit.bind(null, id)

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">← Dashboard</Link>
        <h1 className="text-lg font-bold text-gray-900">Editar hábito</h1>
      </header>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
        <HabitForm
          action={boundAction}
          categories={categories ?? []}
          defaultValues={{
            name: habit.name,
            description: habit.description ?? undefined,
            frequency: habit.frequency,
            category_id: habit.category_id,
            days: habit.habit_days.map((d) => d.day_of_week),
          }}
        />
        <div className="border-t border-gray-200 pt-6">
          <ArchiveButton habitId={id} />
        </div>
      </div>
    </main>
  )
}
