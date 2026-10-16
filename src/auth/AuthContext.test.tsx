import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, vi } from 'vitest'
import { createMockApi } from '../api/mock'
import { clearToken, getToken, setToken } from '../api/session'
import { AuthProvider, useAuth } from './AuthContext'

function Probe() {
  const { user, status, login, register, logout } = useAuth()
  return (
    <div>
      <p>estado:{status}</p>
      <p>usuario:{user?.email ?? 'ninguno'}</p>
      <button onClick={() => void login({ email: 'ana@example.com', password: 'password1' })}>Entrar</button>
      <button onClick={() => void register({ fullName: 'Ana', email: 'nueva@example.com', password: 'password1' })}>
        Registrarse
      </button>
      <button onClick={() => void logout()}>Salir</button>
    </div>
  )
}

function renderProbe(api = createMockApi()) {
  render(
    <AuthProvider api={api}>
      <Probe />
    </AuthProvider>,
  )
  return api
}

beforeEach(() => clearToken())

describe('AuthContext', () => {
  it('starts anonymous when there is no stored token', () => {
    renderProbe()
    expect(screen.getByText('estado:anonymous')).toBeTruthy()
    expect(screen.getByText('usuario:ninguno')).toBeTruthy()
  })

  it('requires an AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<Probe />)).toThrow('useAuth must be used inside an AuthProvider')
    consoleError.mockRestore()
  })

  it('login stores the token and exposes the user', async () => {
    const api = createMockApi()
    await api.register({ fullName: 'Ana', email: 'ana@example.com', password: 'password1' })
    renderProbe(api)

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(screen.getByText('estado:authenticated')).toBeTruthy())
    expect(screen.getByText('usuario:ana@example.com')).toBeTruthy()
    expect(getToken()).toBeTruthy()
  })

  it('register starts the session too', async () => {
    renderProbe()

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }))

    await waitFor(() => expect(screen.getByText('usuario:nueva@example.com')).toBeTruthy())
    expect(getToken()).toBeTruthy()
  })

  it('logout clears the token and the user', async () => {
    const api = createMockApi()
    await api.register({ fullName: 'Ana', email: 'ana@example.com', password: 'password1' })
    renderProbe(api)
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(screen.getByText('estado:authenticated')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: 'Salir' }))

    await waitFor(() => expect(screen.getByText('estado:anonymous')).toBeTruthy())
    expect(getToken()).toBeNull()
  })

  it('restores the session from a stored token on mount', async () => {
    const api = createMockApi()
    const { token } = await api.register({ fullName: 'Ana', email: 'ana@example.com', password: 'password1' })
    setToken(token)

    renderProbe(api)

    await waitFor(() => expect(screen.getByText('estado:authenticated')).toBeTruthy())
    expect(screen.getByText('usuario:ana@example.com')).toBeTruthy()
  })

  it('clears an expired stored token and stays anonymous', async () => {
    setToken('token-que-ya-no-existe')

    renderProbe()

    await waitFor(() => expect(screen.getByText('estado:anonymous')).toBeTruthy())
    expect(getToken()).toBeNull()
  })
})
