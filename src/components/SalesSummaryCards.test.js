import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SalesSummaryCards from './SalesSummaryCards.vue'

describe('SalesSummaryCards', () => {
  it('muestra los 3 indicadores con formato', () => {
    const wrapper = mount(SalesSummaryCards, {
      props: { revenue: 4820.5, orders: 213, averageTicket: 22.63 },
    })

    const labels = wrapper.findAll('dt').map((term) => term.text())
    const values = wrapper.findAll('dd').map((value) => value.text().replace(/\s/g, ' '))

    expect(labels).toEqual(['Total vendido', 'Pedidos pagados', 'Ticket medio'])
    expect(values).toEqual(['4820,50 €', '213', '22,63 €'])
  })
})