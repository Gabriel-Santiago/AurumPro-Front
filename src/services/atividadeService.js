import api from "./api";

export default {
    getByProposta(propostaId) {
        return api.get(`/atividades/${propostaId}`)
    },

    criar(dados) {
        return api.post('/atividades', dados);
    },

    update(dto) {
        return api.patch('/atividades', dto)
    },

    delete(atividadeId) {
        return api.delete(`/atividades/${atividadeId}`)
    }
}