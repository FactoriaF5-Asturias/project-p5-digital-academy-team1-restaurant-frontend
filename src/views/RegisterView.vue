<script setup>
import RegisterForm from '../components/auth/RegisterForm.vue'
</script>

<template>
<main class="bg-surface text-on-surface">
    <section class="mx-auto flex max-w-md items-center px-6 py-16">
      <div class="w-full">
        <h1 class="text-3xl font-bold">
          Crear cuenta
        </h1>

        <p class="mt-2 text-sm text-on-surface-variant">
          Regístrate para realizar y consultar tus pedidos.
        </p>

        <RegisterForm />
      </div>
    </section>
  </main>
</template>