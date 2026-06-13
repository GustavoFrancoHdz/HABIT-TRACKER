'use client'

import { useTransition } from 'react'
import { archiveHabit } from './actions'

export default function ArchiveButton({ habitId }: { habitId: string }) {
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    if (!window.confirm('¿Eliminar este hábito? El historial se conservará pero ya no aparecerá en el dashboard.')) return
    startTransition(() => archiveHabit(habitId))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="w-full rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Eliminando...' : 'Eliminar hábito'}
    </button>
  )
}
