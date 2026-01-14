import api from "./api";

export default {
  criar(dados) {
    return api.post('/propostas', dados);
  },

  listarPorCliente(clienteId) {
    return api.get(`/propostas/${clienteId}`);
  },

  listarPorEmpresa() {
    return api.get("/propostas");
  },

  getAceitas() {
    return api.get('/propostas/aceitas');
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