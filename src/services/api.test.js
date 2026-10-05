import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('api', () => {
  let responseInterceptorSuccess
  let responseInterceptorError
  let mockAxiosInstance
  let sessionHandlers

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    mockAxiosInstance = vi.fn((config) => mockAxiosInstance.request(config))
    mockAxiosInstance.request = vi.fn()
    mockAxiosInstance.get = vi.fn()
    mockAxiosInstance.interceptors = {
      request: { use: vi.fn() },
      response: {
        use: vi.fn((onFulfilled, onRejected) => {
          responseInterceptorSuccess = onFulfilled
          responseInterceptorError = onRejected
        }),
      },
    }

    vi.doMock('axios', () => ({
      default: {
        create: vi.fn(() => mockAxiosInstance),
      },
    }))

    const { setSessionHandlers } = await import('./api')
    sessionHandlers = { onUnauthorized: vi.fn(), onForbidden: vi.fn() }
    setSessionHandlers(sessionHandlers)
  })

  it('passes through a successful response unchanged', () => {
    const response = { data: 'ok' }
    expect(responseInterceptorSuccess(response)).toBe(response)
  })

  it('rejects immediately when the error status is not 401 or 403', async () => {
    const error = { response: { status: 500 }, config: { url: '/api/v1/something' } }

    await expect(responseInterceptorError(error)).rejects.toBe(error)
    expect(mockAxiosInstance.get).not.toHaveBeenCalled()
  })

  it('ends the session when /auth/refresh itself returns 401', async () => {
    const error = {
      response: { status: 401 },
      config: { url: '/api/v1/auth/refresh' },
    }

    await expect(responseInterceptorError(error)).rejects.toBe(error)
    expect(sessionHandlers.onUnauthorized).toHaveBeenCalled()
  })

  it('does not try to refresh when the login credentials are wrong', async () => {
    const error = {
      response: { status: 401 },
      config: { url: '/api/v1/auth/login' },
    }

    await expect(responseInterceptorError(error)).rejects.toBe(error)
    expect(mockAxiosInstance.get).not.toHaveBeenCalled()
    expect(sessionHandlers.onUnauthorized).not.toHaveBeenCalled()
  })

  it('notifies the app when the backend answers 403', async () => {
    const error = { response: { status: 403 }, config: { url: '/api/v1/products/administration' } }

    await expect(responseInterceptorError(error)).rejects.toBe(error)
    expect(sessionHandlers.onForbidden).toHaveBeenCalled()
    expect(mockAxiosInstance.get).not.toHaveBeenCalled()
  })

  it('calls refresh and retries the original request on 401', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({ data: 'refreshed' })
    mockAxiosInstance.request.mockResolvedValueOnce({ data: 'retried' })

    const originalRequest = { url: '/api/v1/orders', _retry: undefined }
    const error = { response: { status: 401 }, config: originalRequest }

    const result = await responseInterceptorError(error)

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/auth/refresh')
    expect(originalRequest._retry).toBe(true)
    expect(mockAxiosInstance).toHaveBeenCalledWith(originalRequest)
    expect(result).toEqual({ data: 'retried' })
  })

  it('does not retry a request twice', async () => {
    const originalRequest = { url: '/api/v1/orders', _retry: true }
    const error = { response: { status: 401 }, config: originalRequest }

    await expect(responseInterceptorError(error)).rejects.toBe(error)
    expect(mockAxiosInstance.get).not.toHaveBeenCalled()
  })

  it('ends the session when refresh itself fails', async () => {
    mockAxiosInstance.get.mockRejectedValueOnce(new Error('refresh failed'))

    const originalRequest = { url: '/api/v1/orders' }
    const error = { response: { status: 401 }, config: originalRequest }

    await expect(responseInterceptorError(error)).rejects.toThrow('refresh failed')
    expect(sessionHandlers.onUnauthorized).toHaveBeenCalled()
  })
})