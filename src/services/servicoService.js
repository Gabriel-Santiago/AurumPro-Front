import api from "./api";

const servicoService = {
  listarTodos() {
    return api.get("/servicos");
  },

  criarServico(data) {
    return api.post("/servicos", data);
  },

  buscarPorId(id) {
    return api.get(`/servicos/listar/${id}`);
  },
};

export default servicoService;
