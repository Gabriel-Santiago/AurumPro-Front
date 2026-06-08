import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const AuthView = () => import("../views/AuthView.vue");
const ClientsView = () => import("../views/ClientsView.vue");
const FinancasView = () => import("../views/FinancasView.vue");
const AtividadesView = () => import("../views/AtividadesView.vue");

const routes = [
  {
    path: "/",
    name: "auth",
    component: AuthView,
    meta: {
      publicOnly: true,
    },
  },
  {
    path: "/clientes",
    name: "clientes",
    component: ClientsView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/financas",
    name: "financas",
    component: FinancasView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/atividades",
    name: "atividades",
    component: AtividadesView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/clientes",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.sessaoVerificada) {
    await authStore.verificarSessao();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return "/";
  }

  if (to.meta.publicOnly && authStore.isAuthenticated) {
    return "/clientes";
  }

  return true;
});

export default router;
