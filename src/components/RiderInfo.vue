<script setup>
defineProps({
  rider: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="card flex items-center gap-4 p-4">
    <div class="flex-1 text-left">
      <span class="label-eyebrow text-primary">
        Motorista asignado
      </span>

      <h3 class="mt-1">
        {{ rider.name }}
      </h3>

      <p class="mt-1 text-on-surface-variant">
        {{ rider.vehicle }}
      </p>

      <span class="label-code text-on-surface-variant">
        Rider ID: {{ rider.id }}
      </span>
    </div>
  </article>
</template>