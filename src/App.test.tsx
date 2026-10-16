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
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Descansa donde la ciudad se detiene')
  })

  it('offers two call-to-action links in the hero', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: 'Reservar ahora' }).getAttribute('href')).toBe('/buscar')
    expect(screen.getByRole('link', { name: 'Ver habitaciones' }).getAttribute('href')).toBe('#habitaciones')
  })

  it('lists the three room types in the bento section', () => {
    renderAt('/')
    for (const label of ['Suite', 'Doble', 'Sencilla']) {
      expect(screen.getByRole('heading', { level: 3, name: label })).toBeTruthy()
    }
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
