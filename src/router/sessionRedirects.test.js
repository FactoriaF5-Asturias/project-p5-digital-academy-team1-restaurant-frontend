import { describe, it, expect, vi } from 'vitest'
import { createSessionRedirects } from './sessionRedirects'
import { ROLES } from '../constants/roles'

function buildRouter(currentRoles) {
  return {
    currentRoute: { value: { meta: { roles: currentRoles } } },
    push: vi.fn(),
  }
}

function buildAuthStore({ role = ROLES.GUEST, isAuthenticated = false } = {}) {
  const store = {
    role,
    isAuthenticated,
    clearSession: vi.fn(() => {
      store.role = ROLES.GUEST
      store.isAuthenticated = false
    }),
  }
  return store
}

describe('sessionRedirects', () => {
  describe('onUnauthorized', () => {
    it('olvida la sesión y manda a iniciar sesión si la vista era privada', () => {
      const router = buildRouter([ROLES.ADMIN])
      const authStore = buildAuthStore({ role: ROLES.ADMIN, isAuthenticated: true })

      createSessionRedirects(router, authStore).onUnauthorized()

      expect(authStore.clearSession).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith({ name: 'login' })
    })

    it('deja al usuario en la vista si también la puede ver un invitado', () => {
      const router = buildRouter([ROLES.GUEST, ROLES.CUSTOMER])
      const authStore = buildAuthStore({ role: ROLES.CUSTOMER, isAuthenticated: true })

      createSessionRedirects(router, authStore).onUnauthorized()

      expect(authStore.clearSession).toHaveBeenCalled()
      expect(router.push).not.toHaveBeenCalled()
    })
  })

  describe('onForbidden', () => {
    it('manda a acceso denegado al usuario con sesión', () => {
      const router = buildRouter([ROLES.ADMIN])
      const authStore = buildAuthStore({ role: ROLES.COOK, isAuthenticated: true })

      createSessionRedirects(router, authStore).onForbidden()

      expect(router.push).toHaveBeenCalledWith({ name: 'acceso-denegado' })
    })

    it('no mueve al invitado (p. ej. cuando /auth/me responde 403)', () => {
      const router = buildRouter([ROLES.GUEST, ROLES.CUSTOMER])
      const authStore = buildAuthStore()

      createSessionRedirects(router, authStore).onForbidden()

      expect(router.push).not.toHaveBeenCalled()
    })
  })
})