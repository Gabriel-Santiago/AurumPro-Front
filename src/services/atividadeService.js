import api from "./api";

export default {
    getByProposta(propostaId) {
        return api.get(`/atividades/${propostaId}`)
    },

    criar(dados) {
        return api.post('/atividades', dados);
    },

    criarAtividadeProposta(dados) {
        const response = api.post("/atividades/proposta", dados);
        return response;
    },

    update(dto) {
        return api.patch('/atividades', dto)
    },

    delete(atividadeId) {
        return api.delete(`/atividades/${atividadeId}`)
    }
}