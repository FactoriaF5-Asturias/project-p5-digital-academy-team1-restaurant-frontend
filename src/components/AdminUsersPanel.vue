<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAdminUsers } from '../composables/useAdminUsers'
import { useAuthStore } from '../stores/auth'
import { getRoleLabel } from '../constants/roles'
import ConfirmDialog from './ConfirmDialog.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import PaginationControl from './PaginationControl.vue'
import UserFormModal from './UserFormModal.vue'
import UsersTable from './UsersTable.vue'

// Responsabilidad: coordinar la sección "Gestión de usuarios". Une la tabla,
// la paginación, la ventana de edición y las confirmaciones (cambiar rol,
// desactivar y eliminar) con el estado de useAdminUsers.

const EDIT_ERROR_MESSAGE =
  'No se han podido guardar los datos. Revisa que el email no lo use otra cuenta.'

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id ?? null)

const {
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
} = useAdminUsers()

const userToEdit = ref(null)
const isSavingEdit = ref(false)
const editError = ref('')

function handleEditRequest(user) {
  editError.value = ''
  userToEdit.value = user
}

function handleEditCancel() {
  userToEdit.value = null
}

async function handleEditSubmit(changes) {
  isSavingEdit.value = true
  editError.value = ''

  try {
    await saveUserData(userToEdit.value.id, changes)
    userToEdit.value = null
  } catch (err) {
    editError.value = EDIT_ERROR_MESSAGE
    console.error('[AdminUsersPanel] Error al guardar los datos del usuario:', err)
  } finally {
    isSavingEdit.value = false
  }
}

// Acciones que piden confirmación antes de ejecutarse.
const CONFIRMATIONS = Object.freeze({
  changeRole: {
    getTitle: (name) => `¿Estás seguro de cambiar el rol de ${name}?`,
    getMessage: ({ user, role }) =>
      `Pasará de ${getRoleLabel(user.roles?.[0])} a ${getRoleLabel(role)} y sus permisos cambiarán al momento.`,
    confirmLabel: 'Cambiar rol',
  },
  deactivate: {
    getTitle: (name) => `¿Estás seguro de desactivar a ${name}?`,
    getMessage: () => 'No podrá iniciar sesión hasta que lo vuelvas a activar.',
    confirmLabel: 'Desactivar',
  },
  delete: {
    getTitle: (name) => `¿Estás seguro de eliminar a ${name}?`,
    getMessage: () =>
      'Se borrará su cuenta y no se puede deshacer. Si solo quieres impedir que entre, desactívala.',
    confirmLabel: 'Eliminar',
  },
})

// Qué se ejecuta cuando el admin acepta cada confirmación.
const CONFIRMED_ACTIONS = Object.freeze({
  changeRole: ({ user, role }) => changeRole(user, role),
  deactivate: ({ user }) => toggleActive(user),
  delete: ({ user }) => removeUser(user),
})

// { action: 'changeRole' | 'deactivate' | 'delete', user, role? } mientras se espera la respuesta del admin.
const pendingConfirmation = ref(null)

const confirmation = computed(() => {
  if (!pendingConfirmation.value) return null
  const { action, user } = pendingConfirmation.value
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  const texts = CONFIRMATIONS[action]
  return {
    title: texts.getTitle(fullName),
    message: texts.getMessage(pendingConfirmation.value),
    confirmLabel: texts.confirmLabel,
  }
})

function handleRoleChangeRequest(user, role) {
  pendingConfirmation.value = { action: 'changeRole', user, role }
}

// Activar no necesita confirmación; desactivar sí, porque deja al usuario sin acceso.
function handleToggleActiveRequest(user) {
  if (!user.active) return toggleActive(user)
  pendingConfirmation.value = { action: 'deactivate', user }
}

function handleDeleteRequest(user) {
  pendingConfirmation.value = { action: 'delete', user }
}

function handleConfirmationCancel() {
  pendingConfirmation.value = null
}

async function handleConfirmationAccept() {
  const pending = pendingConfirmation.value
  pendingConfirmation.value = null
  await CONFIRMED_ACTIONS[pending.action](pending)
}

onMounted(loadUsers)
</script>

<template>
  <section class="admin-users" aria-labelledby="admin-users-title">
    <header class="admin-users__header">
      <h2 id="admin-users-title" class="admin-users__title">Gestión de usuarios</h2>
      <p class="admin-users__subtitle">Edita los datos de cada cuenta, cambia su rol, actívala o desactívala.</p>
    </header>

    <p v-if="actionError" class="admin-users__action-error" role="alert">{{ actionError }}</p>

    <LoadingSpinner v-if="isLoading" label="Cargando usuarios..." />
    <p v-else-if="loadError" class="admin-users__load-error">{{ loadError }}</p>
    <div v-else class="admin-users__table-wrapper">
      <UsersTable
        :users="users"
        :current-user-id="currentUserId"
        :pending-user-id="pendingUserId"
        @change-role="handleRoleChangeRequest"
        @toggle-active="handleToggleActiveRequest"
        @edit="handleEditRequest"
        @delete="handleDeleteRequest"
      />

      <PaginationControl
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @change-page="goToPage"
      />
    </div>

    <UserFormModal
      v-if="userToEdit"
      :initial-user="userToEdit"
      :is-saving="isSavingEdit"
      :error-message="editError"
      @submit="handleEditSubmit"
      @cancel="handleEditCancel"
    />

    <ConfirmDialog
      v-if="confirmation"
      :title="confirmation.title"
      :confirm-label="confirmation.confirmLabel"
      @confirm="handleConfirmationAccept"
      @cancel="handleConfirmationCancel"
    >
      {{ confirmation.message }}
    </ConfirmDialog>
  </section>
</template>

<style scoped>
@reference "../style.css";

.admin-users {
  @apply rounded-xl border border-outline bg-white p-5;
}

.admin-users__header {
  @apply mb-4;
}

.admin-users__title {
  @apply font-heading text-xl font-bold text-on-surface;
}

.admin-users__subtitle {
  @apply text-sm text-on-surface-variant;
}

.admin-users__action-error {
  @apply mb-4 rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container;
}

.admin-users__load-error {
  @apply py-6 text-center text-error;
}

/* En móvil la tabla hace scroll horizontal dentro de la tarjeta, no la página */
.admin-users__table-wrapper {
  @apply overflow-x-auto;
}
</style>