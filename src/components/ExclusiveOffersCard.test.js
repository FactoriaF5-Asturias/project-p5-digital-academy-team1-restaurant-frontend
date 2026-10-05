import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ExclusiveOffersCard from './ExclusiveOffersCard.vue'
import * as exclusiveOffersService from '../services/exclusiveOffers.service'

let wrappers = []

function mountCard() {
  const pinia = createPinia()
  setActivePinia(pinia)

  const wrapper = mount(ExclusiveOffersCard, {
    global: {
      plugins: [pinia],
    },
  })

  wrappers.push(wrapper)

  return wrapper
}

function buildOffer(overrides = {}) {
  return {
    id: 'offer-1',
    productId: 1,
    productName: 'Hello Edamame',
    originalPrice: 6.5,
    finalPrice: 5.53,
    discountRate: 15,
    expiresAt: null,
    coupon: null,
    used: false,
    ...overrides,
  }
}

describe('ExclusiveOffersCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    })

    vi.spyOn(
      exclusiveOffersService,
      'getExclusiveOffers',
    ).mockResolvedValue({
      offers: [],
    })
  })

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount())
    wrappers = []

    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows a loading message while fetching offers', async () => {
    let resolveFetch

    exclusiveOffersService.getExclusiveOffers.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    const wrapper = mountCard()

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Cargando tus ofertas...')

    resolveFetch({ offers: [] })

    await flushPromises()

    expect(wrapper.text()).not.toContain('Cargando tus ofertas...')
  })

  it('shows an error message when offers fail to load', async () => {
    exclusiveOffersService.getExclusiveOffers.mockRejectedValue(
      new Error('Network error'),
    )

    const wrapper = mountCard()

    await flushPromises()

    expect(wrapper.text()).toContain(
      'No se han podido cargar tus ofertas exclusivas',
    )
  })

  it('shows the empty state when there are no offers', async () => {
    const wrapper = mountCard()

    await flushPromises()

    expect(wrapper.text()).toContain(
      'Todavía no tienes ofertas exclusivas desbloqueadas.',
    )
  })

  it('renders active offers and excludes expired offers', async () => {
    exclusiveOffersService.getExclusiveOffers.mockResolvedValue({
      offers: [
        buildOffer(),
        buildOffer({
          id: 'offer-2',
          productId: 2,
          productName: 'Kaisen Init',
          discountRate: 20,
          expiresAt: '2000-01-01T00:00:00',
          coupon: 'OLD20',
        }),
      ],
    })

    const wrapper = mountCard()

    await flushPromises()

    const cards = wrapper.findAll('.exclusive-offers__card')

    expect(cards).toHaveLength(1)
    expect(cards[0].text()).toContain('Hello Edamame')
    expect(cards[0].text()).toContain('15% de descuento')
    expect(wrapper.text()).not.toContain('Kaisen Init')
  })

  it('does not render used offers', async () => {
    exclusiveOffersService.getExclusiveOffers.mockResolvedValue({
      offers: [
        buildOffer(),
        buildOffer({
          id: 'used-offer',
          productName: 'Used product',
          used: true,
        }),
      ],
    })

    const wrapper = mountCard()

    await flushPromises()

    expect(wrapper.findAll('.exclusive-offers__card')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Used product')
  })

  it('shows the empty state when every offer has been used', async () => {
    exclusiveOffersService.getExclusiveOffers.mockResolvedValue({
      offers: [
        buildOffer({
          used: true,
        }),
      ],
    })

    const wrapper = mountCard()

    await flushPromises()

    expect(wrapper.findAll('.exclusive-offers__card')).toHaveLength(0)
    expect(wrapper.text()).toContain(
      'Todavía no tienes ofertas exclusivas desbloqueadas.',
    )
  })

  it('shows the expiry date when an active offer has one', async () => {
    exclusiveOffersService.getExclusiveOffers.mockResolvedValue({
      offers: [
        buildOffer({
          expiresAt: '2099-12-31T12:00:00',
        }),
      ],
    })

    const wrapper = mountCard()

    await flushPromises()

    expect(wrapper.get('.exclusive-offers__expiry').text()).toContain(
      'Válida hasta el',
    )
    expect(wrapper.get('.exclusive-offers__expiry').text()).toContain(
      '2099',
    )
  })

  it('does not show an expiry date when the offer has none', async () => {
    exclusiveOffersService.getExclusiveOffers.mockResolvedValue({
      offers: [buildOffer()],
    })

    const wrapper = mountCard()

    await flushPromises()

    expect(wrapper.find('.exclusive-offers__expiry').exists()).toBe(false)
  })

  it('does not show a copy button when the offer has no coupon', async () => {
    exclusiveOffersService.getExclusiveOffers.mockResolvedValue({
      offers: [buildOffer()],
    })

    const wrapper = mountCard()

    await flushPromises()

    expect(wrapper.find('.exclusive-offers__copy-btn').exists()).toBe(false)
  })

  it('copies the coupon and shows a confirmation', async () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout'],
    })

    exclusiveOffersService.getExclusiveOffers.mockResolvedValue({
      offers: [
        buildOffer({
          id: 'offer-2',
          productId: 3,
          productName: 'Kaisen Init',
          discountRate: 20,
          coupon: 'KAISEN20',
        }),
      ],
    })

    const wrapper = mountCard()

    await flushPromises()

    const copyButton = wrapper.get('.exclusive-offers__copy-btn')

    expect(copyButton.text()).toBe('Copiar KAISEN20')

    await copyButton.trigger('click')
    await flushPromises()

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'KAISEN20',
    )
    expect(wrapper.get('.exclusive-offers__copy-btn').text()).toBe(
      '¡Copiado!',
    )

    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()
  })

  it('restores the copy button text after two seconds', async () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout'],
    })

    exclusiveOffersService.getExclusiveOffers.mockResolvedValue({
      offers: [
        buildOffer({
          coupon: 'KAISEN20',
        }),
      ],
    })

    const wrapper = mountCard()

    await flushPromises()

    await wrapper.get('.exclusive-offers__copy-btn').trigger('click')
    await flushPromises()

    expect(wrapper.get('.exclusive-offers__copy-btn').text()).toBe(
      '¡Copiado!',
    )

    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()

    expect(wrapper.get('.exclusive-offers__copy-btn').text()).toBe(
      'Copiar KAISEN20',
    )
  })
})