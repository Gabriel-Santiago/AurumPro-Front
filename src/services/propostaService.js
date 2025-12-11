import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" }
});

export default {
  criar(dados) {
    return api.post('/propostas', dados);
  },

  listarPorCliente(empresaId, clienteId) {
    return api.get(`/propostas/${empresaId}/${clienteId}`);
  },

  listarPorEmpresa(empresaId) {
    return api.get(`/propostas/${empresaId}`);
  },

  downloadTermo(propostaId) {
    return api.get(`/propostas/doc/${propostaId}`, {
      responseType: 'blob'
    });
  },

  excluirProposta(propostaId) {
    const response = api.delete(`/propostas/${propostaId}`);
      return response.data;
  }
}