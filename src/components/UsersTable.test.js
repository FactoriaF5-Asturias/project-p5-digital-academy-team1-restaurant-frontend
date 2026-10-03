import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UsersTable from './UsersTable.vue'

const ADMIN = {
  id: 'admin-id',
  firstName: 'Siquis',
  lastName: 'Miquis',
  email: 'admin@gitsushi.com',
  roles: ['ROLE_ADMIN'],
  active: true,
}

const COOK = {
  id: 'cook-id',
  firstName: 'Kenji',
  lastName: 'Sato',
  email: 'cook@gitsushi.com',
  roles: ['ROLE_COOK'],
  active: false,
}

function mountTable(props = {}) {
  return mount(UsersTable, {
    props: { users: [ADMIN, COOK], currentUserId: 'admin-id', ...props },
  })
}

function getRow(wrapper, index) {
  return wrapper.findAll('tbody tr')[index]
}

describe('UsersTable', () => {
  it('muestra nombre, email, rol y estado de cada usuario', () => {
    const row = getRow(mountTable(), 1)

    expect(row.text()).toContain('Kenji Sato')
    expect(row.text()).toContain('cook@gitsushi.com')
    expect(row.find('select').element.value).toBe('ROLE_COOK')
    expect(row.find('.users-table__badge').text()).toBe('Inactivo')
  })

  it('ofrece los cuatro roles en español', () => {
    const options = getRow(mountTable(), 1)
      .findAll('option')
      .map((option) => option.text())

    expect(options).toEqual(['Cliente', 'Cocina', 'Repartidor', 'Administrador'])
  })

  it('muestra un mensaje si no hay usuarios', () => {
    expect(mountTable({ users: [] }).text()).toContain('No hay usuarios que mostrar.')
  })

  it('bloquea la cuenta del propio administrador', () => {
    const row = getRow(mountTable(), 0)

    expect(row.text()).toContain('(tú)')
    expect(row.find('select').attributes('disabled')).toBeDefined()
    expect(row.findAll('button')).toHaveLength(0)
  })

  it('avisa al cambiar el rol', async () => {
    const wrapper = mountTable()

    await getRow(wrapper, 1).find('select').setValue('ROLE_DELIVERYMAN')

    expect(wrapper.emitted('change-role')[0]).toEqual([COOK, 'ROLE_DELIVERYMAN'])
  })

  
  it('deja el rol actual en el desplegable hasta que el padre lo cambie', async () => {
    const wrapper = mountTable()
    const select = getRow(wrapper, 1).find('select')

    await select.setValue('ROLE_DELIVERYMAN')

    expect(select.element.value).toBe('ROLE_COOK')
  })

  it('el botón dice "Activar" o "Desactivar" según el estado y avisa al pulsarlo', async () => {
    const wrapper = mountTable({ users: [COOK, { ...COOK, id: 'x', active: true }] })
    const [inactiveButton] = getRow(wrapper, 0).findAll('button')
    const [activeButton] = getRow(wrapper, 1).findAll('button')

    expect(inactiveButton.text()).toBe('Activar')
    expect(activeButton.text()).toBe('Desactivar')

    await inactiveButton.trigger('click')
    expect(wrapper.emitted('toggle-active')[0]).toEqual([COOK])
  })

    it('avisa al pedir editar un usuario', async () => {
    const wrapper = mountTable()

    await getRow(wrapper, 1).find('[aria-label="Editar a Kenji Sato"]').trigger('click')

    expect(wrapper.emitted('edit')[0]).toEqual([COOK])
  })

  it('avisa al pedir eliminar un usuario', async () => {
    const wrapper = mountTable()

    await getRow(wrapper, 1).find('[aria-label="Eliminar a Kenji Sato"]').trigger('click')

    expect(wrapper.emitted('delete')[0]).toEqual([COOK])
  })

  it('bloquea los controles del usuario que se está guardando', () => {
    const row = getRow(mountTable({ pendingUserId: 'cook-id' }), 1)

    expect(row.find('select').attributes('disabled')).toBeDefined()
    row.findAll('button').forEach((button) => {
      expect(button.attributes('disabled')).toBeDefined()
    })
  })
})