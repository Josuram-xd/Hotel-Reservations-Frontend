import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach } from 'vitest'
import App from '../App'
import { createMockApi } from '../api/mock'
import { clearToken, setToken } from '../api/session'
import { addDays, todayIso } from '../lib/dates'
import { renderWithProviders } from '../test/render'

const checkIn = addDays(todayIso(), 10)
const checkOut = addDays(todayIso(), 13)

async function signedInApi() {
  const api = createMockApi()
  const { token } = await api.register({ fullName: 'Ana Perez', email: 'ana@example.com', password: 'password1' })
  setToken(token)
  return api
}

beforeEach(() => clearToken())

describe('Booking page', () => {
  it('sends anonymous visitors to the login page and keeps the target', () => {
    renderWithProviders(<App />, `/reservar?roomId=1&checkIn=${checkIn}&checkOut=${checkOut}`)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Inicia sesión')
  })

  it('shows the room, prefilled guest data and creates the reservation', async () => {
    const api = await signedInApi()
    renderWithProviders(<App />, `/reservar?roomId=1&checkIn=${checkIn}&checkOut=${checkOut}`, api)

    expect(await screen.findByLabelText('Resumen de precio')).toBeTruthy()
    expect((screen.getByLabelText('Nombre completo') as HTMLInputElement).value).toBe('Ana Perez')
    expect((screen.getByLabelText('Correo electrónico') as HTMLInputElement).value).toBe('ana@example.com')

    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '3001234567' } })
    fireEvent.change(screen.getByLabelText('Documento de identidad'), { target: { value: '10203040' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar reserva' }))

    await waitFor(() => expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Tu reserva'))
    expect(await api.myReservations()).toHaveLength(1)
  })

  it('explains when the room is no longer available', async () => {
    const api = await signedInApi()
    await api.createReservation({
      roomId: 1,
      checkIn,
      checkOut,
      guest: { fullName: 'Otro', email: 'o@example.com', phone: '3000000000', document: '1' },
    })
    renderWithProviders(<App />, `/reservar?roomId=1&checkIn=${checkIn}&checkOut=${checkOut}`, api)
    expect((await screen.findByRole('alert')).textContent).toContain('ya no está disponible')
    expect(screen.getByRole('link', { name: 'Volver a la búsqueda' })).toBeTruthy()
  })

  it('rejects an incomplete query', async () => {
    const api = await signedInApi()
    renderWithProviders(<App />, '/reservar', api)
    expect((await screen.findByRole('alert')).textContent).toContain('Faltan datos')
  })
})
