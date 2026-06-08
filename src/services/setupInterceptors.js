import api from "./api";
import router from "../router";
import { useAuthStore } from "../stores/authStore";

let isRefreshing = false;
let failedQueue = [];

function processQueue(error = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
}

function isAuthRoute(url = "") {
  return (
    url.includes("/empresas/login") ||
    url.includes("/empresas/register") ||
    url.includes("/empresas/cadastro") ||
    url.includes("/empresas/refresh") ||
    url.includes("/empresas/logout")
  );
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = originalRequest.url ?? "";

    if (status === 401 && !originalRequest._retry && !isAuthRoute(url)) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/empresas/refresh");

        processQueue();

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        const authStore = useAuthStore();

        authStore.empresa = null;
        authStore.autenticado = false;
        authStore.sessaoVerificada = true;

        if (router.currentRoute.value.path !== "/") {
          router.push("/");
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
