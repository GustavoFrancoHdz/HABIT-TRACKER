// Violación Eje 1: tipo de dominio inline (debería ir en src/types/)
interface HabitData {
  id: string
  name: string
  frequency: 'daily' | 'weekly'
  category: string
  completedDays: string[]
}

// Violación Eje 1: export default fuera de page.tsx/layout.tsx
export default function HabitForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  // Violación Eje 1: any sin comentario justificativo

  // Violación Eje 2: lógica de negocio en components/ en lugar de features/
  async function handleSubmit(formData: FormData) {
    const name = formData.get('name') as string
    const frequency = formData.get('frequency') as string

    // Violación Eje 2: acceso directo a Supabase sin usar src/lib/supabase/
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.from('habits').insert({ name, frequency })
  }

  return (
    <form action={handleSubmit}>
      <input name="name" placeholder="Nombre del hábito" />
      <select name="frequency">
        <option value="daily">Diario</option>
        <option value="weekly">Semanal</option>
        {/* Violación Eje 4: la spec dice frecuencias diaria/semanal, pero agrega 'mensual' que NO entra */}
        <option value="monthly">Mensual</option>
      </select>
      <button type="submit">Guardar</button>
    </form>
  )
}
