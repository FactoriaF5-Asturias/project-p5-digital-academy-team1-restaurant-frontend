import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderStatusItem from './OrderStatusItem.vue'

describe('OrderStatusItem', () => {
  it('shows the active label when the status is active', () => {
    const wrapper = mount(OrderStatusItem, {
      props: {
        status: {
          name: 'En Tránsito con Motorista',
          time: '21:08'
        },
        activeStatus: 'En Tránsito con Motorista'
      }
    })

    expect(wrapper.text()).toContain('Activo')
  })
})