import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from './ConfirmDialog.vue'

function mountDialog(props = {}) {
  return mount(ConfirmDialog, {
    props: { title: '¿Eliminar producto?', ...props },
    slots: { default: 'Vas a eliminar <strong>React Roll</strong>.' },
  })
}

function findButtons(wrapper) {
  return wrapper.findAll('button')
}

describe('ConfirmDialog', () => {
  it('shows the title and the message received through the slot', () => {
    const wrapper = mountDialog()

    expect(wrapper.find('h3').text()).toBe('¿Eliminar producto?')
    expect(wrapper.find('strong').text()).toBe('React Roll')
  })

  it('uses the default button labels', () => {
    const [cancelButton, confirmButton] = findButtons(mountDialog())

    expect(cancelButton.text()).toBe('Cancelar')
    expect(confirmButton.text()).toBe('Confirmar')
  })

  it('uses the custom button labels', () => {
    const [cancelButton, confirmButton] = findButtons(
      mountDialog({ confirmLabel: 'Eliminar', cancelLabel: 'Volver' })
    )

    expect(cancelButton.text()).toBe('Volver')
    expect(confirmButton.text()).toBe('Eliminar')
  })

  it('emits confirm when clicking the confirm button', async () => {
    const wrapper = mountDialog()

    await findButtons(wrapper)[1].trigger('click')

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('emits cancel when clicking the cancel button', async () => {
    const wrapper = mountDialog()

    await findButtons(wrapper)[0].trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })
})