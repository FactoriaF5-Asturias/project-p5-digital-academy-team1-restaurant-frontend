import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WeeklySalesChart from './WeeklySalesChart.vue'

// Intl usa un espacio especial antes del símbolo €, por eso se normaliza.
const normalizeSpaces = (text) => text.replace(/\s+/g, ' ')

const WEEKLY = [
  { day: 'MONDAY', inStore: 100, delivery: 50 },
  { day: 'FRIDAY', inStore: 400, delivery: 200 },
]

function mountChart(props = {}) {
  return mount(WeeklySalesChart, {
    props: { weekly: WEEKLY, peakDay: 'FRIDAY', ...props },
  })
}

describe('WeeklySalesChart', () => {
  it('muestra los 7 días de lunes a domingo', () => {
    const labels = mountChart()
      .findAll('.weekly-chart__day-label')
      .map((label) => label.text())

    expect(labels).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D'])
  })

  it('calcula el alto de cada barra respecto a la venta más alta', () => {
    const days = mountChart().findAll('.weekly-chart__day')
    const mondayBars = days[0].findAll('.weekly-chart__bar')
    const fridayBars = days[4].findAll('.weekly-chart__bar')

    expect(fridayBars[0].attributes('style')).toContain('height: 100%')
    expect(fridayBars[1].attributes('style')).toContain('height: 50%')
    expect(mondayBars[0].attributes('style')).toContain('height: 25%')
  })

  it('los días sin ventas tienen barras a 0', () => {
    const tuesdayBars = mountChart().findAll('.weekly-chart__day')[1].findAll('.weekly-chart__bar')

    expect(tuesdayBars[0].attributes('style')).toContain('height: 0%')
    expect(tuesdayBars[1].attributes('style')).toContain('height: 0%')
  })

  it('señala el día pico', () => {
    const days = mountChart().findAll('.weekly-chart__day')

    expect(days[4].classes()).toContain('weekly-chart__day--peak')
    expect(days[4].find('.weekly-chart__peak').text()).toBe('Pico')
    expect(days[0].find('.weekly-chart__peak').exists()).toBe(false)
  })

  it('describe cada día para lectores de pantalla y en el tooltip', () => {
    const friday = mountChart().findAll('.weekly-chart__day')[4]
    const description = 'Viernes (día pico). Sala: 400,00 €, Domicilio: 200,00 €'

    expect(normalizeSpaces(friday.find('.sr-only').text())).toBe(description)
    expect(normalizeSpaces(friday.attributes('title'))).toBe(description)
  })

  it('no marca ningún pico si no se indica', () => {
    const wrapper = mountChart({ peakDay: null })

    expect(wrapper.find('.weekly-chart__day--peak').exists()).toBe(false)
  })

  it('con una semana sin ventas no rompe el cálculo de alturas', () => {
    const bars = mountChart({ weekly: [], peakDay: null }).findAll('.weekly-chart__bar')

    expect(bars.every((bar) => bar.attributes('style').includes('height: 0%'))).toBe(true)
  })
})