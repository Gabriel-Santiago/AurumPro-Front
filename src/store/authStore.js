import { defineStore } from "pinia";
import authService from "../services/authServices";
import empresaService from "../services/empresaService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    empresa: null,
  }),

  actions: {
    async login(email, senha) {
      await authService.login(email, senha);
    },

    async register(data) {
      await authService.register(data);
    },

    async logout() {
      try {
        await authService.logout();
      } catch (e) {

      } finally {
        this.empresa = null;
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
