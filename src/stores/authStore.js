import { defineStore } from "pinia";
import authService from "../services/authService";
import empresaService from "../services/empresaService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    empresa: null,
    autenticado: false,
    carregandoSessao: false,
    sessaoVerificada: false,
  }),

  getters: {
    isAuthenticated: (state) => state.autenticado,
    nomeEmpresa: (state) => state.empresa?.nome ?? "",
  },

  actions: {
    async login(email, senha) {
      await authService.login(email, senha);

      this.autenticado = true;
      this.sessaoVerificada = true;

      await this.carregarEmpresa();
    },

    async register(data) {
      await authService.register(data);
    },

    async logout() {
      try {
        await authService.logout();
      } catch {
        // Mesmo que o backend falhe, limpa a sessão local.
      } finally {
        this.empresa = null;
        this.autenticado = false;
        this.sessaoVerificada = true;
      }
    },

    async verificarSessao() {
      if (this.carregandoSessao) return this.autenticado;

      this.carregandoSessao = true;

      try {
        await authService.check();

        this.autenticado = true;
        this.sessaoVerificada = true;

        await this.carregarEmpresa();

        return true;
      } catch {
        this.empresa = null;
        this.autenticado = false;
        this.sessaoVerificada = true;

        return false;
      } finally {
        this.carregandoSessao = false;
      }
    },

    async carregarEmpresa() {
      try {
        const response = await empresaService.getNome();

        this.empresa = {
          nome: response.data,
        };
      } catch {
        this.empresa = null;
      }
    },
  },
});
