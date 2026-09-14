import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KitchenOrderCard from './KitchenOrderCard.vue'

const order = {
  id: 1042,
  elapsedTime: 16,
  status: 'PROCESSING',
  products: [
    {
      name: 'Pull Nigiri',
      quantity: 2
    },
    {
      name: 'Merge Maki',
      quantity: 1
    }
  ]
}

describe('KitchenOrderCard', () => {
  it('shows the order information', () => {
    const wrapper = mount(KitchenOrderCard, {
      props: {
        order
      }
    })

    expect(wrapper.text()).toContain('#1042')
    expect(wrapper.text()).toContain('16 min')
    expect(wrapper.text()).toContain('Pull Nigiri')
    expect(wrapper.text()).toContain('x2')
    expect(wrapper.text()).toContain('Merge Maki')
    expect(wrapper.text()).toContain('x1')
  })

  it('shows the current order status', () => {
    const wrapper = mount(KitchenOrderCard, {
      props: {
        order
      }
    })

    expect(wrapper.text()).toContain('Estado: PROCESSING')
  })

  it('changes the order status to delayed', async () => {
    const wrapper = mount(KitchenOrderCard, {
      props: {
        order
      }
    })

    const buttons = wrapper.findAll('button')

    await buttons[1].trigger('click')

    expect(wrapper.text()).toContain('Estado: DELAYED')
    expect(buttons[1].attributes('disabled')).toBeDefined()
  })

  it('changes the order status to ready', async () => {
    const wrapper = mount(KitchenOrderCard, {
      props: {
        order
      }
    })

    const buttons = wrapper.findAll('button')

    await buttons[2].trigger('click')

    expect(wrapper.text()).toContain('Estado: READY')
    expect(buttons[2].attributes('disabled')).toBeDefined()
  })
})