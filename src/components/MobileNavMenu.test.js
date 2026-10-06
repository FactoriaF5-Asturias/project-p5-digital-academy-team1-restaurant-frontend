import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import MobileNavMenu from './MobileNavMenu.vue'
import { MOBILE_NAV_ID } from '../constants/navigation'

const LINKS = [
  { to: { name: 'carta' }, label: 'Carta' },
  { to: { name: 'cesta' }, label: 'Cesta', showsCartCount: true },
]

const USER = { firstName: 'Luisa', lastName: 'Cortes', email: 'luisa@test.com' }

async function mountMenu(props = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ['carta', 'cesta', 'login', 'register'].map((name) => ({
      path: name === 'carta' ? '/' : `/${name}`,
      name,
      component: { template: '<div />' },
    })),
  })
  router.push('/')
  await router.isReady()

  return mount(MobileNavMenu, {
    props: { links: LINKS, ...props },
    global: { plugins: [router] },
  })
}

describe('MobileNavMenu', () => {
  it('tiene el id que usa el botón de menú en aria-controls', async () => {
    const wrapper = await mountMenu()

    expect(wrapper.find('nav').attributes('id')).toBe(MOBILE_NAV_ID)
  })

  it('pinta los enlaces del rol con estilo móvil', async () => {
    const wrapper = await mountMenu({ cartCount: 2 })

    const mobileLinks = wrapper.findAll('.nav-links__link--mobile')

    expect(mobileLinks.map((link) => link.text())).toEqual(['Carta', 'Cesta2'])
  })

  it('sin sesión ofrece iniciar sesión y registrarse', async () => {
    const wrapper = await mountMenu()

    expect(wrapper.text()).toContain('Iniciar sesión')
    expect(wrapper.text()).toContain('Registrarse')
    expect(wrapper.text()).not.toContain('Cerrar sesión')
  })

  it('con sesión muestra al usuario y el botón de cerrar sesión', async () => {
    const wrapper = await mountMenu({ user: USER, role: 'ROLE_CUSTOMER' })

    expect(wrapper.text()).toContain('Luisa Cortes')
    expect(wrapper.find('button').text()).toBe('Cerrar sesión')
    expect(wrapper.text()).not.toContain('Iniciar sesión')
  })

  it('avisa al padre al pulsar un enlace de navegación', async () => {
    const wrapper = await mountMenu()

    await wrapper.find('.nav-links__link').trigger('click')

    expect(wrapper.emitted('navigate')).toHaveLength(1)
  })

  it('avisa al padre al pulsar iniciar sesión', async () => {
    const wrapper = await mountMenu()

    await wrapper.find('.mobile-nav__action').trigger('click')

    expect(wrapper.emitted('navigate')).toHaveLength(1)
  })

  it('avisa al padre al pulsar cerrar sesión', async () => {
    const wrapper = await mountMenu({ user: USER })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('logout')).toHaveLength(1)
  })
})