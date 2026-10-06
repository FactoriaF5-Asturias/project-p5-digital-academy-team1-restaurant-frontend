import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderStatusTracker from './OrderStatusTracker.vue'

function mountTracker(props) {
  return mount(OrderStatusTracker, { props })
}

describe('OrderStatusTracker', () => {
  it('shows the delivery steps for a home delivery order', () => {
    const wrapper = mountTracker({ status: 'ONTHEWAY', channel: 'ONLINE' })

    const labels = wrapper.findAll('.order-tracker__label').map((label) => label.text())
    expect(labels).toEqual(['Recibido', 'En preparación', 'Listo', 'En reparto', 'Entregado'])
  })

  it('shows only the kitchen steps for an order in the restaurant', () => {
    const wrapper = mountTracker({ status: 'PROCESSING', channel: 'ONSITE' })

    expect(wrapper.findAll('.order-tracker__step')).toHaveLength(3)
  })

  it('marks the previous steps as done and the current one', () => {
    const wrapper = mountTracker({ status: 'READY', channel: 'ONLINE' })
    const steps = wrapper.findAll('.order-tracker__step')

    expect(steps[0].classes()).toContain('order-tracker__step--done')
    expect(steps[1].classes()).toContain('order-tracker__step--done')
    expect(steps[2].classes()).toContain('order-tracker__step--current')
    expect(steps[2].attributes('aria-current')).toBe('step')
    expect(steps[3].classes()).not.toContain('order-tracker__step--done')
  })

  it('warns the customer when the kitchen marks the order as delayed', () => {
    const wrapper = mountTracker({ status: 'DELAYED', channel: 'ONSITE' })

    expect(wrapper.find('.order-tracker__notice').text()).toContain('retraso')
    expect(wrapper.findAll('.order-tracker__step')[1].classes()).toContain(
      'order-tracker__step--current',
    )
  })

  it('does not show the delay notice for an order on time', () => {
    const wrapper = mountTracker({ status: 'PROCESSING', channel: 'ONSITE' })

    expect(wrapper.find('.order-tracker__notice').exists()).toBe(false)
  })
})