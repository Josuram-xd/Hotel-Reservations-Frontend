import { useState } from 'react'

interface Amenity {
  id: string
  title: string
  price: string
  text: string
  image: string
}

const AMENITIES: Amenity[] = [
  {
    id: 'spa',
    title: 'Spa',
    price: '$50 por sesión',
    text: 'Masajes y circuito de aguas para soltar el cuerpo después del viaje.',
    image: 'https://picsum.photos/seed/spa-stones/1000/1400',
  },
  {
    id: 'desayuno',
    title: 'Desayuno',
    price: '$15 por día',
    text: 'Buffet de la casa todas las mañanas, con opciones locales y saludables.',
    image: 'https://picsum.photos/seed/breakfast-table/1000/1400',
  },
  {
    id: 'traslado',
    title: 'Traslado',
    price: '$30 por trayecto',
    text: 'Te recogemos o te llevamos al aeropuerto sin que tengas que coordinar nada.',
    image: 'https://picsum.photos/seed/airport-car/1000/1400',
  },
]

export default function AmenitiesAccordion() {
  const [active, setActive] = useState(0)

  return (
    <section className="mx-auto max-w-7xl px-6 py-32 md:py-48">
      <h2
        className="mb-16 max-w-4xl font-light leading-tight tracking-tight"
        style={{ fontSize: 'clamp(2rem, 4vw, 3.75rem)' }}
      >
        Servicios que se suman a tu reserva en un clic
      </h2>
      <div className="flex flex-col gap-4 md:h-[34rem] md:flex-row">
        {AMENITIES.map((item, index) => {
          const isActive = index === active
          return (
            <button
              key={item.id}
              type="button"
              aria-expanded={isActive}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              className={`group relative isolate flex min-h-64 overflow-hidden rounded-3xl border border-white/10 text-left transition-[flex] duration-700 ease-out md:min-h-0 ${
                isActive ? 'md:flex-[3]' : 'md:flex-1'
              }`}
            >
              <img
                src={item.image}
                alt=""
                className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 contrast-110 grayscale-[40%] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent"
              />
              <div className="mt-auto flex flex-col gap-2 p-8">
                <h3 className="text-3xl font-medium">{item.title}</h3>
                <p className="text-gold">{item.price}</p>
                <p
                  className={`max-w-sm text-sand/80 transition-opacity duration-500 ${
                    isActive ? 'opacity-100' : 'opacity-100 md:opacity-0'
                  }`}
                >
                  {item.text}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
