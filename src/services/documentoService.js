import api from "./api";

const documentoService = {
  buscarDados(id) {
    return api.get(`/documento/${id}`);
  },

  visualizarDados(id) {
    return api.get(`/documento/visual/${id}`);
  },

  downloadDados(id) {
    return api.get(`/documento/download/${id}`, {
      responseType: "blob",
    });
  },
};

export default documentoService;
