import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/features/auth/actions'
import CheckInButton from '@/features/checkins/CheckInButton'
import { computeStreak } from '@/lib/streak'

type Habit = {
  id: string
  name: string
  description: string | null
  frequency: 'daily' | 'weekly'
  habit_days: { day_of_week: number }[]
}

type CheckIn = { id: string; habit_id: string; checked_date: string; created_at: string }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const today = now.toLocaleDateString('sv')
  const yesterday = new Date(now.getTime() - 86_400_000).toLocaleDateString('sv')
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86_400_000).toLocaleDateString('sv')
  const todayDow = now.getDay()

  // Query 1: hábitos activos con sus días configurados
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: habits } = await (supabase as any)
    .from('habits')
    .select('id, name, description, frequency, habit_days(day_of_week)')
    .eq('user_id', user!.id)
    .is('archived_at', null)
    .order('created_at', { ascending: true }) as { data: Habit[] | null }

  // Query 2: check-ins de hoy y ayer (para el botón)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recentCIs } = await (supabase as any)
    .from('check_ins')
    .select('id, habit_id, checked_date, created_at')
    .eq('user_id', user!.id)
    .in('checked_date', [today, yesterday]) as { data: CheckIn[] | null }

  // Query 3: check-ins de 60 días para calcular rachas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: streakCIs } = await (supabase as any)
    .from('check_ins')
    .select('habit_id, checked_date')
    .eq('user_id', user!.id)
    .gte('checked_date', sixtyDaysAgo) as { data: { habit_id: string; checked_date: string }[] | null }

  // Agrupar check-ins por hábito para calcular racha
  const datesByHabit = new Map<string, string[]>()
  for (const ci of streakCIs ?? []) {
    const arr = datesByHabit.get(ci.habit_id) ?? []
    arr.push(ci.checked_date)
    datesByHabit.set(ci.habit_id, arr)
  }

  const visibleHabits = (habits ?? []).filter((h) => {
    if (h.frequency === 'daily') return true
    return h.habit_days.some((d) => d.day_of_week === todayDow)
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Habit Tracker</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <form action={logout}>
            <button type="submit" className="text-sm text-red-600 hover:underline">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Hábitos de hoy</h2>
          <Link
            href="/habits/new"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Crear hábito
          </Link>
        </div>

        {visibleHabits.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            No tienes hábitos para hoy.{' '}
            <Link href="/habits/new" className="text-indigo-600 hover:underline">Crea uno</Link>.
          </p>
        ) : (
          <ul className="space-y-3">
            {visibleHabits.map((h) => {
              const todayCI = recentCIs?.find((ci) => ci.habit_id === h.id && ci.checked_date === today) ?? null
              const yesterdayCI = recentCIs?.find((ci) => ci.habit_id === h.id && ci.checked_date === yesterday) ?? null
              const streak = computeStreak(datesByHabit.get(h.id) ?? [])
              const done = !!todayCI

              return (
                <li
                  key={h.id}
                  className={`bg-white rounded-lg border px-4 py-3 flex items-center justify-between shadow-sm transition-colors ${done ? 'border-green-200' : 'border-gray-200'}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {h.name}
                    </p>
                    {h.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{h.description}</p>
                    )}
                    {streak > 0 && (
                      <p className="text-xs text-orange-500 mt-0.5 font-medium">🔥 {streak} día{streak !== 1 ? 's' : ''} de racha</p>
                    )}
                  </div>
                  <CheckInButton
                    habitId={h.id}
                    today={today}
                    yesterday={yesterday}
                    todayCheckIn={todayCI}
                    yesterdayCheckIn={yesterdayCI}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
