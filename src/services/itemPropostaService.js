import api from "./api";

export default {
  criar(dados) {
    const response = api.post('/itensProposta', dados);
    return response;
  },

  buscarPorId(id) {
    const response = api.get(`/itensProposta/${id}`);
    return response;
  }
};