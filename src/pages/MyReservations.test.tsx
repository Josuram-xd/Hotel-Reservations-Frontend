import { screen } from '@testing-library/react'
import { beforeEach } from 'vitest'
import App from '../App'
import { createMockApi } from '../api/mock'
import { clearToken, setToken } from '../api/session'
import { addDays, todayIso } from '../lib/dates'
import { renderWithProviders } from '../test/render'

const checkIn = addDays(todayIso(), 10)
const checkOut = addDays(todayIso(), 12)
const guest = { fullName: 'Ana Perez', email: 'ana@example.com', phone: '3001234567', document: '123' }

async function setup() {
  const api = createMockApi()
  const { token } = await api.register({ fullName: 'Ana Perez', email: 'ana@example.com', password: 'password1' })
  setToken(token)
  return { api }
}

beforeEach(() => clearToken())

describe('My reservations page', () => {
  it('shows an empty state with a link to search rooms', async () => {
    const { api } = await setup()
    renderWithProviders(<App />, '/mis-reservas', api)

    expect(await screen.findByText('Todavía no tienes reservas.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Buscar habitaciones' }).getAttribute('href')).toBe('/buscar')
  })

  it('lists the reservations with their code, status and a link to manage them', async () => {
    const { api } = await setup()
    const reservation = await api.createReservation({ roomId: 13, checkIn, checkOut, guest })
    renderWithProviders(<App />, '/mis-reservas', api)

    expect(await screen.findByText(reservation.id)).toBeTruthy()
    expect(screen.getByText('Confirmada')).toBeTruthy()
    const manage = screen.getByRole('link', { name: 'Gestionar' })
    expect(manage.getAttribute('href')).toBe(`/reserva/${reservation.id}`)
    expect(screen.queryByRole('link', { name: 'Ver factura' })).toBeNull()
  })

  it('offers the invoice link once the stay is closed', async () => {
    const { api } = await setup()
    const reservation = await api.createReservation({ roomId: 13, checkIn, checkOut, guest })
    await api.checkIn(reservation.id)
    await api.checkOut(reservation.id)
    renderWithProviders(<App />, '/mis-reservas', api)

    const invoiceLink = await screen.findByRole('link', { name: 'Ver factura' })
    expect(invoiceLink.getAttribute('href')).toBe(`/factura/${reservation.id}`)
    expect(screen.getByText('Check-out realizado')).toBeTruthy()
  })

  it('lists the reservations newest first', async () => {
    const { api } = await setup()
    const earlier = await api.createReservation({ roomId: 13, checkIn, checkOut, guest })
    const later = await api.createReservation({
      roomId: 14,
      checkIn: addDays(todayIso(), 20),
      checkOut: addDays(todayIso(), 22),
      guest,
    })
    renderWithProviders(<App />, '/mis-reservas', api)

    await screen.findByText(earlier.id)
    const codes = screen.getAllByText(/^RES-/, { selector: 'p' }).map((node) => node.textContent)
    expect(codes[0]).toBe(later.id)
  })
})
