import api from "./api";

export default {
  criar(data) {
    return api.post('/colaboradores', data);
  },
  
  listarPorEmpresa() {
    return api.get("/colaboradores");
  },

  listarFuncoes() {
    return api.get("/colaboradores/funcoes");
  }
};