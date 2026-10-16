import { httpApi } from './client'
import { selectApi } from './index'

describe('selectApi', () => {
  it('returns the real HTTP client when mock mode is off', () => {
    expect(selectApi(false)).toBe(httpApi)
  })

  it('returns a separate in-memory implementation when mock mode is on', () => {
    const mock = selectApi(true)
    expect(mock).not.toBe(httpApi)
    expect(typeof mock.getAvailability).toBe('function')
  })
})
