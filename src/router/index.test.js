import { describe, it, expect } from 'vitest'
import router from './index'

describe('router', () => {
  it('registra una ruta para cada sección principal', () => {
    const paths = router.getRoutes().map((route) => route.path)
    expect(paths).toContain('/')
    expect(paths).toContain('/cesta')
    expect(paths).toContain('/admin')
  })
})
