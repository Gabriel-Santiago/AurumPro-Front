import { createRouter, createWebHistory } from "vue-router";
import AuthView from "../views/AuthView.vue";
import ClientsView from "../views/ClientsView.vue";

const routes = [
  { path: "/", name: "auth", component: AuthView },
  { path: "/clientes", name: "Clients", component: ClientsView }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
