import api from "./api";
import type { DeletarClientePayload } from "../types/cliente";

const clienteService = {
  listarTodos() {
    return api.get("/clientes");
  },

  buscarPorId(id: number | string) {
    return api.get(`/clientes/cliente/${id}`);
  },

  criarPessoaFisica(payload: Record<string, unknown>) {
    return api.post("/clientes/pessoaFisica", payload);
  },

  criarPessoaJuridica(payload: Record<string, unknown>) {
    return api.post("/clientes/pessoaJuridica", payload);
  },

  atualizarEndereco(payload: Record<string, unknown>) {
    return api.patch("/clientes/endereco", payload);
  },

  atualizarContato(payload: Record<string, unknown>) {
    return api.patch("/clientes/email/telefone", payload);
  },

  deletarCliente(payload: DeletarClientePayload) {
    return api.delete("/clientes", { data: payload });
  },
};

export default clienteService;
