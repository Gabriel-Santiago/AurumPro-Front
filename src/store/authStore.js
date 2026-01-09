import { defineStore } from "pinia";
import authService from "../services/authServices";
import empresaService from "../services/empresaService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    empresa: null,
    autenticado: false
  }),

  actions: {
    async login(email, senha) {
      await authService.login(email, senha);
      this.autenticado = true;
    },

    async register(data) {
      await authService.register(data);
    },

    async logout() {
      try {
        await authService.logout();
      } catch {

      } finally {
        this.empresa = null;
        this.autenticado = false;
      }
    },

    async carregarEmpresa() {
      try {
        const response = await empresaService.getNome();
        this.empresa = { nome: response.data };
      } catch {
        this.empresa = null;
      }
    }
  }
});
