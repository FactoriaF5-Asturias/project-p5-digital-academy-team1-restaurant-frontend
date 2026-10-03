import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import CartSummary from './CartSummary.vue'
import { useCartStore } from '../stores/cart'
import { useExclusiveOffersStore } from '../stores/exclusiveOffers'
import { useCheckoutStore } from '../stores/checkout'
import { mount, flushPromises } from '@vue/test-utils'

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
  const offersStore = useExclusiveOffersStore()

  const wrapper = mount(CartSummary, {
    global: { plugins: [router] },
  })

  return { wrapper, cartStore, offersStore }
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

  it('does not show a discount badge or original price when the product has no active offer', async () => {
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.cart-summary__discount-badge').exists()).toBe(false)
    expect(wrapper.find('.cart-summary__line-price-original').exists()).toBe(false)
  })

  it('shows the original price struck through, a discount badge, and reduced totals when the product has an active exclusive offer', async () => {
    const { wrapper, cartStore, offersStore } = await mountCartSummary()
    offersStore.offers = [{ used: false, finalPrice: 8.5, discountRate: 15, product: { id: productA.id } }]
    cartStore.addProduct(productA)
    await wrapper.vm.$nextTick()

    const line = wrapper.find('.cart-summary__line')
    expect(line.find('.cart-summary__line-price-original').text()).toContain('10,00')
    expect(line.find('.cart-summary__discount-badge').text()).toContain('15%')

    // 10 * 0,85 = 8,50 subtotal, 10% IVA = 0,85, total = 9,35
    const totalsText = wrapper.find('.cart-summary__totals').text()
    expect(totalsText).toContain('8,50')
    expect(totalsText).toContain('0,85')
    expect(totalsText).toContain('9,35')
  })

  it('increases the quantity when clicking the + button', async () => {
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    await wrapper.vm.$nextTick()

    await wrapper.find('[aria-label="Aumentar cantidad"]').trigger('click')

    expect(cartStore.items[0].quantity).toBe(2)
  })

    it('decreases the quantity without asking for confirmation when above 1', async () => {
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    cartStore.incrementQuantity(productA.id)
    await wrapper.vm.$nextTick()

    await wrapper.find('[aria-label="Reducir cantidad"]').trigger('click')

    expect(wrapper.find('.confirm-dialog').exists()).toBe(false)
    expect(cartStore.items[0].quantity).toBe(1)
  })

  it('opens the app confirm dialog when decreasing a line with quantity 1', async () => {
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    await wrapper.vm.$nextTick()

    await wrapper.find('[aria-label="Reducir cantidad"]').trigger('click')

    const dialog = wrapper.find('.confirm-dialog')
    expect(dialog.exists()).toBe(true)
    expect(dialog.text()).toContain('Solo queda 1 unidad.')
    expect(dialog.find('strong').text()).toBe('"Salmon Roll"')
    expect(cartStore.items).toHaveLength(1)
  })

  it('removes the line when confirming the dialog', async () => {
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    await wrapper.vm.$nextTick()

    await wrapper.find('[aria-label="Reducir cantidad"]').trigger('click')
    await wrapper.find('.confirm-dialog__button--danger').trigger('click')

    expect(cartStore.items).toEqual([])
    expect(wrapper.find('.confirm-dialog').exists()).toBe(false)
  })

  it('keeps the line when the user cancels the dialog', async () => {
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    await wrapper.vm.$nextTick()

    await wrapper.find('[aria-label="Reducir cantidad"]').trigger('click')
    await wrapper.findAll('.confirm-dialog__button')[0].trigger('click')

    expect(cartStore.items).toHaveLength(1)
    expect(wrapper.find('.confirm-dialog').exists()).toBe(false)
  })

  it('asks for confirmation with the remove button even when there are several units', async () => {
    const { wrapper, cartStore } = await mountCartSummary()
    cartStore.addProduct(productA)
    cartStore.incrementQuantity(productA.id)
    await wrapper.vm.$nextTick()

    await wrapper.find('[aria-label="Eliminar Salmon Roll de la cesta"]').trigger('click')

    const dialog = wrapper.find('.confirm-dialog')
    expect(dialog.exists()).toBe(true)
    expect(dialog.text()).not.toContain('Solo queda 1 unidad.')

    await wrapper.find('.confirm-dialog__button--danger').trigger('click')

    expect(cartStore.items).toEqual([])
  })
  it('shows the delivery fee and an updated total when the channel is domicilio', async () => {
    const { wrapper, cartStore } = await mountCartSummary()
    const checkoutStore = useCheckoutStore()
    cartStore.addProduct(productA)
    checkoutStore.setChannel('domicilio')
    await flushPromises()

    // 10 € subtotal + 1 € IVA (10%) + 2,50 € de envío = 13,50 €
    const totalsText = wrapper.find('.cart-summary__totals').text()
    expect(totalsText).toContain('Gastos de envío')
    expect(totalsText).toContain('13,50')
  })
})
