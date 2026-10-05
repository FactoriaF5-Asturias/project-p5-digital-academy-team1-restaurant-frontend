import { describe, it, expect } from 'vitest'
import { ROLES, getRoleLabel } from './roles'

describe('roles', () => {
  it('traduce cada rol del backend a español', () => {
    expect(getRoleLabel(ROLES.CUSTOMER)).toBe('Cliente')
    expect(getRoleLabel(ROLES.ADMIN)).toBe('Administrador')
    expect(getRoleLabel(ROLES.COOK)).toBe('Cocina')
    expect(getRoleLabel(ROLES.DELIVERY)).toBe('Repartidor')
  })

  it('devuelve texto vacío para el invitado o un rol desconocido', () => {
    expect(getRoleLabel(ROLES.GUEST)).toBe('')
    expect(getRoleLabel('ROLE_UNKNOWN')).toBe('')
  })
})