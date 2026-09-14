<script setup>
defineProps({
  status: {
    type: Object,
    required: true
  },
  activeStatus: {
    type: String,
    required: true
  }
})
</script>

<template>
  <li
    class="flex gap-4 rounded-lg px-4 py-3"
    :class="
      status.name === activeStatus
        ? 'border border-primary bg-primary-container'
        : 'border border-transparent'
    "
  >
    <div class="flex flex-1 items-center justify-between gap-4">
      <div class="text-left">
        <p class="font-medium text-on-surface">
          {{ status.name }}
        </p>

        <span
          v-if="status.name === activeStatus"
          class="label-badge text-primary"
        >
          Activo
        </span>
      </div>

      <span
        v-if="status.time"
        class="label-code text-on-surface-variant"
      >
        {{ status.time }}
      </span>
    </div>
  </li>
</template>