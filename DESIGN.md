# DESIGN - Hotel Aurora (frontend)

Direction from the `gpt-tasteskill` design skill. All UI copy is in Spanish; all code is in English.

## Deterministic selection (seed = prompt length)

```
seed = 107  ->  107 % 3 = 2
hero_layout      = "Cinematic Center"
typography       = "Outfit"            # never Inter
components       = ["Inline Typography Images", "Horizontal Accordions", "Infinite Marquee"]
gsap_paradigms   = ["Scrubbing Text Reveals", "Image Scale & Fade Scroll"]
```

## Structure (AIDA)

- **Navigation:** floating glass pill, fixed on top.
- **Attention (Hero):** centered, full-bleed hotel image with dark radial wash, two CTAs. H1 in `max-w-6xl`, font `clamp(2.5rem, 5vw, 5rem)`, 2-3 lines max. No stamps, pill-tags or stats in the hero.
- **Interest:** gapless bento (`grid-flow-dense`, 3-5 cards) for room types plus a horizontal accordion for amenities (spa, restaurante, traslado).
- **Desire:** scrubbed text reveal and image scale/fade on scroll.
- **Action:** the booking flow entry point (search by dates) and a large CTA footer.

## Rules

- Palette: ink `#0d0f12`, sand `#f4efe6`, gold `#c8a46a`. Buttons: dark bg = white text, light bg = dark text.
- Section spacing `py-32 md:py-48`. Wrap pages in `<main className="overflow-x-hidden w-full max-w-full">`.
- No meta-labels ("SECCION 01"). No emojis.
- Every animation honors `prefers-reduced-motion` via `gsap.matchMedia()`.
- Images: `https://picsum.photos/seed/{keyword}/1920/1080` with grayscale/contrast filters.
- The app screens (search, booking, management panel, invoice) reuse this system but favor clarity over motion.
