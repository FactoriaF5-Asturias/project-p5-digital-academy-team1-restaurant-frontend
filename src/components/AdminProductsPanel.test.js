import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminProductsPanel from './AdminProductsPanel.vue'

function findRowByName(wrapper, name) {
  return wrapper.findAll('tbody tr').find((tr) => tr.text().includes(name))
}

describe('AdminProductsPanel', () => {
  describe('Tabla y filtros', () => {
    it('camino feliz: muestra los 5 productos de ejemplo al cargar', () => {
      const wrapper = mount(AdminProductsPanel)
      expect(wrapper.findAll('tbody tr').length).toBe(5)
    })

    it('muestra el conteo correcto de productos por categoría', () => {
      const wrapper = mount(AdminProductsPanel)
      const buttons = wrapper.findAll('button').map((b) => b.text())

      expect(buttons).toContain('Todas (5)')
      expect(buttons).toContain('Especialidades (2)')
      expect(buttons).toContain('Bebidas (2)')
      expect(buttons).toContain('Postres (1)')
    })

    it('filtra la tabla al pulsar una categoría', async () => {
      const wrapper = mount(AdminProductsPanel)
      const bebidasButton = wrapper.findAll('button').find((b) => b.text() === 'Bebidas (2)')

      await bebidasButton.trigger('click')

      expect(wrapper.findAll('tbody tr').length).toBe(2)
      expect(wrapper.text()).toContain('Sake Junmai')
      expect(wrapper.text()).toContain('Cerveza Asahi')
      expect(wrapper.text()).not.toContain('Deploy Deluxe')
    })

    it('estado vacío: muestra el mensaje cuando una categoría se queda sin productos', async () => {
      const wrapper = mount(AdminProductsPanel)

      // Eliminamos el único producto de Postres
      const row = findRowByName(wrapper, 'Cheesecake de Yuzu')
      await row.find('button[aria-label="Eliminar producto"]').trigger('click')
      const confirmButton = wrapper.findAll('button').find((b) => b.text() === 'Eliminar')
      await confirmButton.trigger('click')

      const postresButton = wrapper.findAll('button').find((b) => b.text() === 'Postres (0)')
      await postresButton.trigger('click')

      expect(wrapper.text()).toContain('No hay productos en esta categoría.')
    })
  })

  describe('Alternar estado activo/desactivado', () => {
    it('camino feliz: cambia el texto y el estado al pulsar Desactivar/Activar', async () => {
      const wrapper = mount(AdminProductsPanel)
      const row = findRowByName(wrapper, 'Deploy Deluxe')
      const toggleButton = row.findAll('button').find((b) => b.text() === 'Desactivar')

      expect(row.text()).toContain('Activo')

      await toggleButton.trigger('click')

      expect(row.text()).toContain('Desactivado')
    })
  })

  describe('Eliminar producto', () => {
    it('muestra el modal de confirmación al pulsar el icono de eliminar', async () => {
      const wrapper = mount(AdminProductsPanel)
      const row = findRowByName(wrapper, 'Sake Junmai')

      expect(wrapper.text()).not.toContain('¿Eliminar producto?')

      await row.find('button[aria-label="Eliminar producto"]').trigger('click')

      expect(wrapper.text()).toContain('¿Eliminar producto?')
    })

    it('cancelar: cierra el modal sin eliminar el producto', async () => {
      const wrapper = mount(AdminProductsPanel)
      const row = findRowByName(wrapper, 'Sake Junmai')

      await row.find('button[aria-label="Eliminar producto"]').trigger('click')
      const cancelButton = wrapper.findAll('button').find((b) => b.text() === 'Cancelar')
      await cancelButton.trigger('click')

      expect(wrapper.text()).not.toContain('¿Eliminar producto?')
      expect(wrapper.findAll('tbody tr').length).toBe(5)
    })

    it('camino feliz: elimina el producto al confirmar', async () => {
      const wrapper = mount(AdminProductsPanel)
      const row = findRowByName(wrapper, 'Sake Junmai')

      await row.find('button[aria-label="Eliminar producto"]').trigger('click')
      const confirmButton = wrapper.findAll('button').find((b) => b.text() === 'Eliminar')
      await confirmButton.trigger('click')

      expect(wrapper.findAll('tbody tr').length).toBe(4)
      expect(wrapper.text()).not.toContain('Sake Junmai')
    })
  })

  describe('Añadir producto', () => {
    async function openForm(wrapper) {
      const addButton = wrapper.findAll('button').find((b) => b.text().includes('Añadir nuevo producto a la carta'))
      await addButton.trigger('click')
    }

    it('abre el formulario al pulsar "+ Añadir nuevo producto a la carta"', async () => {
      const wrapper = mount(AdminProductsPanel)
      expect(wrapper.find('input[placeholder="Ej. Merge Nigiri"]').exists()).toBe(false)

      await openForm(wrapper)

      expect(wrapper.find('input[placeholder="Ej. Merge Nigiri"]').exists()).toBe(true)
    })

    it('error: muestra un mensaje si se intenta guardar con campos vacíos', async () => {
      const wrapper = mount(AdminProductsPanel)
      await openForm(wrapper)

      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.text()).toContain('Completa nombre, precio, stock inicial y descripción.')
    })

    it('error: muestra un mensaje si el precio no es válido', async () => {
      const wrapper = mount(AdminProductsPanel)
      await openForm(wrapper)

      await wrapper.find('input[placeholder="Ej. Merge Nigiri"]').setValue('Test Roll')
      await wrapper.find('textarea').setValue('Descripción de prueba')
      await wrapper.find('input[placeholder="Ej. 12.50"]').setValue('0')
      await wrapper.find('input[placeholder="Ej. 20"]').setValue('10')

      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.text()).toContain('Ingresa un precio válido mayor a 0.')
    })

    it('error: muestra un mensaje si el stock no es válido', async () => {
      const wrapper = mount(AdminProductsPanel)
      await openForm(wrapper)

      await wrapper.find('input[placeholder="Ej. Merge Nigiri"]').setValue('Test Roll')
      await wrapper.find('textarea').setValue('Descripción de prueba')
      await wrapper.find('input[placeholder="Ej. 12.50"]').setValue('9.50')
      await wrapper.find('input[placeholder="Ej. 20"]').setValue('-3')

      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.text()).toContain('Ingresa una cantidad de stock válida (0 o mayor).')
    })

    it('camino feliz: agrega el producto nuevo a la tabla', async () => {
      const wrapper = mount(AdminProductsPanel)
      await openForm(wrapper)

      await wrapper.find('input[placeholder="Ej. Merge Nigiri"]').setValue('Test Roll')
      await wrapper.find('textarea').setValue('Descripción de prueba')
      await wrapper.find('input[placeholder="Ej. 12.50"]').setValue('9.50')
      await wrapper.find('input[placeholder="Ej. 20"]').setValue('10')

      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.findAll('tbody tr').length).toBe(6)
      expect(wrapper.text()).toContain('Test Roll')
      expect(wrapper.text()).toContain('9.50 €')
    })
  })

  describe('Indicador de stock bajo', () => {
    it('muestra la alerta visual en productos con stock igual o menor al umbral', () => {
      const wrapper = mount(AdminProductsPanel)
      const lowStockRow = findRowByName(wrapper, 'Branch Gyozas') // stock: 4

      expect(lowStockRow.text()).toContain('⚠️')
      expect(lowStockRow.text()).toContain('4 uds.')
    })

    it('no muestra la alerta en productos con stock por encima del umbral', () => {
      const wrapper = mount(AdminProductsPanel)
      const normalStockRow = findRowByName(wrapper, 'Cerveza Asahi') // stock: 30

      expect(normalStockRow.text()).not.toContain('⚠️')
      expect(normalStockRow.text()).toContain('30 uds.')
    })
  })

  describe('Editar producto', () => {
    it('abre el modal con los datos del producto precargados', async () => {
      const wrapper = mount(AdminProductsPanel)
      const row = findRowByName(wrapper, 'Deploy Deluxe')

      await row.find('button[aria-label="Editar producto"]').trigger('click')

      expect(wrapper.find('input[type="text"]').element.value).toBe('Deploy Deluxe')
    })

    it('el botón "Guardar cambios" no aparece si no se modificó nada', async () => {
      const wrapper = mount(AdminProductsPanel)
      const row = findRowByName(wrapper, 'Deploy Deluxe')

      await row.find('button[aria-label="Editar producto"]').trigger('click')

      expect(wrapper.text()).not.toContain('Guardar cambios')
    })

    it('camino feliz: el botón "Guardar cambios" aparece al modificar un campo', async () => {
      const wrapper = mount(AdminProductsPanel)
      const row = findRowByName(wrapper, 'Deploy Deluxe')

      await row.find('button[aria-label="Editar producto"]').trigger('click')
      await wrapper.find('input[type="text"]').setValue('Deploy Deluxe Premium')

      expect(wrapper.text()).toContain('Guardar cambios')
    })

    it('cancelar: cierra el modal sin aplicar cambios', async () => {
      const wrapper = mount(AdminProductsPanel)
      const row = findRowByName(wrapper, 'Deploy Deluxe')

      await row.find('button[aria-label="Editar producto"]').trigger('click')
      await wrapper.find('input[type="text"]').setValue('Nombre Cambiado')

      const cancelButton = wrapper.findAll('button').find((b) => b.text() === 'Cancelar')
      await cancelButton.trigger('click')

      expect(wrapper.text()).not.toContain('Editar producto')
      expect(wrapper.text()).toContain('Deploy Deluxe')
      expect(wrapper.text()).not.toContain('Nombre Cambiado')
    })

    it('guarda los cambios en la tabla al confirmar', async () => {
      const wrapper = mount(AdminProductsPanel)
      const row = findRowByName(wrapper, 'Deploy Deluxe')

      await row.find('button[aria-label="Editar producto"]').trigger('click')
      await wrapper.find('input[type="text"]').setValue('Deploy Deluxe Premium')
      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.text()).toContain('Deploy Deluxe Premium')
    })

    it('las flechas +/- ajustan el stock dentro del modal y se refleja al guardar', async () => {
      const wrapper = mount(AdminProductsPanel)
      const row = findRowByName(wrapper, 'Cerveza Asahi') // stock: 30

      await row.find('button[aria-label="Editar producto"]').trigger('click')

      const incrementButton = wrapper.find('button[aria-label="Aumentar stock"]')
      await incrementButton.trigger('click')
      await incrementButton.trigger('click')

      await wrapper.find('form').trigger('submit.prevent')

      const updatedRow = findRowByName(wrapper, 'Cerveza Asahi')
      expect(updatedRow.text()).toContain('32 uds.')
    })

    it('error: muestra un mensaje si el nombre queda vacío', async () => {
      const wrapper = mount(AdminProductsPanel)
      const row = findRowByName(wrapper, 'Deploy Deluxe')

      await row.find('button[aria-label="Editar producto"]').trigger('click')
      await wrapper.find('input[type="text"]').setValue('')
      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.text()).toContain('Completa nombre, precio, stock y descripción.')
    })
  })
})