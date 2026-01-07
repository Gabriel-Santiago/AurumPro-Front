import api from "./api";

export default {
  criar(dados) {
    const response = api.post('/custos', dados);
    return response;
  },

  buscarPorId(id) {
    const response = api.get(`/custos/${id}`);
    return response;
  }
};