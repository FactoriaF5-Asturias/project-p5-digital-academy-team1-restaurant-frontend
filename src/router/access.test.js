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

describe('router - acceso por rol', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await router.push('/')
  })

  it('el invitado entra en la carta', async () => {
    expect(await navigateAs(ROLES.GUEST, '/')).toBe('carta')
  })

  it('el invitado que intenta entrar en admin va a iniciar sesión', async () => {
    expect(await navigateAs(ROLES.GUEST, '/admin')).toBe('login')
  })

  it('el invitado entra en la cesta para poder pedir en sala sin registrarse', async () => {
    expect(await navigateAs(ROLES.GUEST, '/cesta')).toBe('cesta')
  })

  it('el cliente entra en la cesta', async () => {
    expect(await navigateAs(ROLES.CUSTOMER, '/cesta')).toBe('cesta')
  })

  it('el cliente que intenta entrar en cocina ve acceso denegado', async () => {
    expect(await navigateAs(ROLES.CUSTOMER, '/cocina')).toBe('acceso-denegado')
  })

  it('el cocinero que intenta entrar en admin ve acceso denegado', async () => {
    expect(await navigateAs(ROLES.COOK, '/admin')).toBe('acceso-denegado')
  })

  it('el usuario logueado que abre el login vuelve a la carta', async () => {
    expect(await navigateAs(ROLES.CUSTOMER, '/login')).toBe('carta')
  })

  it('el invitado que intenta ver acceso denegado va a iniciar sesión', async () => {
    expect(await navigateAs(ROLES.GUEST, '/acceso-denegado')).toBe('login')
  })

  it('el admin entra en cocina, reparto y admin', async () => {
    expect(await navigateAs(ROLES.ADMIN, '/cocina')).toBe('cocina')
    expect(await navigateAs(ROLES.ADMIN, '/reparto')).toBe('reparto')
    expect(await navigateAs(ROLES.ADMIN, '/admin')).toBe('admin')
  })

  it('el repartidor entra en reparto pero no en cocina', async () => {
    expect(await navigateAs(ROLES.DELIVERY, '/reparto')).toBe('reparto')
    expect(await navigateAs(ROLES.DELIVERY, '/cocina')).toBe('acceso-denegado')
  })

  it('una URL que no existe manda al invitado a iniciar sesión', async () => {
    expect(await navigateAs(ROLES.GUEST, '/user')).toBe('login')
  })

  it('una URL que no existe devuelve a la carta al usuario logueado', async () => {
    expect(await navigateAs(ROLES.CUSTOMER, '/user')).toBe('carta')
  })
})