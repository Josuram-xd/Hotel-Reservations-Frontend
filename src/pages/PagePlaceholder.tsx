interface PagePlaceholderProps {
  title: string
  description?: string
}

export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-light" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>
        {title}
      </h1>
      {description && <p className="max-w-xl text-sand/70">{description}</p>}
    </section>
  )
}
