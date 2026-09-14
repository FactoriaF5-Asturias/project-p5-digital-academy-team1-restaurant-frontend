import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('api', () => {
  let requestInterceptor

  beforeEach(async () => {
    vi.resetModules()
    localStorage.clear()

    const mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn((onFulfilled) => {
            requestInterceptor = onFulfilled
          }),
        },
      },
    }

    vi.doMock('axios', () => ({
      default: {
        create: vi.fn(() => mockAxiosInstance),
      },
    }))

    await import('./api')
  })

  it('adds the Authorization header when a token exists in localStorage', () => {
    localStorage.setItem('token', 'abc123')

    const config = { headers: {} }
    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBe('Bearer abc123')
  })

  it('does not add the Authorization header when there is no token', () => {
    const config = { headers: {} }
    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBeUndefined()
  })
})
