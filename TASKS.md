# TASKS - Hotel Reservations Frontend

React + Vite + TypeScript + Tailwind + GSAP. Deployed on Vercel. Talks to `hotel-reservations-backend`.
All code in English; all user-facing text (labels, messages, errors, page) in Spanish.
One commit per task, using the task message with its `[x.y]` suffix. See `DESIGN.md` for the visual direction.

## Phase 0 - Setup

- [x] feat: scaffold React + Vite + TypeScript project with Tailwind, design notes and docs [0.1]
- [x] docs: add AGENTS.md with git workflow rules for AI assistants [0.2]

## Phase 1 - Foundations

- [x] feat(api): typed API client using VITE_API_URL and error mapping to Spanish messages [1.1]
- [x] feat(ui): design tokens, Outfit font, base components (Button, Input, Card) [1.2]
- [x] feat(layout): floating glass navigation, footer and routing [1.3]
- [x] test(api): cover API client success and error paths [1.4]

## Phase 2 - Landing (AIDA)

- [x] feat(landing): cinematic centered hero with two CTAs [2.1]
- [x] feat(landing): gapless bento grid of room types [2.2]
- [x] feat(landing): horizontal accordion for amenities (spa, restaurant, transport) [2.3]
- [ ] feat(landing): scrubbed text reveal and image scale/fade with reduced-motion support [2.4]

## Phase 3 - Search and selection

- [ ] feat(search): date range search form with validation [3.1]
- [ ] feat(search): availability list filtered by room type [3.2]
- [ ] feat(search): room selection with dynamic price preview from the server [3.3]
- [ ] test(search): cover form validation and availability rendering [3.4]

## Phase 4 - Booking

- [ ] feat(booking): guest data form with Spanish validation messages [4.1]
- [ ] feat(booking): submit reservation and redirect to management panel [4.2]

## Phase 5 - Reservation management

- [ ] feat(reservation): reservation summary view by id [5.1]
- [ ] feat(reservation): add extra services (spa, desayuno, traslado) [5.2]
- [ ] feat(reservation): check-in showing the digital key [5.3]
- [ ] feat(reservation): check-out action [5.4]
- [ ] test(reservation): cover panel actions and state transitions [5.5]

## Phase 6 - Invoice

- [ ] feat(invoice): final invoice view rendered from the server response [6.1]
- [ ] feat(invoice): print-friendly layout [6.2]

## Phase 7 - Quality and deployment (Vercel)

- [ ] feat(ui): loading, empty and error states across all screens [7.1]
- [ ] feat(a11y): keyboard navigation, focus states, contrast review [7.2]
- [ ] ci: add GitHub Actions workflow running typecheck, test and build [7.3]
- [ ] chore(deploy): deploy to Vercel with VITE_API_URL pointing to Railway [7.4]
- [ ] chore(deploy): production smoke test of the full booking flow [7.5]

## Phase 8 - Users and authentication (needs backend Phase 8)

- [ ] feat(auth): auth API calls, token storage and AuthContext provider [8.1]
- [ ] feat(auth): login and register pages with Spanish validation [8.2]
- [ ] feat(auth): protected routes and user menu in the navigation [8.3]
- [ ] feat(auth): "Mis reservas" page listing the user reservations [8.4]
- [ ] test(auth): cover AuthContext, forms and protected routes [8.5]

## Phase 9 - Patterns and mock API (see docs/PATTERNS.md)

- [ ] feat(api): in-memory mock implementing the full contract, switched with VITE_USE_MOCK [9.1]
- [ ] refactor(api): HotelApi facade selecting real or mock implementation [9.2]
- [ ] refactor(api): Adapter mappers from API responses to view models [9.3]
- [ ] test(patterns): cover mock, facade selection and adapters [9.4]
