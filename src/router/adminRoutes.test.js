import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import router from './index'
import { useAuthStore } from '../stores/auth'
import { ROLES } from '../constants/roles'

async function navigateAs(role, path) {
  useAuthStore().role = role
  await router.push(path)
  return router.currentRoute.value.name
}

describe('router - secciones del admin', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await router.push('/')
  })

  it('/admin muestra el inicio del panel', async () => {
    expect(await navigateAs(ROLES.ADMIN, '/admin')).toBe('admin')
  })

  it('cada sección tiene su propia URL', async () => {
    expect(await navigateAs(ROLES.ADMIN, '/admin/productos')).toBe('admin-productos')
    expect(await navigateAs(ROLES.ADMIN, '/admin/facturacion')).toBe('admin-facturacion')
    expect(await navigateAs(ROLES.ADMIN, '/admin/resumen-ventas')).toBe('admin-resumen-ventas')
    expect(await navigateAs(ROLES.ADMIN, '/admin/kpi')).toBe('admin-kpi')
    expect(await navigateAs(ROLES.ADMIN, '/admin/usuarios')).toBe('admin-usuarios')
  })

  it('un cocinero no puede entrar en una sección del admin', async () => {
    expect(await navigateAs(ROLES.COOK, '/admin/facturacion')).toBe('acceso-denegado')
  })

  it('un invitado que entra en una sección del admin va a iniciar sesión', async () => {
    expect(await navigateAs(ROLES.GUEST, '/admin/productos')).toBe('login')
  })
})