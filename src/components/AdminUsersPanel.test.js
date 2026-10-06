import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AdminUsersPanel from './AdminUsersPanel.vue'
import { useAuthStore } from '../stores/auth'
import { deleteUser, getUsers, updateUser } from '../services/users.service'

vi.mock('../services/users.service', () => ({
  getUsers: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

const ADMIN = {
  id: 'admin-id',
  firstName: 'Siquis',
  lastName: 'Miquis',
  email: 'admin@gitsushi.com',
  roles: ['ROLE_ADMIN'],
  active: true,
}

const CUSTOMER = {
  id: 'customer-id',
  firstName: 'Laura',
  lastName: 'Gómez',
  email: 'customer@gitsushi.com',
  address: 'Calle Mayor 5',
  postalCode: '33401',
  city: 'Avilés',
  roles: ['ROLE_CUSTOMER'],
  active: true,
}

async function mountPanel() {
  const wrapper = mount(AdminUsersPanel)
  await flushPromises()
  return wrapper
}

describe('AdminUsersPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    setActivePinia(createPinia())
    useAuthStore().user = ADMIN
    getUsers.mockResolvedValue({ items: [ADMIN, CUSTOMER], totalPages: 1 })
  })

  it('muestra el título de la sección', async () => {
    const wrapper = await mountPanel()

    expect(wrapper.find('h2').text()).toBe('Gestión de usuarios')
  })

  it('muestra el cargador mientras llegan los usuarios', async () => {
    getUsers.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(AdminUsersPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Cargando usuarios...')
  })

  it('carga los usuarios al abrirse y marca la cuenta propia', async () => {
    const wrapper = await mountPanel()

    expect(getUsers).toHaveBeenCalledWith({ page: 1 })
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(wrapper.findAll('tbody tr')[0].text()).toContain('(tú)')
  })

  it('muestra un error si no se pueden cargar', async () => {
    getUsers.mockRejectedValue(new Error('500'))
    const wrapper = await mountPanel()

    expect(wrapper.text()).toContain('No se han podido cargar los usuarios.')
  })

  it('no muestra la paginación si solo hay una página', async () => {
    const wrapper = await mountPanel()

    expect(wrapper.find('.pagination-control').exists()).toBe(false)
  })

    it('pide confirmación antes de cambiar el rol y no cambia nada si se cancela', async () => {
    const wrapper = await mountPanel()
    const select = wrapper.findAll('tbody tr')[1].find('select')

    await select.setValue('ROLE_COOK')

    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.text()).toContain('¿Estás seguro de cambiar el rol de Laura Gómez?')
    expect(dialog.text()).toContain('Pasará de Cliente a Cocina')

    await wrapper.find('.confirm-dialog__button').trigger('click')

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(updateUser).not.toHaveBeenCalled()
    expect(select.element.value).toBe('ROLE_CUSTOMER')
  })

  it('cambia el rol al confirmar y muestra el nuevo rol', async () => {
    updateUser.mockResolvedValue({ ...CUSTOMER, roles: ['ROLE_COOK'] })
    const wrapper = await mountPanel()

    await wrapper.findAll('tbody tr')[1].find('select').setValue('ROLE_COOK')
    await wrapper.find('.confirm-dialog__button--danger').trigger('click')
    await flushPromises()

    expect(updateUser).toHaveBeenCalledWith('customer-id', { role: 'ROLE_COOK' })
    expect(wrapper.findAll('tbody tr')[1].find('select').element.value).toBe('ROLE_COOK')
  })

  it('pide confirmación antes de desactivar y no cambia nada si se cancela', async () => {
    const wrapper = await mountPanel()

    await wrapper.findAll('tbody tr')[1].find('button').trigger('click')
    expect(wrapper.find('[role="dialog"]').text()).toContain(
      '¿Estás seguro de desactivar a Laura Gómez?'
    )

    await wrapper.find('.confirm-dialog__button').trigger('click')

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(updateUser).not.toHaveBeenCalled()
  })

  it('desactiva al confirmar y muestra el nuevo estado', async () => {
    updateUser.mockResolvedValue({ ...CUSTOMER, active: false })
    const wrapper = await mountPanel()

    await wrapper.findAll('tbody tr')[1].find('button').trigger('click')
    await wrapper.find('.confirm-dialog__button--danger').trigger('click')
    await flushPromises()

    expect(updateUser).toHaveBeenCalledWith('customer-id', { active: false })
    expect(wrapper.findAll('tbody tr')[1].find('.users-table__badge').text()).toBe('Inactivo')
  })

  it('activa sin pedir confirmación', async () => {
    getUsers.mockResolvedValue({ items: [ADMIN, { ...CUSTOMER, active: false }], totalPages: 1 })
    updateUser.mockResolvedValue({ ...CUSTOMER, active: true })
    const wrapper = await mountPanel()

    await wrapper.findAll('tbody tr')[1].find('button').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(updateUser).toHaveBeenCalledWith('customer-id', { active: true })
  })

  it('abre la ventana de edición con los datos del usuario', async () => {
    const wrapper = await mountPanel()

    await wrapper.find('[aria-label="Editar a Laura Gómez"]').trigger('click')

    expect(wrapper.find('[aria-label="Editar usuario"]').exists()).toBe(true)
    expect(wrapper.find('#user-first-name').element.value).toBe('Laura')
  })

  it('guarda los cambios, cierra la ventana y actualiza la fila', async () => {
    updateUser.mockResolvedValue({ ...CUSTOMER, firstName: 'Lucía' })
    const wrapper = await mountPanel()

    await wrapper.find('[aria-label="Editar a Laura Gómez"]').trigger('click')
    await wrapper.find('#user-first-name').setValue('Lucía')
    await wrapper.find('.user-form__form').trigger('submit')
    await flushPromises()

    expect(updateUser).toHaveBeenCalledWith('customer-id', {
      firstName: 'Lucía',
      lastName: 'Gómez',
      email: 'customer@gitsushi.com',
      address: 'Calle Mayor 5',
      postalCode: '33401',
      city: 'Avilés',
    })
    expect(wrapper.find('[aria-label="Editar usuario"]').exists()).toBe(false)
    expect(wrapper.findAll('tbody tr')[1].text()).toContain('Lucía Gómez')
  })

  it('mantiene la ventana abierta y muestra el error si no se puede guardar', async () => {
    updateUser.mockRejectedValue(new Error('500'))
    const wrapper = await mountPanel()

    await wrapper.find('[aria-label="Editar a Laura Gómez"]').trigger('click')
    await wrapper.find('#user-first-name').setValue('Lucía')
    await wrapper.find('.user-form__form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('[aria-label="Editar usuario"]').exists()).toBe(true)
    expect(wrapper.find('.user-form [role="alert"]').text()).toBe(
      'No se han podido guardar los datos. Revisa que el email no lo use otra cuenta.'
    )
  })

  it('cierra la ventana de edición al cancelar sin guardar', async () => {
    const wrapper = await mountPanel()

    await wrapper.find('[aria-label="Editar a Laura Gómez"]').trigger('click')
    await wrapper.find('[aria-label="Cerrar"]').trigger('click')

    expect(wrapper.find('[aria-label="Editar usuario"]').exists()).toBe(false)
    expect(updateUser).not.toHaveBeenCalled()
  })

  it('pide confirmación antes de eliminar y no borra si se cancela', async () => {
    const wrapper = await mountPanel()

    await wrapper.find('[aria-label="Eliminar a Laura Gómez"]').trigger('click')
    expect(wrapper.find('[role="dialog"]').text()).toContain(
      '¿Estás seguro de eliminar a Laura Gómez?'
    )

    await wrapper.find('.confirm-dialog__button').trigger('click')

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(deleteUser).not.toHaveBeenCalled()
  })

  it('elimina al confirmar', async () => {
    deleteUser.mockResolvedValue()
    const wrapper = await mountPanel()

    await wrapper.find('[aria-label="Eliminar a Laura Gómez"]').trigger('click')
    await wrapper.find('.confirm-dialog__button--danger').trigger('click')
    await flushPromises()

    expect(deleteUser).toHaveBeenCalledWith('customer-id')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('avisa si no se puede eliminar', async () => {
    deleteUser.mockRejectedValue(new Error('409'))
    const wrapper = await mountPanel()

    await wrapper.find('[aria-label="Eliminar a Laura Gómez"]').trigger('click')
    await wrapper.find('.confirm-dialog__button--danger').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toBe(
      'No se ha podido eliminar el usuario. Si tiene pedidos, desactívalo en su lugar.'
    )
  })
})