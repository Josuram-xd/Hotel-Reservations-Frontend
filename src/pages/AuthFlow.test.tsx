import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach } from 'vitest'
import App from '../App'
import { createMockApi } from '../api/mock'
import { clearToken, getToken, setToken } from '../api/session'
import { addDays, todayIso } from '../lib/dates'
import { renderWithProviders } from '../test/render'

const guest = { fullName: 'Ana Perez', email: 'ana@example.com', phone: '3001234567', document: '123' }

function fillLogin(email: string, password: string) {
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
}

beforeEach(() => clearToken())

describe('Spanish validation on the auth forms', () => {
  it('lists the required register fields', async () => {
    renderWithProviders(<App />, '/registro')

    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('El nombre es obligatorio.')).toBeTruthy()
    expect(screen.getByText('El correo es obligatorio.')).toBeTruthy()
    expect(screen.getByText('La contraseña es obligatoria.')).toBeTruthy()
  })

  it('rejects a short password and a mismatched confirmation', async () => {
    renderWithProviders(<App />, '/registro')
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'ana@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'corta' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'otra' } })

    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('La contraseña debe tener al menos 8 caracteres.')).toBeTruthy()
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeTruthy()
  })
})

describe('Login page', () => {
  it('shows the Spanish message for wrong credentials', async () => {
    renderWithProviders(<App />, '/ingresar')

    fillLogin('nadie@example.com', 'password1')

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('El correo o la contraseña no son correctos.')
  })

  it('signs in and lands on mis reservas', async () => {
    const api = createMockApi()
    await api.register({ fullName: 'Ana Perez', email: 'ana@example.com', password: 'password1' })
    renderWithProviders(<App />, '/ingresar', api)

    fillLogin('ana@example.com', 'password1')

    expect(await screen.findByText('Todavía no tienes reservas.')).toBeTruthy()
    expect(screen.getByText('Ana Perez')).toBeTruthy()
  })

  it('returns to the requested protected page after signing in', async () => {
    const api = createMockApi()
    const { token } = await api.register({ fullName: 'Ana Perez', email: 'ana@example.com', password: 'password1' })
    setToken(token)
    const reservation = await api.createReservation({
      roomId: 13,
      checkIn: addDays(todayIso(), 10),
      checkOut: addDays(todayIso(), 12),
      guest,
    })
    clearToken()

    renderWithProviders(<App />, `/reserva/${reservation.id}`, api)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Inicia sesión')

    fillLogin('ana@example.com', 'password1')

    expect(await screen.findByLabelText('Resumen de la reserva')).toBeTruthy()
  })
})

describe('Register page', () => {
  it('shows the Spanish message when the email is already registered', async () => {
    const api = createMockApi()
    await api.register({ fullName: 'Ana Perez', email: 'ana@example.com', password: 'password1' })
    renderWithProviders(<App />, '/registro', api)
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Otra Persona' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'ana@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password2' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'password2' } })

    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Ya existe una cuenta con ese correo.')
  })

  it('registers, opens the session and lands on mis reservas', async () => {
    renderWithProviders(<App />, '/registro')
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Nueva Persona' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'nueva@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password1' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'password1' } })

    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Todavía no tienes reservas.')).toBeTruthy()
    expect(screen.getByText('Nueva Persona')).toBeTruthy()
  })
})

describe('Protected routes and session', () => {
  it('logout clears the session and returns home', async () => {
    const api = createMockApi()
    const { token } = await api.register({ fullName: 'Ana Perez', email: 'ana@example.com', password: 'password1' })
    setToken(token)
    renderWithProviders(<App />, '/mis-reservas', api)
    await screen.findByText('Todavía no tienes reservas.')

    fireEvent.click(screen.getByRole('button', { name: 'Salir' }))

    await waitFor(() => expect(screen.getByRole('link', { name: 'Ingresar' })).toBeTruthy())
    expect(getToken()).toBeNull()
  })
})
