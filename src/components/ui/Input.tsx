import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function Input({ label, error, className = '', ...rest }: InputProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm text-sand/80">
        {label}
      </label>
      <input
        {...rest}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-2xl border bg-white/5 px-4 py-3 text-sand placeholder:text-sand/40 focus-visible:outline-2 focus-visible:outline-gold ${error ? 'border-red-400' : 'border-white/15'} ${className}`}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}
