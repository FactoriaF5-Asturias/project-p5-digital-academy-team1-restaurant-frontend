import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminProductsTable from './AdminProductsTable.vue'

function buildProduct(overrides = {}) {
  return {
    id: 1,
    name: 'React Roll',
    description: 'Roll de sushi fresco',
    category: 'ROLLS',
    price: 7.9,
    available: true,
    ...overrides,
  }
}

function mountTable(products = [buildProduct()]) {
  return mount(AdminProductsTable, { props: { products } })
}

describe('AdminProductsTable', () => {
  it('shows the name, description, category label and formatted price of each product', () => {
    const text = mountTable().find('tbody').text()

    expect(text).toContain('React Roll')
    expect(text).toContain('Roll de sushi fresco')
    expect(text).toContain('Rolls')
    expect(text.replace(/\s/g, ' ')).toContain('7,90 €')
  })

  it('shows an empty message when there are no products', () => {
    const wrapper = mountTable([])

    expect(wrapper.text()).toContain('No hay productos en esta categoría.')
  })

  it('shows the active status and the "Desactivar" action for an available product', () => {
    const wrapper = mountTable([buildProduct({ available: true })])

    expect(wrapper.text()).toContain('Activo')
    expect(wrapper.find('.products-table__toggle-button').text()).toBe('Desactivar')
  })

  it('shows the inactive status and the "Activar" action for an unavailable product', () => {
    const wrapper = mountTable([buildProduct({ available: false })])

    expect(wrapper.text()).toContain('Desactivado')
    expect(wrapper.find('.products-table__toggle-button').text()).toBe('Activar')
  })

  it('does not show a stock column', () => {
    const wrapper = mountTable()

    const headers = wrapper.findAll('th').map((header) => header.text())

    expect(headers).toEqual(['Producto', 'Categoría', 'Precio', 'Estado', 'Acciones'])
    expect(wrapper.text()).not.toContain('uds.')
  })

  it('the empty message spans every column of the table', () => {
    const wrapper = mountTable([])

    const columns = wrapper.findAll('th').length

    expect(wrapper.find('.products-table__empty').attributes('colspan')).toBe(String(columns))
  })

  it('emits toggle-availability, edit and delete with the clicked product', async () => {
    const product = buildProduct()
    const wrapper = mountTable([product])

    await wrapper.find('.products-table__toggle-button').trigger('click')
    await wrapper.find('button[aria-label="Editar producto"]').trigger('click')
    await wrapper.find('button[aria-label="Eliminar producto"]').trigger('click')

    expect(wrapper.emitted('toggle-availability')[0]).toEqual([product])
    expect(wrapper.emitted('edit')[0]).toEqual([product])
    expect(wrapper.emitted('delete')[0]).toEqual([product])
  })
})