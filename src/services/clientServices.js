import api from "./api";

export default {
  listarTodos() {
    return api.get("/clientes");
  },

  criarPessoaFisica(payload) {
    return api.post("/clientes/pessoaFisica", payload);
  },

  criarPessoaJuridica(payload) {
    return api.post("/clientes/pessoaJuridica", payload); 
  },

  atualizarEndereco(payload) {
    return api.patch("/clientes/endereco", payload);
  },

  atualizarContato(payload) {
    return api.patch("/clientes/email/telefone", payload);
  },

  deletarCliente(payload) {
    return api.delete("/clientes", { data: payload });
  }
};
