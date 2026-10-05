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
    stock: 20,
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

  it('marks the stock as low when it is 5 units or less', () => {
    const wrapper = mountTable([buildProduct({ stock: 5 })])

    expect(wrapper.find('.products-table__badge--low-stock').exists()).toBe(true)
  })

  it('does not mark the stock as low when it is above 5 units', () => {
    const wrapper = mountTable([buildProduct({ stock: 6 })])

    expect(wrapper.find('.products-table__badge--low-stock').exists()).toBe(false)
  })

  it('shows a dash when the backend does not send the stock', () => {
    const wrapper = mountTable([buildProduct({ stock: undefined })])

    expect(wrapper.text()).toContain('— uds.')
    expect(wrapper.find('.products-table__badge--low-stock').exists()).toBe(false)
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