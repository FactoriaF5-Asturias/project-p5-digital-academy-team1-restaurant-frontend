import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import KitchenOrderList from './KitchenOrderList.vue'

const orders = [
  { id: 1, channel: 'ONSITE' },
  { id: 2, channel: 'ONLINE' },
]

function mountList(props = {}) {
  return mount(KitchenOrderList, {
    props,
    global: {
      stubs: {
        KitchenOrderCard: {
          props: ['order'],
          template: '<article>Comanda #{{ order.id }}</article>',
        },
      },
    },
  })
}

function buttonText(button) {
  return button.text().replace(/\s+/g, ' ').trim()
}

describe('KitchenOrderList', () => {
  it('shows the loading state and hides orders', () => {
    const wrapper = mountList({ orders, isLoading: true })

    expect(wrapper.text()).toContain('Cargando comandas...')
    expect(wrapper.findAll('article')).toHaveLength(0)
    expect(wrapper.get('section').attributes('aria-busy')).toBe('true')
  })

  it('shows the error state and hides orders', () => {
    const wrapper = mountList({
      orders,
      error: 'No se han podido cargar las comandas.',
    })

    expect(wrapper.get('[role="alert"]').text()).toBe(
      'No se han podido cargar las comandas.',
    )
    expect(wrapper.findAll('article')).toHaveLength(0)
  })

  it('shows the empty state for all channels', () => {
    const wrapper = mountList()

    expect(wrapper.text()).toContain('No hay comandas activas.')
  })

  it.each(['ONSITE', 'ONLINE'])(
    'shows the empty state for channel %s',
    (selectedChannel) => {
      const wrapper = mountList({ selectedChannel })

      expect(wrapper.text()).toContain(
        'No hay comandas activas para este canal.',
      )
    },
  )

  it('renders the orders provided by the parent', () => {
    const wrapper = mountList({ orders })

    expect(wrapper.findAll('article')).toHaveLength(2)
    expect(wrapper.text()).toContain('Comanda #1')
    expect(wrapper.text()).toContain('Comanda #2')
  })

  it.each([
    ['ALL', 0],
    ['ONSITE', 1],
    ['ONLINE', 2],
  ])(
    'emits channel %s when its button is clicked',
    async (channel, index) => {
      const wrapper = mountList()

      await wrapper.findAll('button')[index].trigger('click')

      expect(wrapper.emitted('channel-change')).toEqual([[channel]])
    },
  )

  it('highlights the selected channel', async () => {
    const wrapper = mountList({ selectedChannel: 'ONSITE' })
    const buttons = wrapper.findAll('button')

    expect(buttons[0].attributes('aria-pressed')).toBe('false')
    expect(buttons[1].attributes('aria-pressed')).toBe('true')
    expect(buttons[1].classes()).toContain('btn-primary')
    expect(buttons[2].attributes('aria-pressed')).toBe('false')

    await wrapper.setProps({ selectedChannel: 'ONLINE' })

    expect(buttons[1].attributes('aria-pressed')).toBe('false')
    expect(buttons[2].attributes('aria-pressed')).toBe('true')
    expect(buttons[2].classes()).toContain('btn-primary')
  })

  it('shows the counters returned by the backend', () => {
    const wrapper = mountList({
      channelCounts: {
        total: 5,
        inStore: 3,
        delivery: 2,
      },
    })

    const buttons = wrapper.findAll('button')

    expect(buttonText(buttons[0])).toBe('Todos (5)')
    expect(buttonText(buttons[1])).toBe('En Sala (3)')
    expect(buttonText(buttons[2])).toBe('A Domicilio (2)')
  })

  it('shows zero counters', () => {
    const wrapper = mountList({
      channelCounts: {
        total: 0,
        inStore: 0,
        delivery: 0,
      },
    })

    wrapper.findAll('button').forEach((button) => {
      expect(buttonText(button)).toContain('(0)')
    })
  })

  it('does not display counters before they are available', () => {
    const wrapper = mountList()

    wrapper.findAll('button').forEach((button) => {
      expect(buttonText(button)).not.toContain('(')
    })
  })
})