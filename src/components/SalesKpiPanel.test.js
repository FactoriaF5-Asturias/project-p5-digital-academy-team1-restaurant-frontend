import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import SalesKpiPanel from './SalesKpiPanel.vue'
import KpiTiles from './KpiTiles.vue'
import ChannelSplitBar from './ChannelSplitBar.vue'
import WeeklySalesChart from './WeeklySalesChart.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { getSalesKpi } from '../services/kpi.service'

vi.mock('../services/kpi.service', () => ({
  getSalesKpi: vi.fn(),
}))

const KPI = {
  today: { revenue: 482, previousRevenue: 400 },
  month: { revenue: 9000, previousRevenue: 10000 },
  quarter: { revenue: 25000, previousRevenue: 20000 },
  year: { revenue: 98000, previousRevenue: 90000 },
  channels: {
    inStore: { revenue: 2989, percentage: 62 },
    delivery: { revenue: 1831, percentage: 38 },
  },
  weekly: [{ day: 'FRIDAY', inStore: 400, delivery: 200 }],
  peakDay: 'FRIDAY',
}

describe('SalesKpiPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('muestra el spinner mientras carga', async () => {
    getSalesKpi.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(SalesKpiPanel)
    await nextTick()

    const spinner = wrapper.findComponent(LoadingSpinner)
    expect(spinner.exists()).toBe(true)
    expect(spinner.props('label')).toBe('Cargando KPI de ventas...')
  })

  it('pide los KPI al montarse y reparte los datos', async () => {
    getSalesKpi.mockResolvedValue(KPI)
    const wrapper = mount(SalesKpiPanel)
    await flushPromises()

    expect(getSalesKpi).toHaveBeenCalledTimes(1)
    expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(false)
    expect(wrapper.findComponent(KpiTiles).props('totals')).toEqual(KPI)
    expect(wrapper.findComponent(ChannelSplitBar).props('channels')).toEqual(KPI.channels)

    const chart = wrapper.findComponent(WeeklySalesChart)
    expect(chart.props('weekly')).toEqual(KPI.weekly)
    expect(chart.props('peakDay')).toBe('FRIDAY')
  })

  it('muestra el error si el backend falla', async () => {
    getSalesKpi.mockRejectedValue(new Error('404'))
    const wrapper = mount(SalesKpiPanel)
    await flushPromises()

    expect(wrapper.find('.sales-kpi__error').text()).toBe(
      'No se han podido cargar los KPI de ventas. Inténtalo de nuevo más tarde.'
    )
    expect(wrapper.findComponent(KpiTiles).exists()).toBe(false)
  })

  it('tiene un título accesible para la sección', () => {
    getSalesKpi.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(SalesKpiPanel)

    expect(wrapper.find('section').attributes('aria-labelledby')).toBe('sales-kpi-title')
    expect(wrapper.find('#sales-kpi-title').text()).toBe('KPI de ventas')
  })
})