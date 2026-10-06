import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KpiTiles from './KpiTiles.vue'

// Intl usa un espacio especial antes del símbolo €, por eso se normaliza.
const normalizeSpaces = (text) => text.replace(/\s+/g, ' ')

const TOTALS = {
  today: { revenue: 482, previousRevenue: 400 },
  month: { revenue: 9000, previousRevenue: 10000 },
  quarter: { revenue: 25000, previousRevenue: 0 },
  year: { revenue: 98000.4, previousRevenue: null },
}

function mountTiles() {
  return mount(KpiTiles, { props: { totals: TOTALS } })
}

describe('KpiTiles', () => {
  it('muestra un indicador por periodo en orden', () => {
    const labels = mountTiles()
      .findAll('.kpi-tiles__label')
      .map((label) => label.text())

    expect(labels).toEqual(['Hoy', 'Mes', 'Trimestre', 'Año fiscal'])
  })

  it('muestra las ventas en euros sin decimales', () => {
    const values = mountTiles()
      .findAll('.kpi-tiles__value')
      .map((value) => normalizeSpaces(value.text()))

    expect(values).toEqual(['482 €', '9000 €', '25.000 €', '98.000 €'])
  })

  it('marca la subida con ▲ y un texto para lectores de pantalla', () => {
    const variation = mountTiles().findAll('.kpi-tiles__item')[0].find('.kpi-tiles__variation')

    expect(variation.classes()).toContain('kpi-tiles__variation--up')
    expect(normalizeSpaces(variation.text())).toBe('▲ 21 % más que el periodo anterior')
  })

  it('marca la bajada con ▼ y sin signo negativo', () => {
    const variation = mountTiles().findAll('.kpi-tiles__item')[1].find('.kpi-tiles__variation')

    expect(variation.classes()).toContain('kpi-tiles__variation--down')
    expect(normalizeSpaces(variation.text())).toBe('▼ 10 % menos que el periodo anterior')
  })

  it('indica cuando no hay datos anteriores con los que comparar', () => {
    const items = mountTiles().findAll('.kpi-tiles__item')

    expect(items[2].find('.kpi-tiles__variation').text()).toBe('Sin datos anteriores')
    expect(items[3].find('.kpi-tiles__variation').text()).toBe('Sin datos anteriores')
  })
})