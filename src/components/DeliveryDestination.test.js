import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DeliveryDestination from './DeliveryDestination.vue'

const ADDRESS = {
  street: 'Calle Mayor 1',
  city: 'Avilés',
  postalCode: '33400',
  instructions: 'Portal azul, 2º B',
}

describe('DeliveryDestination', () => {
  it('shows the street, postal code and city of the order', () => {
    const wrapper = mount(DeliveryDestination, { props: { address: ADDRESS } })

    const address = wrapper.find('address').text()
    expect(address).toContain('Calle Mayor 1')
    expect(address).toContain('33400 Avilés')
  })

  it('shows the delivery instructions when there are any', () => {
    const wrapper = mount(DeliveryDestination, { props: { address: ADDRESS } })

    expect(wrapper.find('.delivery-destination__instructions').text()).toBe(
      'Indicaciones: Portal azul, 2º B',
    )
  })

  it('hides the instructions when the customer did not add any', () => {
    const wrapper = mount(DeliveryDestination, {
      props: { address: { ...ADDRESS, instructions: null } },
    })

    expect(wrapper.find('.delivery-destination__instructions').exists()).toBe(false)
  })
})