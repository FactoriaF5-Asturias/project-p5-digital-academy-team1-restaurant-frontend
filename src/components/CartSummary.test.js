import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import CartSummary from './CartSummary.vue'
import { useCartStore } from '../stores/cart'

const routes = [
  { path: '/', name: 'carta', component: { template: '<div>Carta</div>' } },
  { path: '/cesta', name: 'cesta', component: { template: '<div>Cesta</div>' } },
]

const productA = { id: 1, name: 'Salmon Roll', price: 10 }

async function mountCartSummary() {
  const router = createRouter({ history: createWebHistory(), routes })
  router.push('/cesta')
  await router.isReady()

  setActivePinia(createPinia())
  const cartStore = useCartStore()

  const wrapper = mount(CartSummary, {
    global: { plugins: [router] },
  })

  return { wrapper, cartStore }
}

describe('CartSummary', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('shows the empty state with a link back to the carta when there are no products', async () => {
    const { wrapper } = await mountCartSummary()

    expect(wrapper.text()).toContain('Tu cesta está vacía')
    expect(wrapper.findComponent({ name: 'RouterLink' }).props('to')).toEqual({ name: 'carta' })
  })

  it('renders a line with name, unit price, quantity and subtotal', async () => {
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Salmon Roll')
    expect(wrapper.text()).toContain('10,00')
    expect(wrapper.find('.cart-summary__quantity-value').text()).toBe('1')
  })

  it('shows subtotal, IVA and total for the whole cart', async () => {
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    cartStore.incrementQuantity(productA.id)
    await wrapper.vm.$nextTick()

    // 2 * 10 = 20 subtotal, 10% IVA = 2, total = 22
    const totalsText = wrapper.find('.cart-summary__totals').text()
    expect(totalsText).toContain('20,00')
    expect(totalsText).toContain('2,00')
    expect(totalsText).toContain('22,00')
  })

  it('increases the quantity when clicking the + button', async () => {
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    await wrapper.vm.$nextTick()

    await wrapper.find('[aria-label="Aumentar cantidad"]').trigger('click')

    expect(cartStore.items[0].quantity).toBe(2)
  })

  it('decreases the quantity without asking for confirmation when above 1', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    cartStore.incrementQuantity(productA.id)
    await wrapper.vm.$nextTick()

    await wrapper.find('[aria-label="Reducir cantidad"]').trigger('click')

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(cartStore.items[0].quantity).toBe(1)
  })

  it('asks for confirmation before removing a line when quantity is 1, and removes it if confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    await wrapper.vm.$nextTick()

    await wrapper.find('[aria-label="Reducir cantidad"]').trigger('click')

    expect(window.confirm).toHaveBeenCalled()
    expect(cartStore.items).toEqual([])
  })

  it('keeps the line when the user cancels the confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    await wrapper.vm.$nextTick()

    await wrapper.find('[aria-label="Reducir cantidad"]').trigger('click')

    expect(cartStore.items).toHaveLength(1)
  })

  it('removes the line when clicking the remove button and confirming', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    await wrapper.vm.$nextTick()

    await wrapper.find('[aria-label="Eliminar Salmon Roll de la cesta"]').trigger('click')

    expect(cartStore.items).toEqual([])
  })
})
