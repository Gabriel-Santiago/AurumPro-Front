import { ref } from "vue";
import financasService from "../services/financasService";
import propostaService from "../services/propostaService";
import { notify } from "../services/notificationService";
import { getApiErrorMessage } from "../utils/errorUtils";
import { formatarTaxaAceitacao } from "../utils/formatters";

export const FINANCAS_TABS = [
  { id: "avaliacao", icon: "⏳", text: "Em Avaliação" },
  { id: "aceitas", icon: "✅", text: "Aceitas" },
  { id: "recusadas", icon: "❌", text: "Recusadas" },
  { id: "expiradas", icon: "⌛", text: "Expiradas" },
];

export function useFinancasDashboard() {
  const dashboard = ref({});
  const loading = ref(false);
  const erro = ref(null);
  const tabAtiva = ref("avaliacao");
  const ultimaAtualizacao = ref("");

  const modalDetalhes = ref({ visible: false, proposta: null });
  const modalExclusao = ref({ visible: false, proposta: null });
  const modalMudancaStatus = ref({ visible: false, proposta: null, novoStatus: null });

  async function carregarDashboard() {
    try {
      loading.value = true;
      erro.value = null;

      const response = await financasService.getDashboard();
      dashboard.value = response.data || {};
      ultimaAtualizacao.value = new Date().toLocaleTimeString("pt-BR");
    } catch {
      notify.error("Erro ao carregar dashboard");
      erro.value = "Erro ao carregar dados. Tente novamente.";
      dashboard.value = {};
    } finally {
      loading.value = false;
    }
  }

  function getContadorTab(tabId) {
    switch (tabId) {
      case "avaliacao":
        return dashboard.value?.emAvaliacao?.length || 0;
      case "aceitas":
        return dashboard.value?.aceita?.length || 0;
      case "recusadas":
        return dashboard.value?.recusada?.length || 0;
      case "expiradas":
        return dashboard.value?.expirada?.length || 0;
      default:
        return 0;
    }
  }

  function abrirDetalhesProposta(proposta) {
    modalDetalhes.value = { visible: true, proposta };
  }

  function fecharModalDetalhes() {
    modalDetalhes.value = { visible: false, proposta: null };
  }

  function confirmarExclusao(proposta) {
    modalExclusao.value = { visible: true, proposta };
  }

  function cancelarExclusao() {
    modalExclusao.value = { visible: false, proposta: null };
  }

  async function excluirProposta() {
    try {
      loading.value = true;
      await propostaService.excluirProposta(modalExclusao.value.proposta.id);
      await carregarDashboard();
      cancelarExclusao();
      fecharModalDetalhes();
      notify.success("Proposta excluída com sucesso!");
    } catch (error) {
      notify.error(getApiErrorMessage(error));
    } finally {
      loading.value = false;
    }
  }

  function abrirModalMudancaStatus(proposta, novoStatus) {
    modalMudancaStatus.value = { visible: true, proposta, novoStatus };
    fecharModalDetalhes();
  }

  function fecharModalMudancaStatus() {
    modalMudancaStatus.value = { visible: false, proposta: null, novoStatus: null };
  }

  async function atualizarStatusProposta() {
    try {
      loading.value = true;

      await financasService.atualizarStatusProposta({
        propostaId: modalMudancaStatus.value.proposta.id,
        statusProposta: modalMudancaStatus.value.novoStatus,
      });

      await carregarDashboard();
      fecharModalMudancaStatus();
      notify.success("Status da proposta atualizado com sucesso!");
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Erro ao atualizar status."));
    } finally {
      loading.value = false;
    }
  }

  function getIconeModal(status) {
    switch (status) {
      case "ACEITA":
        return "✅";
      case "RECUSADA":
        return "❌";
      case "EM_AVALIACAO":
        return "⏳";
      default:
        return "⚠️";
    }
  }

  function getClasseIconeModal(status) {
    switch (status) {
      case "ACEITA":
        return "success";
      case "RECUSADA":
        return "error";
      case "EM_AVALIACAO":
        return "warning";
      default:
        return "";
    }
  }

  function getTextoBotaoModal(status) {
    switch (status) {
      case "ACEITA":
        return "✅ Aceitar";
      case "RECUSADA":
        return "❌ Recusar";
      case "EM_AVALIACAO":
        return "⏳ Reavaliar";
      default:
        return "Confirmar";
    }
  }

  function getClasseBotaoModal(status) {
    switch (status) {
      case "ACEITA":
        return "btn-success";
      case "RECUSADA":
        return "btn-danger";
      case "EM_AVALIACAO":
        return "btn-warning";
      default:
        return "btn-primary";
    }
  }

  return {
    dashboard,
    loading,
    erro,
    tabAtiva,
    ultimaAtualizacao,
    modalDetalhes,
    modalExclusao,
    modalMudancaStatus,
    carregarDashboard,
    getContadorTab,
    formatarTaxaAceitacao,
    abrirDetalhesProposta,
    fecharModalDetalhes,
    confirmarExclusao,
    cancelarExclusao,
    excluirProposta,
    abrirModalMudancaStatus,
    fecharModalMudancaStatus,
    atualizarStatusProposta,
    getIconeModal,
    getClasseIconeModal,
    getTextoBotaoModal,
    getClasseBotaoModal,
  };
}
