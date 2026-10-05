<script setup>
import LoginForm from '../components/auth/LoginForm.vue'
</script>
<template>
<main class="bg-surface text-on-surface">
    <section class="mx-auto flex max-w-md items-center px-6 py-16">
      <div class="w-full">
        <h1 class="text-3xl font-bold">
          Iniciar sesión
        </h1>

        <p class="mt-2 text-sm text-on-surface-variant">
          Accede a tu cuenta para gestionar tus pedidos.
        </p>
        <LoginForm />
      </div>
    </section>
  </main>
</template>