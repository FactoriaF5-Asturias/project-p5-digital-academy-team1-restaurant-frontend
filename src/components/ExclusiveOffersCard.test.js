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
import { getExclusiveOffers } from '../services/offers.service'

vi.mock('../services/offers.service', () => ({
  getExclusiveOffers: vi.fn(),
  consumeOffer: vi.fn(),
}))

let wrappers = []

function buildOffer(overrides = {}) {
  return {
    id: 1,
    product: {
      id: 1,
      name: 'Hello Edamame',
    },
    originalPrice: 6.5,
    finalPrice: 5.53,
    discountRate: 15,
    coupon: null,
    used: false,
    ...overrides,
  }
}

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

describe('ExclusiveOffersCard', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    getExclusiveOffers.mockResolvedValue([])

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    })
  })

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount())
    wrappers = []

    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows loading while fetching offers', async () => {
    let resolveFetch

    getExclusiveOffers.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    const wrapper = mountCard()

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Cargando tus ofertas...')

    resolveFetch([])

    await flushPromises()

    expect(wrapper.text()).not.toContain('Cargando tus ofertas...')
  })

  it('shows an error when fetching fails', async () => {
    getExclusiveOffers.mockRejectedValue(
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

  it('renders the product and discount of an active offer', async () => {
    getExclusiveOffers.mockResolvedValue([
      buildOffer(),
    ])

    const wrapper = mountCard()

    await flushPromises()

    const cards = wrapper.findAll('.exclusive-offers__card')

    expect(cards).toHaveLength(1)
    expect(cards[0].text()).toContain('Hello Edamame')
    expect(cards[0].text()).toContain('15% de descuento')
  })

  it('does not render used offers', async () => {
    getExclusiveOffers.mockResolvedValue([
      buildOffer(),
      buildOffer({
        id: 2,
        product: {
          id: 2,
          name: 'Used product',
        },
        used: true,
      }),
    ])

    const wrapper = mountCard()

    await flushPromises()

    expect(wrapper.findAll('.exclusive-offers__card')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Used product')
  })

  it('shows the empty state when every offer has been used', async () => {
    getExclusiveOffers.mockResolvedValue([
      buildOffer({ used: true }),
    ])

    const wrapper = mountCard()

    await flushPromises()

    expect(wrapper.findAll('.exclusive-offers__card')).toHaveLength(0)
    expect(wrapper.text()).toContain(
      'Todavía no tienes ofertas exclusivas desbloqueadas.',
    )
  })

  it('does not show a copy button without a coupon', async () => {
    getExclusiveOffers.mockResolvedValue([
      buildOffer(),
    ])

    const wrapper = mountCard()

    await flushPromises()

    expect(
      wrapper.find('.exclusive-offers__copy-btn').exists(),
    ).toBe(false)
  })

  it('copies the coupon and shows a confirmation', async () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout'],
    })

    getExclusiveOffers.mockResolvedValue([
      buildOffer({ coupon: 'coupon-a' }),
    ])

    const wrapper = mountCard()

    await flushPromises()

    expect(
      wrapper.get('.exclusive-offers__copy-btn').text(),
    ).toBe('Copiar coupon-a')

    await wrapper.get('.exclusive-offers__copy-btn').trigger('click')
    await flushPromises()

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'coupon-a',
    )

    expect(
      wrapper.get('.exclusive-offers__copy-btn').text(),
    ).toBe('¡Copiado!')

    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()
  })

  it('restores the copy button text after two seconds', async () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout'],
    })

    getExclusiveOffers.mockResolvedValue([
      buildOffer({ coupon: 'coupon-a' }),
    ])

    const wrapper = mountCard()

    await flushPromises()

    await wrapper.get('.exclusive-offers__copy-btn').trigger('click')
    await flushPromises()

    expect(
      wrapper.get('.exclusive-offers__copy-btn').text(),
    ).toBe('¡Copiado!')

    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()

    expect(
      wrapper.get('.exclusive-offers__copy-btn').text(),
    ).toBe('Copiar coupon-a')
  })
})