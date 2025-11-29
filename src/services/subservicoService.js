import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" }
});

export default {
  criar(data) {
    return api.post('/microServicos', data);
  },
  
  listarPorEmpresa(empresaId) {
    return api.get(`/microServicos/empresa/${empresaId}`);
  }
};