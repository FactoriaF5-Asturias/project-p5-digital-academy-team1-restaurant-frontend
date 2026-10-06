import api from './api'

// Endpoints de gestión de usuarios (solo ADMIN, backend de Daniel).
const USERS_ENDPOINT = '/api/v1/users'
export const USERS_PAGE_SIZE = 10
// Orden fijo para que un usuario no cambie de sitio al editarlo.
const USERS_SORT = 'email,asc'

// Pide una página de usuarios. `page` empieza en 1 en el front y en 0 en Spring.
// El backend pagina con VIA_DTO: { content: [...], page: { totalPages, ... } }.
export async function getUsers({ page = 1, size = USERS_PAGE_SIZE } = {}) {
  const response = await api.get(USERS_ENDPOINT, {
    params: { page: page - 1, size, sort: USERS_SORT },
  })

  return {
    items: response.data.content,
    totalPages: response.data.page.totalPages,
  }
}

// Cambia solo los campos que se envían, por ejemplo { active: false } o { role }.
// Devuelve el usuario ya actualizado.
export async function updateUser(id, changes) {
  const response = await api.patch(`${USERS_ENDPOINT}/${id}`, changes)
  return response.data
}

export async function deleteUser(id) {
  await api.delete(`${USERS_ENDPOINT}/${id}`)
}

// Guarda los datos del propio perfil (cualquier usuario con sesión, no solo ADMIN).
// El backend solo deja editar la cuenta propia y devuelve el usuario actualizado.
export async function updateProfile(id, profile) {
  const response = await api.put(`${USERS_ENDPOINT}/${id}`, profile)
  return response.data
}