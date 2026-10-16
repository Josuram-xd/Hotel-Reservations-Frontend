import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { HotelApi } from '../api'
import { createMockApi } from '../api/mock'
import { AuthProvider } from '../auth/AuthContext'

export function renderWithProviders(ui: ReactElement, path = '/', api: HotelApi = createMockApi()) {
  return {
    api,
    ...render(
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider api={api}>{ui}</AuthProvider>
      </MemoryRouter>,
    ),
  }
}
