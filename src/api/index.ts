import { httpApi } from './client'
import type { HotelApi } from './hotelApi'
import { createMockApi } from './mock'

export type { HotelApi } from './hotelApi'

const MOCK_LATENCY_MS = 250

/** Facade + Strategy: screens depend on `HotelApi`, the implementation is chosen once at startup. */
export function selectApi(useMock: boolean): HotelApi {
  return useMock ? createMockApi({ delayMs: MOCK_LATENCY_MS }) : httpApi
}

export const hotelApi: HotelApi = selectApi(import.meta.env.VITE_USE_MOCK === 'true')
