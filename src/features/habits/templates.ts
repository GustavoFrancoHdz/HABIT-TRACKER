export const TEMPLATES = [
  {
    id: 'ejercicio',
    name: 'Ejercicio',
    description: '30 minutos de actividad física',
    frequency: 'daily' as const,
    emoji: '🏃',
  },
  {
    id: 'lectura',
    name: 'Lectura',
    description: '20 minutos de lectura',
    frequency: 'daily' as const,
    emoji: '📚',
  },
  {
    id: 'meditacion',
    name: 'Meditación',
    description: '10 minutos de meditación',
    frequency: 'daily' as const,
    emoji: '🧘',
  },
  {
    id: 'agua',
    name: 'Hidratación',
    description: 'Beber 2 litros de agua',
    frequency: 'daily' as const,
    emoji: '💧',
  },
] as const

export type TemplateId = typeof TEMPLATES[number]['id']

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id) ?? null
}
