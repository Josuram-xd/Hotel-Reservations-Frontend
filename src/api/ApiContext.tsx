import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { hotelApi } from './index'
import type { HotelApi } from './hotelApi'

const ApiContext = createContext<HotelApi>(hotelApi)

/** Lets tests (and future environments) swap the API implementation without touching screens. */
export function ApiProvider({ api, children }: { api: HotelApi; children: ReactNode }) {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

export function useApi(): HotelApi {
  return useContext(ApiContext)
}
