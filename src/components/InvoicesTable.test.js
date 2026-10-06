import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InvoicesTable from './InvoicesTable.vue'

function buildInvoice(overrides = {}) {
  return {
    id: 7,
    invoiceNumber: '3f2a-uuid',
    customerName: 'Luisa Cortes',
    tableNumber: null,
    channel: 'ONLINE',
    amount: 24.4,
    status: 'DELIVERED',
    paymentMethod: 'ONLINE_CARD',
    paidAt: '2026-10-01T10:30:00Z',
    ...overrides,
  }
}

function mountTable(invoices = [buildInvoice()]) {
  return mount(InvoicesTable, { props: { invoices } })
}

describe('InvoicesTable', () => {
  it('muestra todas las columnas del criterio de aceptación', () => {
    const headers = mountTable().findAll('th').map((header) => header.text())

    expect(headers).toEqual([
      'ID factura',
      'Cliente / Mesa',
      'Canal',
      'Importe',
      'Método de pago',
      'Estado',
      'Fecha y hora',
    ])
  })

  it('muestra los datos de cada factura traducidos y con formato', () => {
    const text = mountTable().find('tbody').text().replace(/\s/g, ' ')

    expect(text).toContain('#7')
    expect(text).toContain('Luisa Cortes')
    expect(text).toContain('A domicilio')
    expect(text).toContain('24,40 €')
    expect(text).toContain('Tarjeta online')
    expect(text).toContain('Entregado')
    expect(text).toContain('01/10/2026')
  })

  it('en sala muestra la mesa en lugar del cliente', () => {
    const wrapper = mountTable([buildInvoice({ tableNumber: 4, customerName: null, channel: 'ONSITE' })])

    expect(wrapper.find('tbody').text()).toContain('Mesa 4')
  })

  it('muestra un guion si no hay ni mesa ni cliente', () => {
    const wrapper = mountTable([buildInvoice({ tableNumber: null, customerName: null })])

    expect(wrapper.findAll('td')[1].text()).toBe('—')
  })

  it('guarda el número completo de factura en el title del ID', () => {
    const wrapper = mountTable()

    expect(wrapper.find('.invoices-table__id').attributes('title')).toBe('3f2a-uuid')
  })

  it('muestra un mensaje que ocupa toda la fila cuando no hay facturas', () => {
    const wrapper = mountTable([])

    const emptyCell = wrapper.find('.invoices-table__empty')

    expect(emptyCell.text()).toBe('No hay facturas que mostrar.')
    expect(emptyCell.attributes('colspan')).toBe(String(wrapper.findAll('th').length))
  })
})