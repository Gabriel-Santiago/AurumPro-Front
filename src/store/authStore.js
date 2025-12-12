import { defineStore } from "pinia";
import authService from "../services/authServices";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    empresa: null,
  }),

  actions: {
    async login(email, senha) {
      const res = await authService.login(email, senha);
      this.empresa = res.data;
      return res.data;
    },

    async register(data) {
      await authService.register(data);
    },

    logout() {
      this.empresa = null;
    }
  }
});
