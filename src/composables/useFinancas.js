import { ref } from "vue";
import financasService from "../services/financasService";
import { useErrorHandler } from "./useErrorHandler";

export function useFinancas() {
  const resumo = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const { getErrorMessage, logError } = useErrorHandler();

  async function carregarResumo() {
    loading.value = true;
    error.value = null;

    try {
      const response = await financasService.getDashboard();
      resumo.value = response.data;
    } catch (err) {
      logError(err, "carregarResumoFinanceiro");
      error.value = getErrorMessage(err, "Erro ao carregar resumo financeiro.");
    } finally {
      loading.value = false;
    }
  }

  return {
    resumo,
    loading,
    error,
    carregarResumo,
  };
}
