import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import AdminProductsPanel from './AdminProductsPanel.vue'
import { getAdminProducts, createProduct, updateProduct } from '../services/products.service'

vi.mock('../services/products.service', () => ({
  getAdminProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
}))

const TABLE_PAGE_SIZE = 7

function buildProduct(overrides = {}) {
  return {
    id: 1,
    name: 'React Roll',
    description: 'Roll de sushi fresco',
    category: 'ROLLS',
    imageUrl: 'react-roll.png',
    price: 7.9,
    available: true,
    ...overrides,
  }
}

function buildProducts() {
  return [
    buildProduct({ id: 1, name: 'React Roll', category: 'ROLLS' }),
    buildProduct({ id: 2, name: 'Pull Nigiri', category: 'NIGIRI' }),
    buildProduct({ id: 3, name: 'Sake Script', category: 'BEBIDAS', available: false }),
  ]
}

async function mountPanel(products = buildProducts()) {
  getAdminProducts.mockResolvedValue(products)
  const wrapper = mount(AdminProductsPanel)
  await flushPromises()
  return wrapper
}

function findRowByName(wrapper, name) {
  return wrapper.findAll('tbody tr').find((row) => row.text().includes(name))
}

function findFilterButton(wrapper, label) {
  return wrapper.findAll('.category-filters__button').find((button) => button.text().startsWith(label))
}

