<script setup>
const orderStatuses = [
    "Pedido recibido y Pagado",
    "Cocina preparando",
    "Listo en cocina",
    "En Tránsito con Motorista",
    "Entregado al destinatario"
]
</script>

<template>
    <section>
        <h2>Estado de tu Pedido</h2>

        <ul>
            <li
            v-for="status in orderStatuses"
            :key="status"
            >
            {{ status }}
        </li>
        </ul>
    </section>
</template>