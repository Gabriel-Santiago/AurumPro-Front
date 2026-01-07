import api from "./api";

export default {
  criar(data) {
    return api.post('/microServicos', data);
  },
  
  listarTodos(servicoId) {
    return api.get(`/microServicos/${servicoId}`);
  },

  buscarPorId(id) {
    const response = api.get(`/microServicos/listar/${id}`);
    return response;
  }
};