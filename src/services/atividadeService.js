import api from "./api";

const atividadeService = {
  getByProposta(propostaId) {
    return api.get(`/atividades/${propostaId}`);
  },

  criar(dados) {
    return api.post("/atividades", dados);
  },

  criarAtividadeProposta(dados) {
    return api.post("/atividades/proposta", dados);
  },

  atualizar(dto) {
    return api.patch("/atividades", dto);
  },

  remover(atividadeId) {
    return api.delete(`/atividades/${atividadeId}`);
  },
};

export default atividadeService;
