import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createHabit } from '@/features/habits/actions'
import HabitForm from '@/features/habits/HabitForm'
import { TEMPLATES, getTemplate } from '@/features/habits/templates'

export default async function NewHabitPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>
}) {
  const { template: templateId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${user.id},is_predefined.eq.true`)
    .order('name')

  const selectedTemplate = templateId ? getTemplate(templateId) : null

  // Si hay template o el usuario eligió "desde cero" (template=scratch), mostrar el form
  const showForm = templateId !== undefined

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        {showForm ? (
          <Link href="/habits/new" className="text-sm text-indigo-600 hover:underline">← Plantillas</Link>
        ) : (
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">← Dashboard</Link>
        )}
        <h1 className="text-lg font-bold text-gray-900">Nuevo hábito</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {showForm ? (
          <HabitForm
            action={createHabit}
            categories={categories ?? []}
            defaultValues={selectedTemplate ? {
              name: selectedTemplate.name,
              description: selectedTemplate.description,
              frequency: selectedTemplate.frequency,
            } : undefined}
          />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Elige una plantilla o empieza desde cero.</p>

            <ul className="space-y-3">
              {TEMPLATES.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/habits/new?template=${t.id}`}
                    className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm hover:border-indigo-400 transition-colors"
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-400 truncate">{t.description}</p>
                    </div>
                    <span className="text-xs text-gray-400">{t.frequency === 'daily' ? 'Diaria' : 'Semanal'}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/habits/new?template=scratch"
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              + Crear desde cero
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
