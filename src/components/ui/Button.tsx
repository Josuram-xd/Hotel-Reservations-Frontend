import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-gold text-ink hover:bg-sand',
  secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
  ghost: 'bg-transparent text-sand hover:bg-white/10',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    >
      {loading ? 'Procesando...' : children}
    </button>
  )
}
