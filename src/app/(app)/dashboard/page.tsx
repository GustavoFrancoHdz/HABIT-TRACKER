import { createClient } from '@/lib/supabase/server'
import { logout } from '@/features/auth/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-gray-500 text-sm">Dashboard — próximamente los hábitos aparecerán aquí.</p>
      </div>
    </main>
  )
}
