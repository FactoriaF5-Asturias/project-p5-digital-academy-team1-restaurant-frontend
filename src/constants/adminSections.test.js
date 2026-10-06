import { describe, it, expect } from 'vitest'
import { ADMIN_SECTIONS } from './adminSections'
import router from '../router'

describe('ADMIN_SECTIONS', () => {
  it('cada sección disponible apunta a una ruta que existe', () => {
    ADMIN_SECTIONS.filter((section) => section.available).forEach((section) => {
      expect(router.hasRoute(section.routeName)).toBe(true)
    })
  })

  it('las secciones sin backend todavía no tienen ruta', () => {
    ADMIN_SECTIONS.filter((section) => !section.available).forEach((section) => {
      expect(section.routeName).toBeNull()
    })
  })

  it('las claves no se repiten', () => {
    const keys = ADMIN_SECTIONS.map((section) => section.key)

    expect(new Set(keys).size).toBe(keys.length)
  })

  it('no se puede modificar por error', () => {
    expect(Object.isFrozen(ADMIN_SECTIONS)).toBe(true)
  })
})