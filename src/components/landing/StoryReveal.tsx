import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const STORY =
  'Llegas, te identificas y tu llave digital ya está lista. Sin filas, sin papeles, sin sorpresas en la factura. Nos encargamos de que lo único que tengas que decidir sea cuánto tiempo quedarte.'

export default function StoryReveal() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set('.story-word', { opacity: 0.1 })
        gsap.to('.story-word', {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.story-text',
            start: 'top 80%',
            end: 'bottom 45%',
            scrub: true,
          },
        })

        gsap
          .timeline({
            scrollTrigger: {
              trigger: '.story-image',
              start: 'top 95%',
              end: 'bottom 5%',
              scrub: true,
            },
          })
          .fromTo('.story-image img', { scale: 0.8 }, { scale: 1, duration: 1, ease: 'none' })
          .to('.story-image img', { opacity: 0.2, duration: 0.6, ease: 'none' })
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="mx-auto max-w-6xl px-6 py-32 md:py-48">
      <p
        className="story-text mx-auto max-w-5xl text-center font-light leading-snug"
        style={{ fontSize: 'clamp(1.75rem, 3.2vw, 3rem)' }}
      >
        {STORY.split(' ').map((word, index) => (
          <span key={index} className="story-word inline-block pr-[0.25em]">
            {word}
          </span>
        ))}
      </p>
      <div className="story-image mx-auto mt-24 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-3xl">
        <img
          src="https://picsum.photos/seed/hotel-terrace-night/1920/1080"
          alt="Terraza del hotel al atardecer"
          className="h-full w-full object-cover contrast-125 grayscale-[30%]"
        />
      </div>
    </section>
  )
}
