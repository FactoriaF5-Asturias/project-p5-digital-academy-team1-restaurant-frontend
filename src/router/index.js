import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'carta', component: () => import('../views/CartaView.vue') },
  { path: '/mi-pedido', name: 'mi-pedido', component: () => import('../views/MiPedidoView.vue') },
  { path: '/perfil', name: 'perfil', component: () => import('../views/PerfilView.vue') },
  { path: '/cesta', name: 'cesta', component: () => import('../views/CestaView.vue') },
  { path: '/cocina', name: 'cocina', component: () => import('../views/CocinaView.vue') },
  { path: '/reparto', name: 'reparto', component: () => import('../views/RepartoView.vue') },
  { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
