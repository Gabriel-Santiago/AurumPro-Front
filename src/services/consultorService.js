import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" }
});

export default {
  criar(data) {
    return api.post('/consultores', data);
  },
  
  listarPorEmpresa(empresaId) {
    return api.get(`/consultores/${empresaId}`);
  },

  listarTiposConsultor() {
    return api.get("/consultores");
  }
};