import { fireEvent, screen, waitFor } from '@testing-library/react'
import { addDays, todayIso } from '../lib/dates'
import { renderWithProviders } from '../test/render'
import Search from './Search'
import { Route, Routes } from 'react-router-dom'

const checkIn = addDays(todayIso(), 10)
const checkOut = addDays(todayIso(), 13)

function renderSearch(query = '') {
  return renderWithProviders(
    <Routes>
      <Route path="/buscar" element={<Search />} />
    </Routes>,
    `/buscar${query}`,
  )
}

describe('Search page', () => {
  it('shows validation errors for empty dates and does not search', () => {
    renderSearch()
    fireEvent.click(screen.getByRole('button', { name: 'Buscar disponibilidad' }))
    expect(screen.getByText('Elige la fecha de entrada.')).toBeTruthy()
    expect(screen.getByText('Elige la fecha de salida.')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('rejects a check-out that is not after the check-in', () => {
    renderSearch()
    fireEvent.change(screen.getByLabelText('Entrada'), { target: { value: checkOut } })
    fireEvent.change(screen.getByLabelText('Salida'), { target: { value: checkIn } })
    fireEvent.click(screen.getByRole('button', { name: 'Buscar disponibilidad' }))
    expect(screen.getByText('La salida debe ser posterior a la entrada.')).toBeTruthy()
  })

  it('lists available rooms from the URL query', async () => {
    renderSearch(`?checkIn=${checkIn}&checkOut=${checkOut}`)
    expect(screen.getByRole('status').textContent).toContain('Buscando')
    expect(await screen.findByText('15 habitaciones disponibles')).toBeTruthy()
  })

  it('filters by room type', async () => {
    renderSearch(`?checkIn=${checkIn}&checkOut=${checkOut}&type=SUITE`)
    expect(await screen.findByText('3 habitaciones disponibles')).toBeTruthy()
    expect(screen.queryByRole('heading', { level: 3, name: 'Sencilla' })).toBeNull()
  })

  it('shows an alert for an invalid query', () => {
    renderSearch(`?checkIn=${checkOut}&checkOut=${checkIn}`)
    expect(screen.getByRole('alert').textContent).toContain('no son válidas')
  })

  it('shows the server price in a preview once a room is selected', async () => {
    renderSearch(`?checkIn=${checkIn}&checkOut=${checkOut}&type=SINGLE`)
    const button = await screen.findByRole('button', { name: 'Seleccionar habitación 101' })
    expect(screen.queryByLabelText('Resumen de precio')).toBeNull()
    fireEvent.click(button)
    await waitFor(() => expect(screen.getByLabelText('Resumen de precio')).toBeTruthy())
    const link = screen.getByRole('link', { name: 'Continuar con la reserva' })
    expect(link.getAttribute('href')).toContain(`/reservar?roomId=1&checkIn=${checkIn}&checkOut=${checkOut}`)
    expect(button.getAttribute('aria-pressed')).toBe('true')
  })
})
