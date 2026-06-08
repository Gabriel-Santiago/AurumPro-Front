import { ref } from "vue";
import atividadeService from "../services/atividadeService";
import propostaService from "../services/propostaService";
import { notify } from "../services/notificationService";
import { getApiErrorMessage } from "../utils/errorUtils";

export function useAtividadesPage() {
  const propostasAceitas = ref([]);
  const loading = ref(false);
  const erro = ref(null);
  const ultimaAtualizacao = ref("");

  const atividadesPorProposta = ref({});
  const carregandoAtividades = ref({});
  const propostaExpandida = ref(null);

  const modalNovaAtividade = ref({ visible: false, propostaId: null, nome: "" });
  const modalExclusaoAtividade = ref({ visible: false, atividade: null });

  async function carregarPropostasAceitas() {
    try {
      loading.value = true;
      erro.value = null;

      const response = await propostaService.getAceitas();
      const data = response.data || response;

      propostasAceitas.value = Array.isArray(data) ? data : [];
      ultimaAtualizacao.value = new Date().toLocaleTimeString("pt-BR");

      if (propostasAceitas.value.length > 0) {
        notify.success(`${propostasAceitas.value.length} propostas carregadas!`);
      } else {
        notify.info("Nenhuma proposta aceita encontrada.");
      }
    } catch {
      erro.value = "Erro ao carregar propostas aceitas.";
      notify.error("Erro ao carregar propostas");
    } finally {
      loading.value = false;
    }
  }

  async function carregarAtividades(id) {
    try {
      carregandoAtividades.value[id] = true;

      const response = await atividadeService.getByProposta(id);
      const data = response.data || response;

      atividadesPorProposta.value[id] = Array.isArray(data)
        ? data.map((a) => ({
            id: a.id,
            nome: a.nome,
            concluida: a.concluida,
            propostaId: a.propostaId || id,
          }))
        : [];
    } catch {
      notify.error("Erro ao carregar atividades");
      atividadesPorProposta.value[id] = [];
    } finally {
      carregandoAtividades.value[id] = false;
    }
  }

  async function alternarAtividades(id) {
    if (propostaExpandida.value === id) {
      propostaExpandida.value = null;
    } else {
      propostaExpandida.value = id;
      await carregarAtividades(id);
    }
  }

  function getContadorConcluidas(id) {
    const atividades = atividadesPorProposta.value[id] || [];
    return atividades.filter((a) => a.concluida).length;
  }

  function abrirModalNovaAtividade(id) {
    modalNovaAtividade.value = { visible: true, propostaId: id, nome: "" };
  }

  function fecharModalNovaAtividade() {
    modalNovaAtividade.value = { visible: false, propostaId: null, nome: "" };
  }

  async function criarAtividade() {
    try {
      const { propostaId, nome } = modalNovaAtividade.value;

      if (!nome.trim()) {
        notify.warning("Por favor, informe o nome da atividade");
        return;
      }

      await atividadeService.criar({
        propostaId,
        nome: nome.trim(),
      });

      fecharModalNovaAtividade();
      await carregarAtividades(propostaId);
      notify.success("Atividade criada com sucesso!");
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Erro ao criar atividade."));
    }
  }

  async function alternarStatusAtividade(atividade) {
    try {
      const novoStatus = !atividade.concluida;
      atividade.concluida = novoStatus;

      await atividadeService.atualizar({
        id: atividade.id,
        concluida: novoStatus,
      });

      notify.success(`Atividade ${novoStatus ? "marcada como concluída" : "desmarcada"}!`);
    } catch (error) {
      atividade.concluida = !atividade.concluida;

      if (error.response?.status === 403) {
        notify.error("Acesso negado: você não tem permissão para alterar esta atividade");
      } else {
        notify.error(getApiErrorMessage(error, "Erro ao atualizar atividade."));
      }
    }
  }

  function confirmarExclusaoAtividade(atividade) {
    modalExclusaoAtividade.value = { visible: true, atividade };
  }

  function cancelarExclusaoAtividade() {
    modalExclusaoAtividade.value = { visible: false, atividade: null };
  }

  async function excluirAtividade() {
    try {
      const { atividade } = modalExclusaoAtividade.value;

      await atividadeService.remover(atividade.id);

      const propostaId = propostaExpandida.value;
      if (atividadesPorProposta.value[propostaId]) {
        atividadesPorProposta.value[propostaId] = atividadesPorProposta.value[propostaId].filter(
          (a) => a.id !== atividade.id
        );
      }

      cancelarExclusaoAtividade();
      notify.success("Atividade excluída com sucesso!");
    } catch (error) {
      if (error.response?.status === 403) {
        notify.error("Acesso negado: você não tem permissão para excluir esta atividade");
      } else if (error.response?.status === 404) {
        notify.error("Atividade não encontrada");
      } else {
        notify.error(getApiErrorMessage(error, "Erro ao excluir atividade."));
      }
    }
  }

  return {
    propostasAceitas,
    loading,
    erro,
    ultimaAtualizacao,
    atividadesPorProposta,
    carregandoAtividades,
    propostaExpandida,
    modalNovaAtividade,
    modalExclusaoAtividade,
    carregarPropostasAceitas,
    carregarAtividades,
    alternarAtividades,
    getContadorConcluidas,
    abrirModalNovaAtividade,
    fecharModalNovaAtividade,
    criarAtividade,
    alternarStatusAtividade,
    confirmarExclusaoAtividade,
    cancelarExclusaoAtividade,
    excluirAtividade,
  };
}
