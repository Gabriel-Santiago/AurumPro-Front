import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { 
    "Content-Type": "application/json" 
  }
});

export default {
  async getDashboard(empresaId) {
    const response = await api.get(`/financas/dashboard/${empresaId}`);
    return response.data;
  },

  async atualizarStatusProposta(dados) {
    const response = await api.patch('/financas', dados);
    return response.data;
  }
};