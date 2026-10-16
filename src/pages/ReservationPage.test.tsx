import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach } from 'vitest'
import App from '../App'
import { createMockApi } from '../api/mock'
import { clearToken, setToken } from '../api/session'
import { addDays, todayIso } from '../lib/dates'
import { renderWithProviders } from '../test/render'

const checkIn = addDays(todayIso(), 10)
const checkOut = addDays(todayIso(), 13)
const guest = { fullName: 'Ana Perez', email: 'ana@example.com', phone: '3001234567', document: '123' }

async function setup() {
  const api = createMockApi()
  const { token } = await api.register({ fullName: 'Ana Perez', email: 'ana@example.com', password: 'password1' })
  setToken(token)
  const reservation = await api.createReservation({ roomId: 13, checkIn, checkOut, guest })
  renderWithProviders(<App />, `/reserva/${reservation.id}`, api)
  await screen.findByLabelText('Resumen de la reserva')
  return { api, reservation }
}

beforeEach(() => clearToken())

describe('Reservation management panel', () => {
  it('shows the reservation summary with its code, status and total', async () => {
    const { reservation } = await setup()
    expect(screen.getByText(reservation.id)).toBeTruthy()
    expect(screen.getByText('Confirmada')).toBeTruthy()
    expect(screen.getByText('Alojamiento (3 noches)')).toBeTruthy()
  })

  it('adds a service and updates the breakdown and total', async () => {
    const { api, reservation } = await setup()
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Spa' }))
    await waitFor(() => expect(screen.getAllByText('Spa').length).toBeGreaterThan(1))
    const updated = await api.getReservation(reservation.id)
    expect(updated.servicesTotal).toBe(50)
  })

  it('checks in and shows the digital key', async () => {
    await setup()
    fireEvent.click(screen.getByRole('button', { name: 'Hacer check-in' }))
    const key = await screen.findByLabelText('Llave digital')
    expect(key.textContent).toMatch(/^[0-9a-f-]{36}$/)
    expect(screen.getByText('Check-in realizado', { selector: 'span' })).toBeTruthy()
  })

  it('asks for confirmation before checking out, then links to the invoice', async () => {
    await setup()
    fireEvent.click(screen.getByRole('button', { name: 'Hacer check-in' }))
    await screen.findByLabelText('Llave digital')

    fireEvent.click(screen.getByRole('button', { name: 'Hacer check-out' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByRole('button', { name: 'Hacer check-out' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Hacer check-out' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar check-out' }))
    const invoiceLink = await screen.findByRole('link', { name: 'Ver factura' })
    expect(invoiceLink.getAttribute('href')).toMatch(/^\/factura\/RES-/)
    expect(screen.getByText('Check-out realizado', { selector: 'span' })).toBeTruthy()
  })

  it('disables services once the stay is closed', async () => {
    const { api, reservation } = await setup()
    await api.checkIn(reservation.id)
    await api.checkOut(reservation.id)
    cleanup()
    renderWithProviders(<App />, `/reserva/${reservation.id}`, api)
    const buttons = await screen.findAllByRole('button', { name: /^Agregar/ })
    expect(buttons.every((button) => (button as HTMLButtonElement).disabled)).toBe(true)
  })

  it('shows a Spanish error with retry when the reservation is not found', async () => {
    const api = createMockApi()
    const { token } = await api.register({ fullName: 'Ana', email: 'ana@example.com', password: 'password1' })
    setToken(token)
    renderWithProviders(<App />, '/reserva/RES-NOPE', api)
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('No encontramos una reserva con ese código.')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy()
  })
})