describe('AdminProductsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('loading the products', () => {
    it('shows the spinner while the products are loading', async () => {
      getAdminProducts.mockReturnValue(new Promise(() => {}))

      const wrapper = mount(AdminProductsPanel)
      await nextTick()

      expect(wrapper.text()).toContain('Cargando productos...')
      expect(wrapper.find('table').exists()).toBe(false)
    })

    it('shows the products returned by the backend', async () => {
      const wrapper = await mountPanel()

      expect(getAdminProducts).toHaveBeenCalledTimes(1)
      expect(wrapper.findAll('tbody tr')).toHaveLength(3)
      expect(wrapper.text()).toContain('React Roll')
    })

    it('shows an error message when the products cannot be loaded', async () => {
      getAdminProducts.mockRejectedValue(new Error('403'))
      const wrapper = mount(AdminProductsPanel)
      await flushPromises()

      expect(wrapper.find('.admin-products__load-error').text()).toBe(
        'No se han podido cargar los productos. Inténtalo de nuevo más tarde.'
      )
      expect(wrapper.find('table').exists()).toBe(false)
    })
  })

  describe('filtering by category', () => {
    it('shows the count of products of each category', async () => {
      const wrapper = await mountPanel()

      expect(findFilterButton(wrapper, 'Todas').text()).toBe('Todas (3)')
      expect(findFilterButton(wrapper, 'Nigiri').text()).toBe('Nigiri (1)')
    })

    it('shows only the products of the selected category', async () => {
      const wrapper = await mountPanel()

      await findFilterButton(wrapper, 'Nigiri').trigger('click')

      expect(wrapper.findAll('tbody tr')).toHaveLength(1)
      expect(wrapper.text()).toContain('Pull Nigiri')
      expect(wrapper.text()).not.toContain('React Roll')
    })

    it('shows the empty message when the category has no products', async () => {
      const wrapper = await mountPanel()

      await findFilterButton(wrapper, 'Postres').trigger('click')

      expect(wrapper.text()).toContain('No hay productos en esta categoría.')
    })
  })

  describe('pagination', () => {
    function buildManyProducts(count) {
      return Array.from({ length: count }, (_, index) =>
        buildProduct({ id: index + 1, name: `Producto ${index + 1}` })
      )
    }

    it('does not show the pagination when everything fits in one page', async () => {
      const wrapper = await mountPanel()

      expect(wrapper.find('.pagination-control').exists()).toBe(false)
    })

    it('shows a page of products and lets the user go to the next page', async () => {
      const wrapper = await mountPanel(buildManyProducts(TABLE_PAGE_SIZE + 2))

      expect(wrapper.findAll('tbody tr')).toHaveLength(TABLE_PAGE_SIZE)
      expect(wrapper.text()).toContain('Página 1 de 2')

      await wrapper.find('.pagination-control__button--next').trigger('click')

      expect(wrapper.findAll('tbody tr')).toHaveLength(2)
      expect(wrapper.text()).toContain('Página 2 de 2')
    })

    it('goes back to the first page when changing the category', async () => {
      const wrapper = await mountPanel(buildManyProducts(TABLE_PAGE_SIZE * 2 + 1))
      await wrapper.find('.pagination-control__button--next').trigger('click')

      await findFilterButton(wrapper, 'Todas').trigger('click')

      expect(wrapper.text()).toContain('Página 1 de 3')
    })
  })

    describe('activating and deactivating', () => {
    it('asks for confirmation before deactivating and changes nothing when cancelling', async () => {
      const wrapper = await mountPanel()
      const row = findRowByName(wrapper, 'React Roll')

      await row.find('.products-table__toggle-button').trigger('click')

      expect(wrapper.find('.confirm-dialog').text()).toContain('¿Desactivar producto?')
      expect(wrapper.find('.confirm-dialog strong').text()).toBe('React Roll')

      await wrapper.findAll('.confirm-dialog__button')[0].trigger('click')

      expect(wrapper.find('.confirm-dialog').exists()).toBe(false)
      expect(updateProduct).not.toHaveBeenCalled()
    })

    it('saves the new availability and updates the row after confirming', async () => {
      updateProduct.mockResolvedValue(buildProduct({ id: 1, available: false }))
      const wrapper = await mountPanel()
      const row = findRowByName(wrapper, 'React Roll')

      await row.find('.products-table__toggle-button').trigger('click')
      await wrapper.find('.confirm-dialog__button--danger').trigger('click')
      await flushPromises()

      expect(updateProduct).toHaveBeenCalledWith(1, { available: false })
      expect(row.text()).toContain('Desactivado')
      expect(row.find('.products-table__toggle-button').text()).toBe('Activar')
    })

    it('activates without asking for confirmation', async () => {
      updateProduct.mockResolvedValue(
        buildProduct({ id: 3, name: 'Sake Script', category: 'BEBIDAS', available: true })
      )
      const wrapper = await mountPanel()
      const row = findRowByName(wrapper, 'Sake Script')

      await row.find('.products-table__toggle-button').trigger('click')
      await flushPromises()

      expect(wrapper.find('.confirm-dialog').exists()).toBe(false)
      expect(updateProduct).toHaveBeenCalledWith(3, { available: true })
      expect(row.find('.products-table__toggle-button').text()).toBe('Desactivar')
    })

    it('shows an error and keeps the row unchanged when the backend fails', async () => {
      updateProduct.mockRejectedValue(new Error('500'))
      const wrapper = await mountPanel()
      const row = findRowByName(wrapper, 'React Roll')

      await row.find('.products-table__toggle-button').trigger('click')
      await wrapper.find('.confirm-dialog__button--danger').trigger('click')
      await flushPromises()

      expect(wrapper.find('.admin-products__action-error').text()).toBe(
        'No se ha podido cambiar el estado del producto. Inténtalo de nuevo.'
      )
      expect(row.find('.products-table__toggle-button').text()).toBe('Desactivar')
    })
  })

  describe('deleting', () => {
    it('asks for confirmation showing the product name', async () => {
      const wrapper = await mountPanel()

      await findRowByName(wrapper, 'React Roll').find('button[aria-label="Eliminar producto"]').trigger('click')

      expect(wrapper.find('.confirm-dialog').exists()).toBe(true)
      expect(wrapper.find('.confirm-dialog strong').text()).toBe('React Roll')
    })

    it('closes the confirmation without deleting when cancelling', async () => {
      const wrapper = await mountPanel()
      await findRowByName(wrapper, 'React Roll').find('button[aria-label="Eliminar producto"]').trigger('click')

      await wrapper.findAll('.confirm-dialog__button')[0].trigger('click')

      expect(wrapper.find('.confirm-dialog').exists()).toBe(false)
      expect(wrapper.findAll('tbody tr')).toHaveLength(3)
    })

    it('removes the product from the table when confirming', async () => {
      const wrapper = await mountPanel()
      await findRowByName(wrapper, 'React Roll').find('button[aria-label="Eliminar producto"]').trigger('click')

      await wrapper.find('.confirm-dialog__button--danger').trigger('click')

      expect(wrapper.find('.confirm-dialog').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('React Roll')
      expect(findFilterButton(wrapper, 'Todas').text()).toBe('Todas (2)')
    })
  })

  describe('adding a product', () => {
    async function openAndFillCreateForm(wrapper) {
      await wrapper.find('.admin-products__add-button').trigger('click')
      await wrapper.find('#product-name').setValue('Merge Nigiri')
      await wrapper.find('#product-image').setValue('merge-nigiri.png')
      await wrapper.find('#product-category').setValue('NIGIRI')
      await wrapper.find('#product-price').setValue('6.50')
      await wrapper.find('#product-description').setValue('Nigiri de salmón')
    }

    it('opens the form in create mode', async () => {
      const wrapper = await mountPanel()

      await wrapper.find('.admin-products__add-button').trigger('click')

      expect(wrapper.find('.product-form__title').text()).toBe('Añadir nuevo producto a la carta')
    })

    it('saves the new product, closes the form and shows it in the table', async () => {
      createProduct.mockResolvedValue(buildProduct({ id: 61, name: 'Merge Nigiri', category: 'NIGIRI' }))
      const wrapper = await mountPanel()
      await openAndFillCreateForm(wrapper)

      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(createProduct).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Merge Nigiri', category: 'NIGIRI', price: 6.5, discount: 0 })
      )
      expect(wrapper.find('.product-form').exists()).toBe(false)
      expect(wrapper.text()).toContain('Merge Nigiri')
      expect(findFilterButton(wrapper, 'Nigiri').text()).toBe('Nigiri (2)')
    })

    it('shows a specific message when a product with the same name already exists', async () => {
      createProduct.mockRejectedValue({ response: { status: 409 } })
      const wrapper = await mountPanel()
      await openAndFillCreateForm(wrapper)

      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.find('.product-form__error').text()).toBe('Ya existe un producto con ese nombre.')
    })

    it('shows a generic message when the backend fails for another reason', async () => {
      createProduct.mockRejectedValue(new Error('500'))
      const wrapper = await mountPanel()
      await openAndFillCreateForm(wrapper)

      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.find('.product-form__error').text()).toBe(
        'No se ha podido guardar el producto. Inténtalo de nuevo.'
      )
    })

    it('closes the form when cancelling', async () => {
      const wrapper = await mountPanel()
      await wrapper.find('.admin-products__add-button').trigger('click')

      await wrapper.find('.product-form__actions .product-form__button').trigger('click')

      expect(wrapper.find('.product-form').exists()).toBe(false)
    })
  })

  describe('editing a product', () => {
    async function openEditFormAndChangePrice(wrapper) {
      await findRowByName(wrapper, 'React Roll').find('button[aria-label="Editar producto"]').trigger('click')
      await wrapper.find('#product-price').setValue('8.50')
    }

    it('opens the form filled with the product data', async () => {
      const wrapper = await mountPanel()

      await findRowByName(wrapper, 'React Roll').find('button[aria-label="Editar producto"]').trigger('click')

      expect(wrapper.find('.product-form__title').text()).toBe('Editar producto')
      expect(wrapper.find('#product-name').element.value).toBe('React Roll')
    })

    it('saves the changes, closes the form and updates the row', async () => {
      updateProduct.mockResolvedValue(buildProduct({ id: 1, price: 8.5 }))
      const wrapper = await mountPanel()
      await openEditFormAndChangePrice(wrapper)

      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(updateProduct).toHaveBeenCalledWith(1, expect.objectContaining({ price: 8.5 }))
      expect(wrapper.find('.product-form').exists()).toBe(false)
      expect(findRowByName(wrapper, 'React Roll').text().replace(/\s/g, ' ')).toContain('8,50 €')
    })

    it('shows an error message and keeps the form open when the backend fails', async () => {
      updateProduct.mockRejectedValue(new Error('500'))
      const wrapper = await mountPanel()
      await openEditFormAndChangePrice(wrapper)

      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.find('.product-form__error').text()).toBe(
        'No se han podido guardar los cambios. Inténtalo de nuevo.'
      )
      expect(wrapper.find('.product-form').exists()).toBe(true)
    })
  })
})