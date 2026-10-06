import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DeliveryMetrics from './DeliveryMetrics.vue'

const metrics = {
  readyCount: 4,
  inTransitCount: 2,
  deliveredTodayCount: 7,
  averageDeliveryMinutes: 18.5,
}

function getValue(wrapper, key) {
  return wrapper
    .get(`[data-testid="metric-${key}"] .delivery-metrics__value`)
    .text()
}

describe('DeliveryMetrics', () => {
  it('muestra los cuatro indicadores con los datos recibidos', () => {
    const wrapper = mount(DeliveryMetrics, {
      props: { metrics },
    })

    expect(wrapper.findAll('dt').map((item) => item.text())).toEqual([
      'Listos para recogida',
      'En tránsito',
      'Entregados hoy',
      'Tiempo promedio',
    ])

    expect(getValue(wrapper, 'ready')).toBe('4')
    expect(getValue(wrapper, 'in-transit')).toBe('2')
    expect(getValue(wrapper, 'delivered')).toBe('7')
    expect(getValue(wrapper, 'average')).toBe('18,5 min')
  })

  it('muestra contadores a cero y promedio no disponible sin entregas', () => {
    const wrapper = mount(DeliveryMetrics, {
      props: {
        metrics: {
          readyCount: 0,
          inTransitCount: 0,
          deliveredTodayCount: 0,
          averageDeliveryMinutes: 0,
        },
      },
    })

    expect(getValue(wrapper, 'ready')).toBe('0')
    expect(getValue(wrapper, 'in-transit')).toBe('0')
    expect(getValue(wrapper, 'delivered')).toBe('0')
    expect(getValue(wrapper, 'average')).toBe('—')
    expect(wrapper.text()).toContain(
      'Sin entregas hoy para calcular el promedio.'
    )
  })

  it('actualiza los indicadores cuando cambian los datos', async () => {
    const wrapper = mount(DeliveryMetrics, {
      props: { metrics },
    })

    await wrapper.setProps({
      metrics: {
        readyCount: 3,
        inTransitCount: 3,
        deliveredTodayCount: 8,
        averageDeliveryMinutes: 20,
      },
    })

    expect(getValue(wrapper, 'ready')).toBe('3')
    expect(getValue(wrapper, 'in-transit')).toBe('3')
    expect(getValue(wrapper, 'delivered')).toBe('8')
    expect(getValue(wrapper, 'average')).toBe('20 min')
  })

  it('muestra cero minutos si hay entregas con ese promedio', () => {
    const wrapper = mount(DeliveryMetrics, {
      props: {
        metrics: {
          ...metrics,
          deliveredTodayCount: 1,
          averageDeliveryMinutes: 0,
        },
      },
    })

    expect(getValue(wrapper, 'average')).toBe('0 min')
  })
})