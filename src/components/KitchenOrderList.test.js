import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KitchenOrderList from './KitchenOrderList.vue'

describe('KitchenOrderList', () => {
  it('shows the loading state', () => {
    const wrapper = mount(KitchenOrderList, {
      props: {
        isLoading: true
      }
    })

    expect(wrapper.text()).toContain('Cargando comandas...')
  })

  it('shows the error state', () => {
    const wrapper = mount(KitchenOrderList, {
      props: {
        error: 'Error al cargar las comandas'
      }
    })

    expect(wrapper.text()).toContain('Error al cargar las comandas')
  })

  it('shows the empty state', () => {
    const wrapper = mount(KitchenOrderList, {
      props: {
        orders: []
      }
    })

    expect(wrapper.text()).toContain('No hay comandas activas.')
  })
})