<script setup>
import { computed } from 'vue'
import { getRoleLabel } from '../constants/roles'
import UserAvatarIcon from './UserAvatarIcon.vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  role: {
    type: String,
    default: null,
  },
})

const fullName = computed(() => `${props.user.firstName ?? ''} ${props.user.lastName ?? ''}`.trim())
const roleLabel = computed(() => getRoleLabel(props.role))
</script>

<template>
  <div class="user-identity">
    <span class="user-identity__avatar" aria-hidden="true">
      <UserAvatarIcon class="user-identity__icon" />
    </span>
    <div class="user-identity__text">
      <p class="user-identity__name">{{ fullName || user.email }}</p>
      <p v-if="roleLabel" class="user-identity__role">{{ roleLabel }}</p>
    </div>
  </div>
</template>

<style scoped>
@reference "../style.css";

.user-identity {
  @apply flex items-center gap-3;
}

.user-identity__avatar {
  @apply flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container;
}

.user-identity__icon {
  @apply h-5 w-5;
}

.user-identity__text {
  @apply min-w-0;
}

.user-identity__name {
  @apply truncate text-sm font-semibold text-on-surface;
}

.user-identity__role {
  @apply text-xs text-on-surface-variant;
}
</style>