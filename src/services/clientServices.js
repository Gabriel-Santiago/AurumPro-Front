import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" }
});

export default {
  listarTodos(empresaId) {
    return api.get(`/clientes/${empresaId}`);
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
