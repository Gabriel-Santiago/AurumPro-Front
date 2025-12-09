import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" }
});

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