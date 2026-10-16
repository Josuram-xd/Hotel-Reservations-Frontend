import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import GuestForm, { validateGuest } from './GuestForm'

describe('validateGuest', () => {
  it('flags every empty field', () => {
    const errors = validateGuest({ fullName: '', email: '', phone: '', document: '' })
    expect(Object.values(errors).filter(Boolean)).toHaveLength(4)
  })

  it('accepts a valid guest', () => {
    const errors = validateGuest({
      fullName: 'Ana Perez',
      email: 'ana@example.com',
      phone: '300 123 4567',
      document: '10203040',
    })
    expect(Object.values(errors).filter(Boolean)).toHaveLength(0)
  })

  it('rejects a malformed email and phone', () => {
    const errors = validateGuest({ fullName: 'Ana', email: 'ana@', phone: 'abc', document: '1' })
    expect(errors.email).toContain('correo válido')
    expect(errors.phone).toContain('teléfono válido')
  })
})

describe('GuestForm', () => {
  it('does not submit when invalid and shows Spanish messages', () => {
    const onSubmit = vi.fn()
    render(<GuestForm onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar reserva' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy()
  })

  it('submits trimmed values when valid', () => {
    const onSubmit = vi.fn()
    render(<GuestForm initial={{ fullName: ' Ana Perez ', email: 'ana@example.com' }} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '3001234567' } })
    fireEvent.change(screen.getByLabelText('Documento de identidad'), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar reserva' }))
    expect(onSubmit).toHaveBeenCalledWith({
      fullName: 'Ana Perez',
      email: 'ana@example.com',
      phone: '3001234567',
      document: '123456',
    })
  })

  it('shows a server error', () => {
    render(<GuestForm serverError="La habitación ya no está disponible." onSubmit={() => {}} />)
    expect(screen.getByRole('alert').textContent).toContain('ya no está disponible')
  })
})
