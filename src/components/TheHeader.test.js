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
]

async function mountHeader() {
  const router = createRouter({ history: createWebHistory(), routes })
  router.push('/')
  await router.isReady()

  const pinia = createPinia()
  setActivePinia(pinia)

  const wrapper = mount(TheHeader, {
    global: { plugins: [router, pinia] },
  })
  return { wrapper }
}

describe('TheHeader', () => {
  it('renderiza el logo y los 7 enlaces de navegación', async () => {
    const { wrapper } = await mountHeader()

    const links = wrapper.findAllComponents({ name: 'RouterLink' })
    const labels = links.map((link) => link.text()).filter(Boolean)

    expect(wrapper.find('img[alt="GitSushi"]').exists()).toBe(true)
    expect(labels).toEqual(
      expect.arrayContaining(['Carta', 'Mi pedido', 'Perfil', 'Cesta', 'Cocina', 'Reparto', 'Admin'])
    )
  })

  it('enlaza "Cesta" a la ruta correspondiente (navegación sin recarga)', async () => {
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

    expect(wrapper.find('.rounded-full').exists()).toBe(false)
  })

  it('camino feliz: muestra el total de unidades cuando hay productos en la cesta', async () => {
    const { wrapper } = await mountHeader()
    const cartStore = useCartStore()

    cartStore.items = [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 3 },
    ]
    await wrapper.vm.$nextTick()

    const badge = wrapper.find('.rounded-full')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('5')
  })
})