import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  it('renders the Spanish landing headline on the home route', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Reserva tu estancia')
  })

  it('renders the search route', () => {
    renderAt('/buscar')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Busca tu habitación')
  })

  it('shows a Spanish not-found page for unknown routes', () => {
    renderAt('/nope')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Página no encontrada')
  })

  it('renders the main navigation', () => {
    renderAt('/')
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeTruthy()
  })
})
