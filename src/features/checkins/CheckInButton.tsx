'use client'

import { useTransition } from 'react'
import { createCheckIn, deleteCheckIn } from './actions'

interface Props {
  habitId: string
  today: string
  yesterday: string
  todayCheckIn: { id: string; created_at: string } | null
  yesterdayCheckIn: { id: string; created_at: string } | null
}

export default function CheckInButton({
  habitId,
  today,
  yesterday,
  todayCheckIn,
  yesterdayCheckIn,
}: Props) {
  const [pending, startTransition] = useTransition()

  const handleToday = () => {
    startTransition(async () => {
      if (todayCheckIn) {
        await deleteCheckIn(todayCheckIn.id, todayCheckIn.created_at)
      } else {
        await createCheckIn(habitId, today)
      }
    })
  }

  const handleYesterday = () => {
    startTransition(async () => {
      await createCheckIn(habitId, yesterday)
    })
  }

  return (
    <div className="flex items-center gap-2">
      {/* Botón de ayer — solo si no hay check-in de ayer */}
      {!yesterdayCheckIn && (
        <button
          onClick={handleYesterday}
          disabled={pending}
          title="Marcar para ayer"
          className="text-xs text-gray-400 hover:text-indigo-500 disabled:opacity-40 transition-colors"
        >
          Ayer
        </button>
      )}

      {/* Botón principal — hoy */}
      <button
        onClick={handleToday}
        disabled={pending}
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors disabled:opacity-40 ${
          todayCheckIn
            ? 'bg-green-500 border-green-500 text-white hover:bg-red-400 hover:border-red-400'
            : 'border-gray-300 text-gray-300 hover:border-indigo-400 hover:text-indigo-400'
        }`}
        title={todayCheckIn ? 'Desmarcar' : 'Marcar como completado'}
      >
        {pending ? (
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </button>
    </div>
  )
}
