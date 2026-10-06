import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AdminInvoicesPanel from './AdminInvoicesPanel.vue'
import { getPaidInvoices } from '../services/invoices.service'

vi.mock('../services/invoices.service', () => ({
  getPaidInvoices: vi.fn(),
}))

function buildInvoice(id) {
  return {
    id,
    invoiceNumber: `uuid-${id}`,
    customerName: `Cliente ${id}`,
    tableNumber: null,
    channel: 'ONLINE',
    amount: 10,
    status: 'DELIVERED',
    paymentMethod: 'ONLINE_CARD',
    paidAt: '2026-10-01T10:30:00Z',
  }
}

async function mountPanel() {
  const wrapper = mount(AdminInvoicesPanel)
  await flushPromises()
  return wrapper
}

describe('AdminInvoicesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    getPaidInvoices.mockResolvedValue({ items: [buildInvoice(1), buildInvoice(2)], totalPages: 2 })
  })

  it('muestra el título de la sección', async () => {
    const wrapper = await mountPanel()

    expect(wrapper.find('h2').text()).toBe('Facturación y Pedidos Pagados')
  })

  it('muestra el cargador mientras llegan las facturas', async () => {
    getPaidInvoices.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(AdminInvoicesPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Cargando facturas...')
  })

  it('carga las facturas al abrirse y las pinta en la tabla', async () => {
    const wrapper = await mountPanel()

    expect(getPaidInvoices).toHaveBeenCalledWith({ page: 1, search: '' })
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('muestra un error si no se pueden cargar', async () => {
    getPaidInvoices.mockRejectedValue(new Error('500'))
    const wrapper = await mountPanel()

    expect(wrapper.text()).toContain('No se han podido cargar las facturas.')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('muestra el estado vacío si no hay facturas', async () => {
    getPaidInvoices.mockResolvedValue({ items: [], totalPages: 0 })
    const wrapper = await mountPanel()

    expect(wrapper.text()).toContain('No hay facturas que mostrar.')
    expect(wrapper.find('.pagination-control').exists()).toBe(false)
  })

  it('pagina con Anterior / Siguiente cuando hay más de una página', async () => {
    const wrapper = await mountPanel()

    await wrapper.find('.pagination-control__button--next').trigger('click')
    await flushPromises()

    expect(getPaidInvoices).toHaveBeenLastCalledWith({ page: 2, search: '' })
  })

  it('filtra la tabla con el buscador', async () => {
    const wrapper = await mountPanel()

    await wrapper.find('#invoices-search-input').setValue('Mesa 4')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(getPaidInvoices).toHaveBeenLastCalledWith({ page: 1, search: 'Mesa 4' })
  })
})