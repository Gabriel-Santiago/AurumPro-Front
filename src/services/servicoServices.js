import api from "./api";

export default {
  listarTodos() {
    return api.get("/servicos");
  },

  criarServico(data) {
    return api.post("/servicos", data);
  },

  buscarPorId(id) {
    const response = api.get(`/servicos/listar/${id}`);
    return response;
  }
};