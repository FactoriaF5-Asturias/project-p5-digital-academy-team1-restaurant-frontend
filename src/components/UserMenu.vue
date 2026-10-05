<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import UserIdentity from './UserIdentity.vue'
import UserAvatarIcon from './UserAvatarIcon.vue'

defineProps({
  user: {
    type: Object,
    required: true,
  },
  role: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['logout'])

const isOpen = ref(false)
const menuRoot = ref(null)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function handleLogout() {
  closeMenu()
  emit('logout')
}

function handleClickOutside(event) {
  if (menuRoot.value && !menuRoot.value.contains(event.target)) closeMenu()
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="menuRoot" class="user-menu">
    <button
      type="button"
      class="user-menu__trigger"
      aria-label="Abrir menú de usuario"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      @click="toggleMenu"
    >
      <UserAvatarIcon class="user-menu__icon" />
    </button>

    <div v-if="isOpen" class="user-menu__panel" role="menu">
      <UserIdentity :user="user" :role="role" />
      <p class="user-menu__email">{{ user.email }}</p>

      <button type="button" class="user-menu__item user-menu__item--logout" role="menuitem" @click="handleLogout">
        Cerrar sesión
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "../style.css";

.user-menu {
  @apply relative;
}

.user-menu__trigger {
  @apply flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition hover:opacity-90;
}

.user-menu__icon {
  @apply h-5 w-5;
}

.user-menu__panel {
  @apply absolute right-0 top-12 z-50 flex w-64 flex-col gap-2 border border-[#C4C4C4] border-t-4 border-t-primary bg-[#EFEFEF] p-4 shadow-lg;
}
.user-menu__email {
  @apply truncate border-b border-[#C4C4C4] pb-2 text-xs text-on-surface-variant;
}

.user-menu__item {
  @apply rounded-lg px-3 py-2 text-left text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface;
}

.user-menu__item--logout {
  @apply text-primary;
}
</style>