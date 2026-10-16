import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api/errors'
import { useAuth } from '../auth/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { hasErrors, validateEmail, validatePassword } from '../lib/validation'
import type { FieldErrors } from '../lib/validation'

type Field = 'email' | 'password'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/mis-reservas'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors: FieldErrors<Field> = { email: validateEmail(email), password: validatePassword(password) }
    setErrors(nextErrors)
    setServerError(null)
    if (hasErrors(nextErrors)) return

    setSubmitting(true)
    try {
      await login({ email: email.trim(), password })
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
        <h1 className="text-4xl font-light">Inicia sesión</h1>
        <p className="mt-2 text-sand/70">Ingresa para reservar y gestionar tus estancias.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        {serverError && (
          <p role="alert" className="rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {serverError}
          </p>
        )}
        <Button type="submit" loading={submitting}>
          Iniciar sesión
        </Button>
      </form>
      <p className="text-sm text-sand/70">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/registro" state={location.state} className="text-gold underline-offset-4 hover:underline">
          Crear cuenta
        </Link>
      </p>
    </section>
  )
}
