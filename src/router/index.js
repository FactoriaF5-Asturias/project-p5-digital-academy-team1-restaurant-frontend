import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { ROLES } from "../constants/roles";
import {
  ACCESS_DENIED_ROUTE,
  canAccess,
  getDeniedRedirectFor,
  getRedirectFor,
  isUnknownRoute,
} from "./guards";

const { GUEST, CUSTOMER, ADMIN, COOK, DELIVERY } = ROLES;

const routes = [
  {
    path: "/",
    name: "carta",
    component: () => import("../views/CartaView.vue"),
    meta: { roles: [GUEST, CUSTOMER, ADMIN, COOK, DELIVERY] },
  },
  {
    path: "/mi-pedido",
    name: "mi-pedido",
    component: () => import("../views/MiPedidoView.vue"),
    meta: { roles: [GUEST, CUSTOMER] },
  },
    {
    // Enlace del email "Tu pedido va en camino": /tickets/:id?token=...
    path: "/tickets/:id",
    name: "ticket",
    component: () => import("../views/MiPedidoView.vue"),
    meta: { roles: [GUEST, CUSTOMER] },
  },
  {
    path: "/success",
    name: "payment-success",
    component: () => import("../views/PaymentReturnView.vue"),
    meta: { roles: [GUEST, CUSTOMER] },
  },
  {
    path: "/cancel",
    name: "payment-cancel",
    component: () => import("../views/PaymentReturnView.vue"),
    meta: { roles: [GUEST, CUSTOMER] },
  },
  {
    path: "/perfil",
    name: "perfil",
    component: () => import("../views/PerfilView.vue"),
    meta: { roles: [CUSTOMER, ADMIN] },
  },
  {
    path: "/cesta",
    name: "cesta",
    component: () => import("../views/CestaView.vue"),
    meta: { roles: [GUEST, CUSTOMER] },
  },
  {
    path: "/cocina",
    name: "cocina",
    component: () => import("../views/CocinaView.vue"),
    meta: { roles: [COOK, ADMIN] },
  },
  {
    path: "/reparto",
    name: "reparto",
    component: () => import("../views/RepartoView.vue"),
    meta: { roles: [DELIVERY, ADMIN] },
  },
  {
    path: "/admin",
    component: () => import("../views/AdminView.vue"),
    meta: { roles: [ADMIN] },
    children: [
      {
        path: "",
        name: "admin",
        component: () => import("../views/admin/AdminHomeView.vue"),
        meta: { roles: [ADMIN] },
      },
      {
        path: "productos",
        name: "admin-productos",
        component: () => import("../views/admin/AdminProductsView.vue"),
        meta: { roles: [ADMIN] },
      },
      {
        path: "facturacion",
        name: "admin-facturacion",
        component: () => import("../views/admin/AdminInvoicesView.vue"),
        meta: { roles: [ADMIN] },
      },
      {
        path: "resumen-ventas",
        name: "admin-resumen-ventas",
        component: () => import("../views/admin/AdminSalesReportView.vue"),
        meta: { roles: [ADMIN] },
      },
      {
        path: "kpi",
        name: "admin-kpi",
        component: () => import("../views/admin/AdminKpiView.vue"),
        meta: { roles: [ADMIN] },
      },
       {
        path: "usuarios",
        name: "admin-usuarios",
        component: () => import("../views/admin/AdminUsersView.vue"),
        meta: { roles: [ADMIN] },
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
    meta: { roles: [GUEST] },
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () => import("../views/ForgotPasswordView.vue"),
    meta: { roles: [null] },
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: () => import("../views/ResetPasswordView.vue"),
    meta: { roles: [null] },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/RegisterView.vue"),
    meta: { roles: [GUEST] },
  },
  {
    path: "/acceso-denegado",
    name: ACCESS_DENIED_ROUTE,
    component: () => import("../views/AccessDeniedView.vue"),
    meta: { roles: [CUSTOMER, ADMIN, COOK, DELIVERY] },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (isUnknownRoute(to)) {
    return getRedirectFor(authStore.role);
  }

  if (!canAccess(to, authStore.role)) {
    return getDeniedRedirectFor(to, authStore.role);
  }
});

export default router;
