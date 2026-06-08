import { ref } from "vue";
import clienteService from "../services/clienteService";
import { useErrorHandler } from "./useErrorHandler";
import type { Cliente, DeletarClientePayload } from "../types/cliente";

export function useClientes() {
  const clientes = ref<Cliente[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const { getErrorMessage, logError } = useErrorHandler();

  async function carregarClientes(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await clienteService.listarTodos();
      clientes.value = Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      logError(err, "carregarClientes");
      error.value = getErrorMessage(err, "Erro ao carregar clientes.");
    } finally {
      loading.value = false;
    }
  }

  async function criarPessoaFisica(payload: Record<string, unknown>) {
    loading.value = true;
    error.value = null;

    try {
      const response = await clienteService.criarPessoaFisica(payload);
      await carregarClientes();
      return response.data;
    } catch (err) {
      logError(err, "criarPessoaFisica");
      error.value = getErrorMessage(err, "Erro ao criar cliente.");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function criarPessoaJuridica(payload: Record<string, unknown>) {
    loading.value = true;
    error.value = null;

    try {
      const response = await clienteService.criarPessoaJuridica(payload);
      await carregarClientes();
      return response.data;
    } catch (err) {
      logError(err, "criarPessoaJuridica");
      error.value = getErrorMessage(err, "Erro ao criar cliente.");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removerCliente(payload: DeletarClientePayload): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await clienteService.deletarCliente(payload);
      await carregarClientes();
    } catch (err) {
      logError(err, "removerCliente");
      error.value = getErrorMessage(err, "Erro ao remover cliente.");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    clientes,
    loading,
    error,
    carregarClientes,
    criarPessoaFisica,
    criarPessoaJuridica,
    removerCliente,
  };
}
