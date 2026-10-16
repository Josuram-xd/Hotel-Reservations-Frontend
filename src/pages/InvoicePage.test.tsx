import { fireEvent, screen, within } from '@testing-library/react'
import { beforeEach, vi } from 'vitest'
import App from '../App'
import { createMockApi } from '../api/mock'
import { clearToken, setToken } from '../api/session'
import { addDays, todayIso } from '../lib/dates'
import { formatMoney } from '../lib/format'
import { renderWithProviders } from '../test/render'

const checkIn = addDays(todayIso(), 10)
const checkOut = addDays(todayIso(), 12)
const guest = { fullName: 'Ana Perez', email: 'ana@example.com', phone: '3001234567', document: '123' }

/** Matches formatted money even when Intl uses non-breaking spaces (U+00A0). */
function money(value: number): RegExp {
  return new RegExp(
    formatMoney(value)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/[\s\u00a0]+/g, '\\s+'),
  )
}

async function setupCheckedOut() {
  const api = createMockApi()
  const { token } = await api.register({ fullName: 'Ana Perez', email: 'ana@example.com', password: 'password1' })
  setToken(token)
  const created = await api.createReservation({ roomId: 13, checkIn, checkOut, guest })
  await api.addService(created.id, 'SPA')
  await api.checkIn(created.id)
  const reservation = await api.checkOut(created.id)
  renderWithProviders(<App />, `/factura/${reservation.id}`, api)
  await screen.findByLabelText('Factura')
  return { api, reservation }
}

beforeEach(() => clearToken())

describe('Invoice page', () => {
  it('renders the invoice returned by the server', async () => {
    const { reservation } = await setupCheckedOut()
    const invoice = reservation.invoice!
    const view = screen.getByLabelText('Factura')

    expect(within(view).getByText(invoice.number)).toBeTruthy()
    expect(within(view).getByText('Ana Perez')).toBeTruthy()
    expect(within(view).getByText('Spa')).toBeTruthy()
    expect(within(view).getAllByText(money(invoice.total)).length).toBeGreaterThan(0)
  })

  it('shows every line with its quantity, unit price and subtotal', async () => {
    const { reservation } = await setupCheckedOut()
    const [roomLine] = reservation.invoice!.lines
    const view = screen.getByLabelText('Factura')

    expect(within(view).getByText(roomLine.description)).toBeTruthy()
    expect(within(view).getByText(String(roomLine.quantity))).toBeTruthy()
    expect(within(view).getByText(money(roomLine.unitPrice))).toBeTruthy()
    expect(within(view).getAllByText(money(roomLine.subtotal)).length).toBeGreaterThan(0)
  })

  it('opens the browser print dialog from the print button', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    await setupCheckedOut()

    fireEvent.click(screen.getByRole('button', { name: 'Imprimir factura' }))

    expect(printSpy).toHaveBeenCalledTimes(1)
    printSpy.mockRestore()
  })

  it('explains that the invoice is not available before check-out', async () => {
    const api = createMockApi()
    const { token } = await api.register({ fullName: 'Ana Perez', email: 'ana@example.com', password: 'password1' })
    setToken(token)
    const reservation = await api.createReservation({ roomId: 13, checkIn, checkOut, guest })
    renderWithProviders(<App />, `/factura/${reservation.id}`, api)

    expect(await screen.findByText(/se genera al hacer check-out/i)).toBeTruthy()
    const link = screen.getByRole('link', { name: 'Ir a tu reserva' })
    expect(link.getAttribute('href')).toBe(`/reserva/${reservation.id}`)
  })

  it('shows a Spanish error with retry when the reservation does not exist', async () => {
    const api = createMockApi()
    const { token } = await api.register({ fullName: 'Ana', email: 'ana@example.com', password: 'password1' })
    setToken(token)
    renderWithProviders(<App />, '/factura/RES-NOPE', api)

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('No encontramos una reserva con ese código.')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy()
  })
})
