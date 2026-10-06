import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import TheHeader from './TheHeader.vue'
import { useAuthStore } from '../stores/auth'
import { ROLES } from '../constants/roles'

const ROUTE_NAMES = ['carta', 'mi-pedido', 'perfil', 'cesta', 'cocina', 'reparto', 'admin', 'login', 'register']

async function mountHeaderAs(role) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ROUTE_NAMES.map((name) => ({
      path: name === 'carta' ? '/' : `/${name}`,
      name,
      component: { template: '<div />' },
    })),
  })
  router.push('/')
  await router.isReady()

  setActivePinia(createPinia())
  const authStore = useAuthStore()
  if (role) {
    authStore.user = { firstName: 'Luisa', lastName: 'Cortes', email: 'luisa@test.com', roles: [role] }
    authStore.role = role
  }

  return mount(TheHeader, { global: { plugins: [router] } })
}

describe('TheHeader - nombre del rol', () => {
  it.each([
    [ROLES.ADMIN, 'Administrador'],
    [ROLES.COOK, 'Cocina'],
    [ROLES.DELIVERY, 'Repartidor'],
    [ROLES.CUSTOMER, 'Cliente'],
  ])('con el rol %s muestra "%s" antes del avatar', async (role, label) => {
    const wrapper = await mountHeaderAs(role)

    const roleLabel = wrapper.find('.the-header__role')

    expect(roleLabel.text()).toBe(label)
    expect(roleLabel.element.nextElementSibling.classList.contains('user-menu')).toBe(true)
  })

  it('sin sesión no muestra ningún rol', async () => {
    const wrapper = await mountHeaderAs(ROLES.GUEST)

    expect(wrapper.find('.the-header__role').exists()).toBe(false)
  })
})