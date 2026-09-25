import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import OrderConfirmation from './OrderConfirmation.vue'
import { useCartStore } from '../stores/cart'
import { useCheckoutStore } from '../stores/checkout'
import { useExclusiveOffersStore } from '../stores/exclusiveOffers'
import * as ordersService from '../services/orders.service'

const routes = [
  { path: '/', name: 'carta', component: { template: '<div>Carta</div>' } },
  { path: '/cesta', name: 'cesta', component: { template: '<div>Cesta</div>' } },
  { path: '/mi-pedido', name: 'mi-pedido', component: { template: '<div>Mi pedido</div>' } },
]

async function mountOrderConfirmation() {
  const router = createRouter({ history: createWebHistory(), routes })
  router.push('/cesta')
  await router.isReady()

  setActivePinia(createPinia())
  const cartStore = useCartStore()
  const checkoutStore = useCheckoutStore()

  const wrapper = mount(OrderConfirmation, {
    global: { plugins: [router] },
  })

  return { wrapper, cartStore, checkoutStore, router }
}

describe('OrderConfirmation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('disables the confirm button when the cart is empty', async () => {
    const { wrapper } = await mountOrderConfirmation()

    expect(wrapper.find('.order-confirmation__button').attributes('disabled')).toBeDefined()
  })

  it('disables the confirm button when dining in without a payment method', async () => {
    const { wrapper, cartStore } = await mountOrderConfirmation()
    cartStore.addProduct({ id: 1, name: 'Salmon Roll', price: 10 })
    await flushPromises()

    expect(wrapper.find('.order-confirmation__button').attributes('disabled')).toBeDefined()
  })

  it('enables the confirm button once a dine-in payment method is selected', async () => {
    const { wrapper, cartStore, checkoutStore } = await mountOrderConfirmation()
    cartStore.addProduct({ id: 1, name: 'Salmon Roll', price: 10 })
    checkoutStore.setPaymentMethod('cashier')
    await flushPromises()

    expect(wrapper.find('.order-confirmation__button').attributes('disabled')).toBeUndefined()
  })

  it('does not show the discount row when no active offer applies', async () => {
    const { wrapper, cartStore } = await mountOrderConfirmation()
    cartStore.addProduct({ id: 1, name: 'Salmon Roll', price: 10 })
    await flushPromises()

    expect(wrapper.find('.order-confirmation__row--discount').exists()).toBe(false)
  })

  it('shows the discount row with the amount saved when an active offer applies', async () => {
    const { wrapper, cartStore } = await mountOrderConfirmation()
    const offersStore = useExclusiveOffersStore()
    offersStore.offers = [{ productId: 1, discountPercentage: 15, expiresAt: null }]
    cartStore.addProduct({ id: 1, name: 'Salmon Roll', price: 10 })
    await flushPromises()

    // 10 € * 15% = 1,50 € de descuento
    expect(wrapper.find('.order-confirmation__row--discount').text()).toContain('1.50')
  })

  it('sends the mapped cart items and chef note, then empties the cart and navigates to the tracking view', async () => {
    vi.spyOn(ordersService, 'createOrder').mockResolvedValue({ id: 99 })
    const { wrapper, cartStore, checkoutStore, router } = await mountOrderConfirmation()
    cartStore.addProduct({ id: 1, name: 'Salmon Roll', price: 10 })
    checkoutStore.setPaymentMethod('cashier')
    checkoutStore.setChefNote('Sin wasabi')
    await flushPromises()

    await wrapper.find('.order-confirmation__button').trigger('click')
    await flushPromises()

    expect(ordersService.createOrder).toHaveBeenCalledWith({
      items: [{ productId: 1, quantity: 1 }],
      chefNote: 'Sin wasabi',
    })
    expect(cartStore.isEmpty).toBe(true)
    expect(router.currentRoute.value.name).toBe('mi-pedido')
  })

  it('shows an error message and keeps the cart when the confirmation fails', async () => {
    vi.spyOn(ordersService, 'createOrder').mockRejectedValue(new Error('network error'))
    const { wrapper, cartStore, checkoutStore, router } = await mountOrderConfirmation()
    cartStore.addProduct({ id: 1, name: 'Salmon Roll', price: 10 })
    checkoutStore.setPaymentMethod('cashier')
    await flushPromises()

    await wrapper.find('.order-confirmation__button').trigger('click')
    await flushPromises()

    expect(wrapper.find('.order-confirmation__error').text()).toBe(
      'No se ha podido confirmar el pedido. Inténtalo de nuevo.',
    )
    expect(cartStore.isEmpty).toBe(false)
    expect(router.currentRoute.value.name).toBe('cesta')
  })
})
