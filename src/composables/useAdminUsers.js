import { ref } from 'vue'
import { deleteUser, getUsers, updateUser } from '../services/users.service'

// Responsabilidad: estado de la gestión de usuarios (lista, página, carga,
// errores) y las acciones sobre un usuario: cambiar rol, activar/desactivar,
// editar sus datos y eliminar.

const FIRST_PAGE = 1
const LOAD_ERROR_MESSAGE = 'No se han podido cargar los usuarios. Inténtalo de nuevo más tarde.'
const UPDATE_ERROR_MESSAGE = 'No se ha podido guardar el cambio. Inténtalo de nuevo.'
const DELETE_ERROR_MESSAGE =
  'No se ha podido eliminar el usuario. Si tiene pedidos, desactívalo en su lugar.'

export function useAdminUsers() {
  const users = ref([])
  const isLoading = ref(false)
  const loadError = ref('')
  const actionError = ref('')
  const pendingUserId = ref(null)
  const currentPage = ref(FIRST_PAGE)
  const totalPages = ref(0)

  async function loadUsers() {
    isLoading.value = true
    loadError.value = ''

    try {
      const result = await getUsers({ page: currentPage.value })
      users.value = result.items
      totalPages.value = result.totalPages
    } catch (err) {
      users.value = []
      totalPages.value = 0
      loadError.value = LOAD_ERROR_MESSAGE
      console.error('[useAdminUsers] Error al obtener los usuarios:', err)
    } finally {
      isLoading.value = false
    }
  }

  function goToPage(page) {
    if (page < FIRST_PAGE || page > totalPages.value) return
    currentPage.value = page
    return loadUsers()
  }

  function replaceUser(updatedUser) {
    users.value = users.value.map((user) => (user.id === updatedUser.id ? updatedUser : user))
  }

  // Ejecuta una acción sobre un usuario marcándolo como "pendiente" para
  // bloquear sus controles mientras responde el backend.
  async function runUserAction(userId, action, errorMessage) {
    pendingUserId.value = userId
    actionError.value = ''

    try {
      await action()
    } catch (err) {
      actionError.value = errorMessage
      console.error('[useAdminUsers] Error en la acción sobre el usuario:', err)
    } finally {
      pendingUserId.value = null
    }
  }

  function changeRole(user, role) {
    return runUserAction(
      user.id,
      async () => replaceUser(await updateUser(user.id, { role })),
      UPDATE_ERROR_MESSAGE
    )
  }

  function toggleActive(user) {
    return runUserAction(
      user.id,
      async () => replaceUser(await updateUser(user.id, { active: !user.active })),
      UPDATE_ERROR_MESSAGE
    )
  }

  // Guarda los datos editados en la ventana. No captura el error: lo muestra
  // la propia ventana para que el administrador pueda corregir y reintentar.
  async function saveUserData(userId, changes) {
    replaceUser(await updateUser(userId, changes))
  }

  // Si se borra el último usuario de una página, se vuelve a la anterior.
  function removeUser(user) {
    return runUserAction(
      user.id,
      async () => {
        await deleteUser(user.id)
        const isLastOnPage = users.value.length === 1 && currentPage.value > FIRST_PAGE
        if (isLastOnPage) currentPage.value -= 1
        await loadUsers()
      },
      DELETE_ERROR_MESSAGE
    )
  }

  return {
    users,
    isLoading,
    loadError,
    actionError,
    pendingUserId,
    currentPage,
    totalPages,
    loadUsers,
    goToPage,
    changeRole,
    toggleActive,
    saveUserData,
    removeUser,
  }
}