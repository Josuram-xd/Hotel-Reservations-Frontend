/** Parses an ISO date (YYYY-MM-DD) as a UTC timestamp so day math is DST-safe. */
function toUtc(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

const DAY_MS = 24 * 60 * 60 * 1000

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((toUtc(checkOut) - toUtc(checkIn)) / DAY_MS)
}

export function nightsOf(checkIn: string, checkOut: string): string[] {
  const nights = nightsBetween(checkIn, checkOut)
  return Array.from({ length: Math.max(nights, 0) }, (_, i) =>
    new Date(toUtc(checkIn) + i * DAY_MS).toISOString().slice(0, 10),
  )
}

export function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function addDays(iso: string, days: number): string {
  return new Date(toUtc(iso) + days * DAY_MS).toISOString().slice(0, 10)
}

export function rangesOverlap(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  return aIn < bOut && bIn < aOut
}
