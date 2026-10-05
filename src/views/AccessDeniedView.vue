<script setup>
import { useRouter } from 'vue-router'

// Responsabilidad: avisar al usuario logueado de que la vista que ha pedido
// no es de su rol y devolverle a la vista en la que estaba.

const FALLBACK_ROUTE = { name: 'carta' }

const router = useRouter()

// Vue Router guarda en history.state.back la ruta anterior dentro de la app.
// Si se escribió la URL a mano no hay ruta anterior y se vuelve a la carta.
function handleGoBack() {
  if (window.history.state?.back) {
    router.back()
    return
  }

  router.push(FALLBACK_ROUTE)
}
</script>

<template>
  <main class="page-container access-denied">
    <section class="access-denied__card" role="alert">
      <p class="access-denied__code">403</p>

      <h1 class="access-denied__title">
        Acceso denegado
      </h1>

      <p class="access-denied__message">
        Tu usuario no tiene permiso para ver esta página.
      </p>

      <button
        type="button"
        class="btn-primary access-denied__action"
        @click="handleGoBack"
      >
        Regresar
      </button>
    </section>
  </main>
</template>

<style scoped>
@reference "../style.css";

.access-denied {
  @apply flex justify-center py-12;
}

.access-denied__card {
  @apply mx-auto flex max-w-md flex-col items-center gap-3 text-center;
}

.access-denied__code {
  @apply text-sm font-semibold text-primary;
}

.access-denied__title {
  @apply text-center;
}

.access-denied__message {
  @apply text-on-surface-variant;
}

.access-denied__action {
  @apply mt-3;
}
</style>