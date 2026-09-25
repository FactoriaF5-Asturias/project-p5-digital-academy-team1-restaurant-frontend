import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ExclusiveOffersCard from './ExclusiveOffersCard.vue'
import * as exclusiveOffersMock from '../mocks/exclusiveOffers.mock'

function mountCard() {
  setActivePinia(createPinia())
  return mount(ExclusiveOffersCard)
}

describe('ExclusiveOffersCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })
  })

  it('shows a loading message while the offers are being fetched', async () => {
    let resolveFetch
    vi.spyOn(exclusiveOffersMock, 'getExclusiveOffers').mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    const wrapper = mountCard()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Cargando tus ofertas...')

    resolveFetch({ offers: [] })
    await flushPromises()
  })

  it('shows an error message when the offers fail to load', async () => {
    vi.spyOn(exclusiveOffersMock, 'getExclusiveOffers').mockRejectedValue(new Error('network error'))

    const wrapper = mountCard()
    await flushPromises()

    expect(wrapper.text()).toContain('No se han podido cargar tus ofertas exclusivas')
  })

  it('shows the empty state when there are no active offers', async () => {
    vi.spyOn(exclusiveOffersMock, 'getExclusiveOffers').mockResolvedValue({ offers: [] })

    const wrapper = mountCard()
    await flushPromises()

    expect(wrapper.text()).toContain('Todavía no tienes ofertas exclusivas desbloqueadas.')
  })

  it('renders only the active offers, with product, discount and expiry date', async () => {
    vi.spyOn(exclusiveOffersMock, 'getExclusiveOffers').mockResolvedValue({
      offers: [
        {
          id: 'offer-1',
          productId: 1,
          productName: 'Hello Edamame',
          discountPercentage: 15,
          expiresAt: null,
          couponCode: null,
        },
        {
          id: 'offer-2',
          productId: 2,
          productName: 'Kaisen Init',
          discountPercentage: 20,
          expiresAt: '2000-01-01T00:00:00',
          couponCode: 'OLD20',
        },
      ],
    })

    const wrapper = mountCard()
    await flushPromises()

    const cards = wrapper.findAll('.exclusive-offers__card')
    expect(cards).toHaveLength(1)
    expect(cards[0].text()).toContain('Hello Edamame')
    expect(cards[0].text()).toContain('15% de descuento')
  })

  it('does not show a copy button when the offer has no coupon code', async () => {
    vi.spyOn(exclusiveOffersMock, 'getExclusiveOffers').mockResolvedValue({
      offers: [
        {
          id: 'offer-1',
          productId: 1,
          productName: 'Hello Edamame',
          discountPercentage: 15,
          expiresAt: null,
          couponCode: null,
        },
      ],
    })

    const wrapper = mountCard()
    await flushPromises()

    expect(wrapper.find('.exclusive-offers__copy-btn').exists()).toBe(false)
  })

  it('copies the coupon code to the clipboard and shows a confirmation when clicking the copy button', async () => {
    vi.spyOn(exclusiveOffersMock, 'getExclusiveOffers').mockResolvedValue({
      offers: [
        {
          id: 'offer-2',
          productId: 3,
          productName: 'Kaisen Init',
          discountPercentage: 20,
          expiresAt: '2099-12-31T23:59:59',
          couponCode: 'KAISEN20',
        },
      ],
    })

    const wrapper = mountCard()
    await flushPromises()

    const copyButton = wrapper.find('.exclusive-offers__copy-btn')
    expect(copyButton.text()).toBe('Copiar KAISEN20')

    await copyButton.trigger('click')
    await flushPromises()

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('KAISEN20')
    expect(wrapper.find('.exclusive-offers__copy-btn').text()).toBe('¡Copiado!')
  })

  it('reverts the copy confirmation back to the coupon code after a few seconds', async () => {
    vi.useFakeTimers()
    vi.spyOn(exclusiveOffersMock, 'getExclusiveOffers').mockResolvedValue({
      offers: [
        {
          id: 'offer-2',
          productId: 3,
          productName: 'Kaisen Init',
          discountPercentage: 20,
          expiresAt: null,
          couponCode: 'KAISEN20',
        },
      ],
    })

    const wrapper = mountCard()
    await flushPromises()

    await wrapper.find('.exclusive-offers__copy-btn').trigger('click')
    await flushPromises()
    expect(wrapper.find('.exclusive-offers__copy-btn').text()).toBe('¡Copiado!')

    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.exclusive-offers__copy-btn').text()).toBe('Copiar KAISEN20')

    vi.useRealTimers()
  })
})
