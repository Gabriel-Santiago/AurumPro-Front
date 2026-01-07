import api from "./api";

export default {
  criar(data) {
    return api.post('/convenios', data);
  },
  
  listarPorEmpresa() {
    return api.get('/convenios');
  }
};