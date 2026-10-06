import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './api'
import { deleteUser, getUsers, updateProfile, updateUser, USERS_PAGE_SIZE } from './users.service'

vi.mock('./api', () => ({
    default: { get: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const USERS = [{ id: 'a' }, { id: 'b' }]

describe('users.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.get.mockResolvedValue({
      data: { content: USERS, page: { size: 10, number: 0, totalElements: 12, totalPages: 2 } },
    })
  })

  it('pide la primera página de usuarios ordenada por email', async () => {
    await getUsers()

    expect(api.get).toHaveBeenCalledWith('/api/v1/users', {
      params: { page: 0, size: USERS_PAGE_SIZE, sort: 'email,asc' },
    })
  })

  it('convierte la página del front (empieza en 1) a la de Spring (empieza en 0)', async () => {
    await getUsers({ page: 2 })

    expect(api.get.mock.calls[0][1].params.page).toBe(1)
  })

  it('devuelve los usuarios y el total de páginas que viene dentro de "page"', async () => {
    expect(await getUsers()).toEqual({ items: USERS, totalPages: 2 })
  })

  it('envía solo los campos que cambian y devuelve el usuario actualizado', async () => {
    const updated = { id: 'a', active: false }
    api.patch.mockResolvedValue({ data: updated })

    const result = await updateUser('a', { active: false })

    expect(api.patch).toHaveBeenCalledWith('/api/v1/users/a', { active: false })
    expect(result).toEqual(updated)
  })

  it('elimina un usuario por su id', async () => {
    api.delete.mockResolvedValue({})

    await deleteUser('a')

    expect(api.delete).toHaveBeenCalledWith('/api/v1/users/a')
  })
  
  it('guarda el propio perfil con PUT y devuelve el usuario actualizado', async () => {
    const profile = {
      firstName: 'Ana',
      lastName: 'Pérez',
      email: 'ana@example.com',
      address: 'Calle Mayor 10',
      postalCode: '28001',
      city: 'Madrid',
    }
    api.put.mockResolvedValue({ data: { id: 'a', ...profile } })

    const result = await updateProfile('a', profile)

    expect(api.put).toHaveBeenCalledWith('/api/v1/users/a', profile)
    expect(result).toEqual({ id: 'a', ...profile })
  })
})