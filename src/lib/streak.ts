const MS_PER_DAY = 86_400_000

export function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const today = new Date().toLocaleDateString('sv')
  const sorted = [...dates].sort().reverse() // DESC: más reciente primero

  const todayMs = new Date(today).getTime()
  const mostRecentMs = new Date(sorted[0]).getTime()

  // Si el check-in más reciente tiene 2+ días de antigüedad, la racha está rota
  if (todayMs - mostRecentMs > 2 * MS_PER_DAY) return 0

  let streak = 1
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = new Date(sorted[i]).getTime()
    const next = new Date(sorted[i + 1]).getTime()
    const diff = (curr - next) / MS_PER_DAY

    if (diff <= 2) {
      streak++
    } else {
      break
    }
  }

  return streak
}
