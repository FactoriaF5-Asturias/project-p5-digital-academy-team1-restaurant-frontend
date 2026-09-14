import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KitchenMetrics from './KitchenMetrics.vue'

describe('KitchenMetrics', () => {
  it('shows the kitchen metrics', () => {
    const wrapper = mount(KitchenMetrics)

    expect(wrapper.text()).toContain('Dashboard de Cocina')
    expect(wrapper.text()).toContain('Comandas activas')
    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('Tiempo medio prep')
    expect(wrapper.text()).toContain('18 min')
    expect(wrapper.text()).toContain('En preparación: 7')
    expect(wrapper.text()).toContain('Con retraso: 2')
    expect(wrapper.text()).toContain('Listas para pase: 3')
    expect(wrapper.text()).toContain('2 con retraso')
  })

  it('shows the loading state', () => {
    const wrapper = mount(KitchenMetrics, {
      props: {
        isLoading: true
      }
    })

    expect(wrapper.text()).toContain('Cargando métricas de cocina...')
  })

  it('shows the error state', () => {
    const wrapper = mount(KitchenMetrics, {
      props: {
        error: 'Error al cargar las métricas de cocina'
      }
    })

    expect(wrapper.text()).toContain(
      'Error al cargar las métricas de cocina'
    )
  })

  it('shows the empty state', () => {
    const wrapper = mount(KitchenMetrics, {
      props: {
        hasMetrics: false
      }
    })

    expect(wrapper.text()).toContain(
      'No hay métricas de cocina disponibles.'
    )
  })
})