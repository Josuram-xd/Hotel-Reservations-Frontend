import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api/errors'
import { useAuth } from '../auth/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { hasErrors, validateEmail, validatePassword, validateRequired } from '../lib/validation'
import type { FieldErrors } from '../lib/validation'

type Field = 'fullName' | 'email' | 'password' | 'confirm'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/mis-reservas'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors: FieldErrors<Field> = {
      fullName: validateRequired(fullName, 'El nombre'),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: password !== confirm ? 'Las contraseñas no coinciden.' : undefined,
    }
    setErrors(nextErrors)
    setServerError(null)
    if (hasErrors(nextErrors)) return

    setSubmitting(true)
    try {
      await register({ fullName: fullName.trim(), email: email.trim(), password })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setServerError(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-32">
      <div>
        <h1 className="text-4xl font-light">Crea tu cuenta</h1>
        <p className="mt-2 text-sand/70">Solo toma un minuto y podrás reservar de inmediato.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Nombre completo"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />
        {serverError && (
          <p role="alert" className="rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {serverError}
          </p>
        )}
        <Button type="submit" loading={submitting}>
          Crear cuenta
        </Button>
      </form>
      <p className="text-sm text-sand/70">
        ¿Ya tienes cuenta?{' '}
        <Link to="/ingresar" state={location.state} className="text-gold underline-offset-4 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </section>
  )
}
