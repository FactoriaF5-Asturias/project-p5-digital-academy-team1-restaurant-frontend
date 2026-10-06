import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CocinaView from './CocinaView.vue'
import KitchenMetrics from '../components/KitchenMetrics.vue'
import KitchenOrderList from '../components/KitchenOrderList.vue'
import { getKitchenOrders, getKitchenMetrics } from '../services/kitchen.service'

// Responsabilidad: la vista de Cocina carga comandas y métricas al entrar
// y pasa a cada panel sus datos, su estado de carga y su error.

vi.mock('../services/kitchen.service', () => ({
  getKitchenOrders: vi.fn(),
  getKitchenMetrics: vi.fn(),
}))

const ORDERS = [{ id: 7, status: 'PLACED', products: [] }]
const METRICS = { activeOrders: 1, delayedOrders: 0 }
const ORDERS_ERROR = 'No se han podido cargar las comandas.'
const METRICS_ERROR = 'No se han podido cargar las métricas de cocina.'

function mountView() {
  return mount(CocinaView, {
    global: {
      stubs: { KitchenMetrics: true, KitchenOrderList: true },
    },
  })
}

describe('CocinaView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('muestra los paneles cargando mientras llegan los datos', () => {
    getKitchenOrders.mockReturnValue(new Promise(() => {}))
    getKitchenMetrics.mockReturnValue(new Promise(() => {}))

    const wrapper = mountView()

    expect(wrapper.findComponent(KitchenOrderList).props('isLoading')).toBe(true)
    expect(wrapper.findComponent(KitchenMetrics).props('isLoading')).toBe(true)
  })

  it('carga las comandas y las métricas al entrar y se las pasa a cada panel', async () => {
    getKitchenOrders.mockResolvedValue(ORDERS)
    getKitchenMetrics.mockResolvedValue(METRICS)

    const wrapper = mountView()
    await flushPromises()

    const orderList = wrapper.findComponent(KitchenOrderList)
    expect(orderList.props('orders')).toEqual(ORDERS)
    expect(orderList.props('isLoading')).toBe(false)
    expect(orderList.props('error')).toBeNull()

    const metricsPanel = wrapper.findComponent(KitchenMetrics)
    expect(metricsPanel.props('metrics')).toEqual(METRICS)
    expect(metricsPanel.props('isLoading')).toBe(false)
    expect(metricsPanel.props('error')).toBeNull()
  })

  it('si fallan las comandas muestra su error sin afectar a las métricas', async () => {
    getKitchenOrders.mockRejectedValue(new Error('network error'))
    getKitchenMetrics.mockResolvedValue(METRICS)

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.findComponent(KitchenOrderList).props('error')).toBe(ORDERS_ERROR)
    expect(wrapper.findComponent(KitchenOrderList).props('isLoading')).toBe(false)
    expect(wrapper.findComponent(KitchenMetrics).props('metrics')).toEqual(METRICS)
  })

  it('si fallan las métricas muestra su error sin afectar a las comandas', async () => {
    getKitchenOrders.mockResolvedValue(ORDERS)
    getKitchenMetrics.mockRejectedValue(new Error('network error'))

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.findComponent(KitchenMetrics).props('error')).toBe(METRICS_ERROR)
    expect(wrapper.findComponent(KitchenMetrics).props('isLoading')).toBe(false)
    expect(wrapper.findComponent(KitchenOrderList).props('orders')).toEqual(ORDERS)
  })
  
  it('vuelve a cargar las métricas cuando cambia el estado de una comanda, sin ocultarlas', async () => {
    getKitchenOrders.mockResolvedValue(ORDERS)
    getKitchenMetrics.mockResolvedValue(METRICS)
    const wrapper = mountView()
    await flushPromises()

    const UPDATED_METRICS = { activeOrders: 1, delayedOrders: 1 }
    getKitchenMetrics.mockResolvedValue(UPDATED_METRICS)
    wrapper.findComponent(KitchenOrderList).vm.$emit('status-changed', { id: 7, status: 'DELAYED' })
    expect(wrapper.findComponent(KitchenMetrics).props('isLoading')).toBe(false)
    await flushPromises()

    expect(getKitchenMetrics).toHaveBeenCalledTimes(2)
    expect(wrapper.findComponent(KitchenMetrics).props('metrics')).toEqual(UPDATED_METRICS)
  })
})