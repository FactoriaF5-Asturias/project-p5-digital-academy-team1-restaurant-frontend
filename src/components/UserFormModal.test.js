import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserFormModal from './UserFormModal.vue'
import { USER_FORM_ERRORS } from '../utils/userValidation'

const USER = {
  id: 'customer-id',
  firstName: 'Laura',
  lastName: 'Gómez',
  email: 'laura@gitsushi.com',
  address: 'Calle Mayor 5',
  postalCode: '33401',
  city: 'Avilés',
  roles: ['ROLE_CUSTOMER'],
  active: true,
}

let wrapper

function mountModal(props = {}) {
  wrapper = mount(UserFormModal, { props: { initialUser: USER, ...props } })
  return wrapper
}

describe('UserFormModal', () => {
  afterEach(() => {
    wrapper?.unmount()
  })

  it('rellena el formulario con los datos del usuario', () => {
    mountModal()

    expect(wrapper.find('#user-first-name').element.value).toBe('Laura')
    expect(wrapper.find('#user-last-name').element.value).toBe('Gómez')
    expect(wrapper.find('#user-email').element.value).toBe('laura@gitsushi.com')
    expect(wrapper.find('#user-address').element.value).toBe('Calle Mayor 5')
    expect(wrapper.find('#user-postal-code').element.value).toBe('33401')
    expect(wrapper.find('#user-city').element.value).toBe('Avilés')
  })

  it('solo muestra "Guardar cambios" cuando algo ha cambiado', async () => {
    mountModal()
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)

    await wrapper.find('#user-first-name').setValue('Lucía')

    expect(wrapper.find('button[type="submit"]').text()).toBe('Guardar cambios')
  })

  it('emite los datos limpios al guardar', async () => {
    mountModal()

    await wrapper.find('#user-first-name').setValue('  Lucía ')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')[0][0]).toEqual({
      firstName: 'Lucía',
      lastName: 'Gómez',
      email: 'laura@gitsushi.com',
      address: 'Calle Mayor 5',
      postalCode: '33401',
      city: 'Avilés',
    })
  })

  it('no emite y muestra el error si falta un campo', async () => {
    mountModal()

    await wrapper.find('#user-city').setValue('')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('[role="alert"]').text()).toBe(USER_FORM_ERRORS.REQUIRED_FIELDS)
  })

  it('no emite si el email no es válido', async () => {
    mountModal()

    await wrapper.find('#user-email').setValue('laura@')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('[role="alert"]').text()).toBe(USER_FORM_ERRORS.INVALID_EMAIL)
  })

  it('muestra el error que llega del padre', () => {
    mountModal({ errorMessage: 'No se han podido guardar los datos.' })

    expect(wrapper.find('[role="alert"]').text()).toBe('No se han podido guardar los datos.')
  })

  it('bloquea el botón y muestra "Guardando..." mientras guarda', async () => {
    mountModal({ isSaving: true })
    await wrapper.find('#user-first-name').setValue('Lucía')

    const submit = wrapper.find('button[type="submit"]')
    expect(submit.text()).toBe('Guardando...')
    expect(submit.attributes('disabled')).toBeDefined()
  })

  it('se cierra con Cancelar, con la X y con la tecla Escape', async () => {
    mountModal()

    await wrapper.find('[aria-label="Cerrar"]').trigger('click')
    await wrapper.findAll('button').find((button) => button.text() === 'Cancelar').trigger('click')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted('cancel')).toHaveLength(3)
  })

  it('deja de escuchar la tecla Escape al cerrarse', () => {
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener')
    mountModal()

    wrapper.unmount()
    wrapper = null

    expect(removeListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeListenerSpy.mockRestore()
  })
})