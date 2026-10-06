import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import TheHeader from './TheHeader.vue'
import { useCartStore } from '../stores/cart'

const routes = [
  { path: '/', name: 'carta', component: { template: '<div>Carta</div>' } },
  { path: '/mi-pedido', name: 'mi-pedido', component: { template: '<div>Mi pedido</div>' } },
  { path: '/perfil', name: 'perfil', component: { template: '<div>Perfil</div>' } },
  { path: '/cesta', name: 'cesta', component: { template: '<div>Cesta</div>' } },
  { path: '/cocina', name: 'cocina', component: { template: '<div>Cocina</div>' } },
  { path: '/reparto', name: 'reparto', component: { template: '<div>Reparto</div>' } },
  { path: '/admin', name: 'admin', component: { template: '<div>Admin</div>' } },
  { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
  { path: '/register', name: 'register', component: { template: '<div>Register</div>' } },
]

async function mountHeader() {
  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  router.push('/')
  await router.isReady()

  const pinia = createPinia()
  setActivePinia(pinia)

  const wrapper = mount(TheHeader, {
    global: {
      plugins: [router, pinia],
    },
  })

  return { wrapper }
}

describe('TheHeader', () => {
  it('renderiza el logo y los enlaces de navegación', async () => {
    const { wrapper } = await mountHeader()

    const links = wrapper.findAllComponents({ name: 'RouterLink' })
    const labels = links.map((link) => link.text()).filter(Boolean)

    expect(wrapper.find('img[alt="GitSushi"]').exists()).toBe(true)

    expect(labels).toEqual(
      expect.arrayContaining([
        'Carta',
        'Mi pedido',
        'Perfil',
        'Cesta',
        'Cocina',
        'Reparto',
        'Admin',
      ])
    )
  })

  it('enlaza "Cesta" a la ruta correspondiente', async () => {
    const { wrapper } = await mountHeader()

    const cestaLink = wrapper
      .findAllComponents({ name: 'RouterLink' })
      .find((link) => link.text() === 'Cesta')

    expect(cestaLink.props('to')).toEqual({ name: 'cesta' })
  })

  it('estado vacío: no muestra el contador cuando la cesta no tiene productos', async () => {
    const { wrapper } = await mountHeader()
    const cartStore = useCartStore()

    cartStore.items = []
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.nav-links__badge').exists()).toBe(false)
  })

  it('camino feliz: muestra el total de unidades cuando hay productos en la cesta', async () => {
    const { wrapper } = await mountHeader()
    const cartStore = useCartStore()

    cartStore.items = [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 3 },
    ]

    await wrapper.vm.$nextTick()

    const badge = wrapper.find('.nav-links__badge')

    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('5')
  })

  it('el menú móvil no está visible al cargar', async () => {
    const { wrapper } = await mountHeader()

    expect(wrapper.findAll('nav').length).toBe(1)
  })

  it('al pulsar el botón de menú, se despliega la navegación móvil', async () => {
    const { wrapper } = await mountHeader()

    const menuButton = wrapper.find(
      'button[aria-label="Menú de navegación"]'
    )

    await menuButton.trigger('click')

    expect(wrapper.findAll('nav').length).toBe(2)
  })

  it('al pulsar el botón de nuevo, el menú móvil se cierra', async () => {
    const { wrapper } = await mountHeader()

    const menuButton = wrapper.find(
      'button[aria-label="Menú de navegación"]'
    )

    await menuButton.trigger('click')
    await menuButton.trigger('click')

    expect(wrapper.findAll('nav').length).toBe(1)
  })

  it('al hacer clic en un enlace permitido del menú móvil, este se cierra', async () => {
    const { wrapper } = await mountHeader()

    const menuButton = wrapper.find(
      'button[aria-label="Menú de navegación"]'
    )

    await menuButton.trigger('click')

    const mobileNav = wrapper.findAll('nav')[1]

    const cestaLink = mobileNav
      .findAllComponents({ name: 'RouterLink' })
      .find((link) => link.text().includes('Cesta'))

    await cestaLink.trigger('click')

    expect(wrapper.findAll('nav').length).toBe(1)
  })

  it('mientras las restricciones están desactivadas, todos los enlaces del menú móvil están accesibles', async () => {
    const { wrapper } = await mountHeader()

    await wrapper
      .find('button[aria-label="Menú de navegación"]')
      .trigger('click')

    const mobileLinks = wrapper
      .findAll('nav')[1]
      .findAllComponents({ name: 'RouterLink' })
      .filter((link) =>
        ['Carta', 'Mi pedido', 'Perfil', 'Cesta', 'Cocina', 'Reparto', 'Admin']
          .includes(link.text())
      )

    expect(mobileLinks).toHaveLength(7)

    mobileLinks.forEach((link) => {
      expect(link.classes()).not.toContain('nav-link--inactive')
    })
  })

  it('al hacer clic en Perfil desde el menú móvil, este se cierra', async () => {
    const { wrapper } = await mountHeader()

    const menuButton = wrapper.find(
      'button[aria-label="Menú de navegación"]'
    )

    await menuButton.trigger('click')

    const perfilLink = wrapper
      .findAll('nav')[1]
      .findAllComponents({ name: 'RouterLink' })
      .find((link) => link.text().includes('Perfil'))

    await perfilLink.trigger('click')

    expect(wrapper.findAll('nav').length).toBe(1)
  })

  it('el botón de menú indica si está abierto y qué menú controla', async () => {
    const { wrapper } = await mountHeader()

    const menuButton = wrapper.find('button[aria-label="Menú de navegación"]')

    expect(menuButton.attributes('aria-expanded')).toBe('false')
    expect(menuButton.attributes('aria-controls')).toBe('mobile-navigation')

    await menuButton.trigger('click')

    expect(menuButton.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('#mobile-navigation').exists()).toBe(true)
  })

  it('muestra los enlaces de iniciar sesión y registrarse', async () => {
    const { wrapper } = await mountHeader()

    expect(wrapper.text()).toContain('Iniciar sesión')
    expect(wrapper.text()).toContain('Registrarse')
  })

  it('los enlaces de autenticación apuntan a login y registro', async () => {
    const { wrapper } = await mountHeader()

    const links = wrapper.findAllComponents({ name: 'RouterLink' })

    const loginLink = links.find(
      (link) => link.text() === 'Iniciar sesión'
    )

    const registerLink = links.find(
      (link) => link.text() === 'Registrarse'
    )

    expect(loginLink.props('to')).toEqual({ name: 'login' })
    expect(registerLink.props('to')).toEqual({ name: 'register' })
  })
})