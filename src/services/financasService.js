import api from "./api";

export default {
  async getDashboard() {
    const response = await api.get("/financas/dashboard");
    return response.data;
  },

  async atualizarStatusProposta(dados) {
    const response = await api.patch('/financas', dados);
    return response.data;
  }
};