import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from './auth'
import { authService } from '../services/authService'

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}))

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('empieza sin usuario y sin rol', () => {
    const authStore = useAuthStore()

    expect(authStore.user).toBeNull()
    expect(authStore.role).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('login guarda el usuario y su rol', async () => {
    authService.login.mockResolvedValue({
      firstName: 'Andrea',
      email: 'user@test.com',
      roles: ['ROLE_ADMIN'],
    })

    const authStore = useAuthStore()

    await authStore.login({
      email: 'user@test.com',
      password: '123456',
    })

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: '123456',
    })

    expect(authStore.user.email).toBe('user@test.com')
    expect(authStore.role).toBe('ROLE_ADMIN')
    expect(authStore.isAuthenticated).toBe(true)
  })

  it('fetchCurrentUser recupera el usuario y su rol', async () => {
    authService.getCurrentUser.mockResolvedValue({
      firstName: 'Andrea',
      email: 'user@test.com',
      roles: ['ROLE_CUSTOMER'],
    })

    const authStore = useAuthStore()

    await authStore.fetchCurrentUser()

    expect(authService.getCurrentUser).toHaveBeenCalled()
    expect(authStore.user.email).toBe('user@test.com')
    expect(authStore.role).toBe('ROLE_CUSTOMER')
    expect(authStore.isAuthenticated).toBe(true)
  })

  it('fetchCurrentUser limpia la sesión si no hay usuario autenticado', async () => {
    authService.getCurrentUser.mockRejectedValue(new Error('Unauthorized'))

    const authStore = useAuthStore()

    await authStore.fetchCurrentUser()

    expect(authStore.user).toBeNull()
    expect(authStore.role).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('logout limpia el usuario y el rol', async () => {
    authService.login.mockResolvedValue({
      email: 'user@test.com',
      roles: ['ROLE_CUSTOMER'],
    })

    authService.logout.mockResolvedValue()

    const authStore = useAuthStore()

    await authStore.login({
      email: 'user@test.com',
      password: '123456',
    })

    await authStore.logout()

    expect(authService.logout).toHaveBeenCalled()
    expect(authStore.user).toBeNull()
    expect(authStore.role).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('clearSession olvida el usuario sin llamar al backend', async () => {
    authService.login.mockResolvedValue({
      email: 'user@test.com',
      roles: ['ROLE_CUSTOMER'],
    })

    const authStore = useAuthStore()

    await authStore.login({
      email: 'user@test.com',
      password: '123456',
    })

    authStore.clearSession()

    expect(authService.logout).not.toHaveBeenCalled()
    expect(authStore.user).toBeNull()
    expect(authStore.role).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })
})