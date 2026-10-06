import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InvoicesSearch from './InvoicesSearch.vue'

describe('InvoicesSearch', () => {
  it('tiene un campo con etiqueta para buscar por ID, mesa o cliente', () => {
    const wrapper = mount(InvoicesSearch)

    expect(wrapper.find('label[for="invoices-search-input"]').text()).toBe('Buscar factura')
    expect(wrapper.find('#invoices-search-input').attributes('placeholder')).toBe('ID de factura, mesa o cliente')
  })

  it('emite search con el texto sin espacios sobrantes', async () => {
    const wrapper = mount(InvoicesSearch)

    await wrapper.find('#invoices-search-input').setValue('  Luisa  ')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('search')[0]).toEqual(['Luisa'])
  })

  it('solo muestra el botón Limpiar cuando hay texto', async () => {
    const wrapper = mount(InvoicesSearch)
    expect(wrapper.text()).not.toContain('Limpiar')

    await wrapper.find('#invoices-search-input').setValue('Mesa 4')

    expect(wrapper.text()).toContain('Limpiar')
  })

  it('al limpiar vacía el campo y emite una búsqueda vacía', async () => {
    const wrapper = mount(InvoicesSearch)
    await wrapper.find('#invoices-search-input').setValue('Mesa 4')

    await wrapper.find('button[type="button"]').trigger('click')

    expect(wrapper.find('#invoices-search-input').element.value).toBe('')
    expect(wrapper.emitted('search')[0]).toEqual([''])
  })
})