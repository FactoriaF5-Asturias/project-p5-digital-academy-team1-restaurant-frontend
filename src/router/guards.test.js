import { describe, it, expect } from 'vitest'
import {
  ACCESS_DENIED_ROUTE,
  canAccess,
  getDeniedRedirectFor,
  getRedirectFor,
  isGuestOnlyRoute,
  isUnknownRoute,
} from './guards'
import { ROLES } from '../constants/roles'

function buildRoute(roles) {
  return { meta: { roles }, matched: [{}] }
}

describe('guards', () => {
  describe('canAccess', () => {
    it('permite el acceso si el rol está en meta.roles', () => {
      const route = buildRoute([ROLES.CUSTOMER, ROLES.ADMIN])

      expect(canAccess(route, ROLES.ADMIN)).toBe(true)
    })

    it('deniega el acceso si el rol no está en meta.roles', () => {
      const route = buildRoute([ROLES.ADMIN])

      expect(canAccess(route, ROLES.COOK)).toBe(false)
    })

    it('trata al invitado (null) como un rol más', () => {
      const route = buildRoute([ROLES.GUEST])

      expect(canAccess(route, ROLES.GUEST)).toBe(true)
      expect(canAccess(route, ROLES.CUSTOMER)).toBe(false)
    })

    it('una ruta sin meta.roles es pública', () => {
      expect(canAccess({ meta: {} }, ROLES.GUEST)).toBe(true)
    })
  })

  describe('getRedirectFor', () => {
    it('manda al invitado a iniciar sesión', () => {
      expect(getRedirectFor(ROLES.GUEST)).toEqual({ name: 'login' })
    })

    it('devuelve a la carta al usuario logueado que abre una URL que no existe', () => {
      expect(getRedirectFor(ROLES.COOK)).toEqual({ name: 'carta' })
    })
  })

  describe('isGuestOnlyRoute', () => {
    it('detecta una ruta que solo puede ver el invitado', () => {
      expect(isGuestOnlyRoute(buildRoute([ROLES.GUEST]))).toBe(true)
    })

    it('no marca una ruta compartida con usuarios logueados', () => {
      expect(isGuestOnlyRoute(buildRoute([ROLES.GUEST, ROLES.CUSTOMER]))).toBe(false)
    })

    it('una ruta pública no es solo para invitados', () => {
      expect(isGuestOnlyRoute({ meta: {} })).toBe(false)
    })
  })

  describe('getDeniedRedirectFor', () => {
    it('manda al invitado a iniciar sesión', () => {
      const route = buildRoute([ROLES.ADMIN])

      expect(getDeniedRedirectFor(route, ROLES.GUEST)).toEqual({ name: 'login' })
    })

    it('devuelve a la carta al usuario logueado que abre una vista solo de invitados', () => {
      const route = buildRoute([ROLES.GUEST])

      expect(getDeniedRedirectFor(route, ROLES.CUSTOMER)).toEqual({ name: 'carta' })
    })

    it('manda a acceso denegado al usuario logueado que abre una vista de otro rol', () => {
      const route = buildRoute([ROLES.ADMIN])

      expect(getDeniedRedirectFor(route, ROLES.COOK)).toEqual({ name: ACCESS_DENIED_ROUTE })
    })
  })

  describe('isUnknownRoute', () => {
    it('detecta una URL que no coincide con ninguna ruta', () => {
      expect(isUnknownRoute({ matched: [] })).toBe(true)
    })

    it('no marca como desconocida una ruta existente', () => {
      expect(isUnknownRoute({ matched: [{}] })).toBe(false)
    })
  })
})