import { describe, it, expect } from 'vitest'
import { ASSIGNABLE_ROLES, ROLES, getRoleLabel } from './roles'

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

  it('el administrador puede asignar todos los roles menos el de invitado', () => {
    expect(ASSIGNABLE_ROLES).toEqual([ROLES.CUSTOMER, ROLES.COOK, ROLES.DELIVERY, ROLES.ADMIN])
    expect(ASSIGNABLE_ROLES).not.toContain(ROLES.GUEST)
    expect(Object.isFrozen(ASSIGNABLE_ROLES)).toBe(true)
  })
})