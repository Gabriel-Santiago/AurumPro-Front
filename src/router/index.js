import { createRouter, createWebHistory } from "vue-router";
import AuthView from "../views/AuthView.vue";
import ClientsView from "../views/ClientsView.vue";
import FinancasView from "../views/FinancasView.vue";
import api from "../services/api";

const routes = [
  { path: "/", name: "auth", component: AuthView },
  { path: "/clientes", name: "Clients", component: ClientsView, meta: { requiresAuth: true } },
  { path: "/financas", name: "Financas", component: FinancasView, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      await api.get("/empresas/auth/check");
      next();
    } catch {
      next("/");
    }
  } else {
    next();
  }
});

export default router;
