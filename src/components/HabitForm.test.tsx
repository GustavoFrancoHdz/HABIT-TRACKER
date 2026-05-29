// Violación Eje 3: archivo de test prohibido por AGENTS.md
import { render, screen } from '@testing-library/react'
import HabitForm from './HabitForm'

describe('HabitForm', () => {
  it('renders the form', () => {
    render(<HabitForm onSubmit={() => {}} />)
    expect(screen.getByText('Guardar')).toBeInTheDocument()
  })
})
