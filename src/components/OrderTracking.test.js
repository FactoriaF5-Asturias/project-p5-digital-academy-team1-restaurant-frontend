import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderTracking from './OrderTracking.vue'
describe('OrderTracking', () => {
  it('shows the order tracking title', () => {
    const wrapper = mount(OrderTracking)

    expect(wrapper.text()).toContain('Estado de tu Pedido')
  })
  it('shows the active order tracking and rider information', () => {
  const wrapper = mount(OrderTracking)

  expect(wrapper.text()).toContain('En Tránsito con Motorista')
  expect(wrapper.text()).toContain('Activo')
  expect(wrapper.text()).toContain('Clara Álvarez')
  expect(wrapper.text()).toContain('Moto Eco 01')
  expect(wrapper.text()).toContain('Rider ID: R-709')
})
it('shows the loading state', () => {
  const wrapper = mount(OrderTracking, {
    props: {
      isLoading: true
    }
  })

  expect(wrapper.text()).toContain('Cargando seguimiento del pedido...')
})
it('shows the error state', () => {
  const wrapper = mount(OrderTracking, {
    props: {
      error: 'Error al cargar el seguimiento del pedido'
    }
  })

  expect(wrapper.text()).toContain(
    'Error al cargar el seguimiento del pedido'
  )
})
})