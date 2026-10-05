import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductFormModal from './ProductFormModal.vue'
import { PRODUCT_FORM_MODES } from '../constants/productFormModes'
import { PRODUCT_FORM_ERRORS } from '../utils/productValidation'

function buildProduct(overrides = {}) {
  return {
    id: 1,
    name: 'React Roll',
    category: 'ROLLS',
    imageUrl: 'react-roll.png',
    price: 7.9,
    stock: 20,
    description: 'Roll de sushi fresco',
    ...overrides,
  }
}

function mountCreateForm(props = {}) {
  return mount(ProductFormModal, { props: { mode: PRODUCT_FORM_MODES.CREATE, ...props } })
}

function mountEditForm(product = buildProduct(), props = {}) {
  return mount(ProductFormModal, {
    props: { mode: PRODUCT_FORM_MODES.EDIT, initialProduct: product, ...props },
  })
}

async function fillCreateForm(wrapper) {
  await wrapper.find('#product-name').setValue('  Merge Nigiri  ')
  await wrapper.find('#product-image').setValue('merge-nigiri.png')
  await wrapper.find('#product-category').setValue('NIGIRI')
  await wrapper.find('#product-price').setValue('6.50')
  await wrapper.find('#product-stock').setValue('20')
  await wrapper.find('#product-description').setValue('Nigiri de salmón')
}

describe('ProductFormModal', () => {
  describe('create mode', () => {
    it('shows the create title, the image field and an empty form', () => {
      const wrapper = mountCreateForm()

      expect(wrapper.find('h3').text()).toBe('Añadir nuevo producto a la carta')
      expect(wrapper.find('#product-image').exists()).toBe(true)
      expect(wrapper.find('#product-name').element.value).toBe('')
      expect(wrapper.find('#product-category').element.value).toBe('ESPECIALES')
    })

    it('emits submit with clean data when the form is valid', async () => {
      const wrapper = mountCreateForm()
      await fillCreateForm(wrapper)

      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.emitted('submit')[0]).toEqual([
        {
          name: 'Merge Nigiri',
          category: 'NIGIRI',
          imageUrl: 'merge-nigiri.png',
          price: 6.5,
          stock: 20,
          description: 'Nigiri de salmón',
        },
      ])
    })

    it('shows the validation error and does not emit submit when the form is empty', async () => {
      const wrapper = mountCreateForm()

      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.text()).toContain(PRODUCT_FORM_ERRORS.REQUIRED_FIELDS)
      expect(wrapper.emitted('submit')).toBeUndefined()
    })

    it('requires the image in create mode', async () => {
      const wrapper = mountCreateForm()
      await fillCreateForm(wrapper)
      await wrapper.find('#product-image').setValue('')

      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.text()).toContain(PRODUCT_FORM_ERRORS.REQUIRED_FIELDS)
      expect(wrapper.emitted('submit')).toBeUndefined()
    })
  })

  describe('edit mode', () => {
    it('shows the edit title, hides the image field and fills the form with the product', () => {
      const wrapper = mountEditForm()

      expect(wrapper.find('h3').text()).toBe('Editar producto')
      expect(wrapper.find('#product-image').exists()).toBe(false)
      expect(wrapper.find('#product-name').element.value).toBe('React Roll')
      expect(wrapper.find('#product-price').element.value).toBe('7.9')
    })

    it('uses 0 as stock when the product has no stock yet', () => {
      const wrapper = mountEditForm(buildProduct({ stock: undefined }))

      expect(wrapper.find('#product-stock').element.value).toBe('0')
    })

    it('only shows the save button after changing something', async () => {
      const wrapper = mountEditForm()
      expect(wrapper.find('button[type="submit"]').exists()).toBe(false)

      await wrapper.find('#product-price').setValue('8.50')

      expect(wrapper.find('button[type="submit"]').text()).toBe('Guardar cambios')
    })

    it('emits submit with the edited data', async () => {
      const wrapper = mountEditForm()
      await wrapper.find('#product-price').setValue('8.50')

      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.emitted('submit')[0][0]).toMatchObject({ name: 'React Roll', price: 8.5 })
    })
  })

  describe('stock buttons', () => {
    it('increases the stock by one', async () => {
      const wrapper = mountEditForm(buildProduct({ stock: 3 }))

      await wrapper.find('button[aria-label="Aumentar stock"]').trigger('click')

      expect(wrapper.find('#product-stock').element.value).toBe('4')
    })

    it('decreases the stock by one but never below zero', async () => {
      const wrapper = mountEditForm(buildProduct({ stock: 1 }))
      const decreaseButton = wrapper.find('button[aria-label="Disminuir stock"]')

      await decreaseButton.trigger('click')
      await decreaseButton.trigger('click')

      expect(wrapper.find('#product-stock').element.value).toBe('0')
    })

    it('starts from zero when the stock field is empty', async () => {
      const wrapper = mountCreateForm()

      await wrapper.find('button[aria-label="Aumentar stock"]').trigger('click')

      expect(wrapper.find('#product-stock').element.value).toBe('1')
    })
  })

  describe('parent feedback', () => {
    it('shows the error message sent by the parent', () => {
      const wrapper = mountCreateForm({ errorMessage: 'Ya existe un producto con ese nombre.' })

      expect(wrapper.text()).toContain('Ya existe un producto con ese nombre.')
    })

    it('disables the save button and changes its text while saving', () => {
      const wrapper = mountCreateForm({ isSaving: true })
      const submitButton = wrapper.find('button[type="submit"]')

      expect(submitButton.text()).toBe('Guardando...')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('emits cancel when clicking the cancel button', async () => {
      const wrapper = mountCreateForm()

      await wrapper.find('button[type="button"].product-form__button').trigger('click')

      expect(wrapper.emitted('cancel')).toHaveLength(1)
    })
  })
})