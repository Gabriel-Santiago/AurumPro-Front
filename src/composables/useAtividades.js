import { ref } from "vue";
import atividadeService from "../services/atividadeService";
import { useErrorHandler } from "./useErrorHandler";

export function useAtividades() {
  const atividades = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const { getErrorMessage, logError } = useErrorHandler();

  async function carregarAtividadesPorProposta(propostaId) {
    loading.value = true;
    error.value = null;

    try {
      const response = await atividadeService.getByProposta(propostaId);
      atividades.value = response.data;
      return response.data;
    } catch (err) {
      logError(err, "carregarAtividades");
      error.value = getErrorMessage(err, "Erro ao carregar atividades.");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function salvarAtividade(payload) {
    loading.value = true;
    error.value = null;

    try {
      const response = await atividadeService.criar(payload);
      return response.data;
    } catch (err) {
      logError(err, "salvarAtividade");
      error.value = getErrorMessage(err, "Erro ao salvar atividade.");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    atividades,
    loading,
    error,
    carregarAtividadesPorProposta,
    salvarAtividade,
  };
}
