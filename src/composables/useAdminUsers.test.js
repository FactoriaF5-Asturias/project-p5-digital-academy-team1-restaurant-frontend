import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAdminUsers } from './useAdminUsers'
import { deleteUser, getUsers, updateUser } from '../services/users.service'

vi.mock('../services/users.service', () => ({
  getUsers: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

function buildUser(id, overrides = {}) {
  return {
    id,
    firstName: 'Ana',
    lastName: id,
    email: `${id}@gitsushi.com`,
    roles: ['ROLE_CUSTOMER'],
    active: true,
    ...overrides,
  }
}

async function loadedState(items = [buildUser('a'), buildUser('b')], totalPages = 1) {
  getUsers.mockResolvedValue({ items, totalPages })
  const state = useAdminUsers()
  await state.loadUsers()
  return state
}

describe('useAdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('carga la primera página de usuarios', async () => {
    const { users, totalPages, loadError } = await loadedState()

    expect(getUsers).toHaveBeenCalledWith({ page: 1 })
    expect(users.value).toHaveLength(2)
    expect(totalPages.value).toBe(1)
    expect(loadError.value).toBe('')
  })

  it('muestra un error y vacía la lista si no se pueden cargar', async () => {
    getUsers.mockRejectedValue(new Error('500'))
    const { users, loadError, isLoading, loadUsers } = useAdminUsers()

    await loadUsers()

    expect(users.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(loadError.value).toBe('No se han podido cargar los usuarios. Inténtalo de nuevo más tarde.')
  })

  it('cambia de página dentro del rango y no sale de él', async () => {
    const { goToPage, currentPage } = await loadedState(undefined, 3)

    await goToPage(2)
    expect(currentPage.value).toBe(2)
    expect(getUsers).toHaveBeenLastCalledWith({ page: 2 })

    await goToPage(4)
    expect(currentPage.value).toBe(2)
  })

  it('cambia el rol y sustituye al usuario por el que devuelve el backend', async () => {
    const state = await loadedState()
    updateUser.mockResolvedValue(buildUser('a', { roles: ['ROLE_COOK'] }))

    await state.changeRole(state.users.value[0], 'ROLE_COOK')

    expect(updateUser).toHaveBeenCalledWith('a', { role: 'ROLE_COOK' })
    expect(state.users.value[0].roles).toEqual(['ROLE_COOK'])
    expect(state.pendingUserId.value).toBeNull()
  })

  it('activa o desactiva enviando el estado contrario al actual', async () => {
    const state = await loadedState()
    updateUser.mockResolvedValue(buildUser('a', { active: false }))

    await state.toggleActive(state.users.value[0])

    expect(updateUser).toHaveBeenCalledWith('a', { active: false })
    expect(state.users.value[0].active).toBe(false)
  })

  it('marca al usuario como pendiente mientras responde el backend', async () => {
    const state = await loadedState()
    updateUser.mockReturnValue(new Promise(() => {}))

    state.toggleActive(state.users.value[0])

    expect(state.pendingUserId.value).toBe('a')
  })

  it('avisa si no se puede guardar el cambio', async () => {
    const state = await loadedState()
    updateUser.mockRejectedValue(new Error('500'))

    await state.toggleActive(state.users.value[0])

    expect(state.actionError.value).toBe('No se ha podido guardar el cambio. Inténtalo de nuevo.')
    expect(state.users.value[0].active).toBe(true)
    expect(state.pendingUserId.value).toBeNull()
  })

    it('guarda los datos editados y sustituye al usuario en la lista', async () => {
    const state = await loadedState()
    const changes = { firstName: 'Lucía' }
    updateUser.mockResolvedValue(buildUser('a', changes))

    await state.saveUserData('a', changes)

    expect(updateUser).toHaveBeenCalledWith('a', changes)
    expect(state.users.value[0].firstName).toBe('Lucía')
  })

  it('deja pasar el error al guardar los datos para que lo muestre la ventana', async () => {
    const state = await loadedState()
    updateUser.mockRejectedValue(new Error('500'))

    await expect(state.saveUserData('a', { firstName: 'Lucía' })).rejects.toThrow('500')
    expect(state.users.value[0].firstName).toBe('Ana')
  })

  it('elimina un usuario y recarga la página actual', async () => {
    const state = await loadedState()
    deleteUser.mockResolvedValue()
    getUsers.mockResolvedValue({ items: [buildUser('b')], totalPages: 1 })

    await state.removeUser(state.users.value[0])

    expect(deleteUser).toHaveBeenCalledWith('a')
    expect(state.users.value.map((user) => user.id)).toEqual(['b'])
  })

  it('vuelve a la página anterior si borra el último usuario de una página', async () => {
    const state = await loadedState([buildUser('a'), buildUser('b')], 2)
    getUsers.mockResolvedValue({ items: [buildUser('c')], totalPages: 2 })
    await state.goToPage(2)
    deleteUser.mockResolvedValue()
    getUsers.mockResolvedValue({ items: [buildUser('a'), buildUser('b')], totalPages: 1 })

    await state.removeUser(state.users.value[0])

    expect(state.currentPage.value).toBe(1)
    expect(getUsers).toHaveBeenLastCalledWith({ page: 1 })
  })

  it('avisa si no se puede eliminar (por ejemplo, si tiene pedidos)', async () => {
    const state = await loadedState()
    deleteUser.mockRejectedValue(new Error('409'))

    await state.removeUser(state.users.value[0])

    expect(state.actionError.value).toBe(
      'No se ha podido eliminar el usuario. Si tiene pedidos, desactívalo en su lugar.'
    )
    expect(state.users.value).toHaveLength(2)
  })
})