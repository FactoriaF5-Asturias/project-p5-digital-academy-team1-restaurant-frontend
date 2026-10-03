<script setup>
import { ASSIGNABLE_ROLES, getRoleLabel } from '../constants/roles'

// Responsabilidad: pintar la tabla de usuarios y avisar al padre de lo que
// pide el administrador (cambiar rol, activar/desactivar, editar, eliminar).
// No llama al backend. La cuenta del propio administrador no se puede tocar.

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
  currentUserId: {
    type: String,
    default: null,
  },
  pendingUserId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['change-role', 'toggle-active', 'edit', 'delete'])

const COLUMNS = Object.freeze(['Nombre', 'Email', 'Rol', 'Estado', 'Acciones'])

function getFullName(user) {
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
}

function getRole(user) {
  return user.roles?.[0] ?? null
}

function isCurrentUser(user) {
  return user.id === props.currentUserId
}

function isLocked(user) {
  return isCurrentUser(user) || user.id === props.pendingUserId
}

// El desplegable vuelve al rol actual: el nuevo solo se ve cuando el padre
// lo confirme y el backend lo guarde (así, si se cancela, no queda cambiado).
function handleRoleChange(user, event) {
  const role = event.target.value
  event.target.value = getRole(user)
  if (role !== getRole(user)) emit('change-role', user, role)
}
</script>

<template>
  <table class="users-table">
    <thead>
      <tr class="users-table__head-row">
        <th v-for="column in COLUMNS" :key="column" class="users-table__cell">
          {{ column }}
        </th>
      </tr>
    </thead>

    <tbody>
      <tr v-if="users.length === 0">
        <td :colspan="COLUMNS.length" class="users-table__empty">No hay usuarios que mostrar.</td>
      </tr>

      <tr v-for="user in users" :key="user.id" class="users-table__row">
        <td class="users-table__cell users-table__name">
          {{ getFullName(user) }}
          <span v-if="isCurrentUser(user)" class="users-table__you">(tú)</span>
        </td>

        <td class="users-table__cell users-table__email">{{ user.email }}</td>

        <td class="users-table__cell">
          <select
            class="users-table__role-select"
            :value="getRole(user)"
            :disabled="isLocked(user)"
            :aria-label="`Rol de ${getFullName(user)}`"
            @change="handleRoleChange(user, $event)"
          >
            <option v-for="role in ASSIGNABLE_ROLES" :key="role" :value="role">
              {{ getRoleLabel(role) }}
            </option>
          </select>
        </td>

        <td class="users-table__cell">
          <span :class="['users-table__badge', { 'users-table__badge--active': user.active }]">
            {{ user.active ? 'Activo' : 'Inactivo' }}
          </span>
        </td>

        <td class="users-table__cell">
          <span v-if="isCurrentUser(user)" class="users-table__no-actions">—</span>

          <div v-else class="users-table__actions">
            <button
              type="button"
              class="users-table__toggle-button"
              :disabled="isLocked(user)"
              @click="emit('toggle-active', user)"
            >
              {{ user.active ? 'Desactivar' : 'Activar' }}
            </button>
            <button
              type="button"
              class="users-table__icon-button users-table__icon-button--edit"
              :disabled="isLocked(user)"
              :aria-label="`Editar a ${getFullName(user)}`"
              title="Editar"
              @click="emit('edit', user)"
            >
              <span class="material-symbols-outlined" aria-hidden="true">edit</span>
            </button>
            <button
              type="button"
              class="users-table__icon-button users-table__icon-button--delete"
              :disabled="isLocked(user)"
              :aria-label="`Eliminar a ${getFullName(user)}`"
              title="Eliminar"
              @click="emit('delete', user)"
            >
              <span class="material-symbols-outlined" aria-hidden="true">delete</span>
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
@reference "../style.css";

.users-table {
  @apply w-full text-sm;
}

.users-table__head-row {
  @apply border-b border-outline text-left text-xs uppercase text-on-surface-variant;
}

.users-table__cell {
  @apply py-3 pr-3 align-middle;
}

.users-table__row {
  @apply border-b border-outline last:border-0;
}

.users-table__empty {
  @apply py-6 text-center text-on-surface-variant;
}

.users-table__name {
  @apply font-semibold text-on-surface;
}

.users-table__you {
  @apply font-normal text-on-surface-variant;
}

.users-table__email {
  @apply text-on-surface-variant;
}

.users-table__role-select {
  @apply min-h-11 rounded-lg border border-outline bg-white px-2 text-sm text-on-surface disabled:cursor-not-allowed disabled:opacity-60;
}

.users-table__badge {
  @apply inline-flex rounded-full bg-surface-variant px-2 py-1 text-xs font-semibold text-on-surface-variant;
}

.users-table__badge--active {
  @apply bg-secondary-container text-secondary;
}

.users-table__no-actions {
  @apply text-on-surface-variant;
}

.users-table__actions {
  @apply inline-flex items-center gap-2;
}

.users-table__toggle-button {
  @apply min-h-11 rounded-lg border border-outline px-3 text-xs font-semibold transition hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-60;
}

.users-table__icon-button {
  @apply flex h-11 w-11 items-center justify-center rounded-lg border border-outline text-on-surface-variant transition disabled:cursor-not-allowed disabled:opacity-60;
}

.users-table__icon-button--edit {
  @apply hover:border-primary/50 hover:text-primary;
}

.users-table__icon-button--delete {
  @apply hover:border-error/50 hover:text-error;
}
</style>