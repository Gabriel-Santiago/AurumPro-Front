import { ref, computed, nextTick } from "vue";
import subservicoService from "../services/subservicoService";
import servicoService from "../services/servicoService";
import { notify } from "../services/notificationService";

export function useSubservicos(emit) {
  const form = ref({ nome: "", servicoId: "", descricao: "" });
  const servicos = ref([]);
  const subservicos = ref([]);
  const filtroServico = ref("");
  const loading = ref(false);
  const loadingList = ref(false);
  const successMessage = ref("");
  const errorMessage = ref("");
  const nomeInput = ref(null);

  const subservicosFiltrados = computed(() => {
    if (!filtroServico.value) return subservicos.value;
    return subservicos.value.filter((sub) => sub.servicoId == filtroServico.value);
  });

  async function carregarServicos() {
    try {
      const response = await servicoService.listarTodos();
      servicos.value = response.data || [];
    } catch {
      servicos.value = [];
    }
  }

  async function carregarSubservicos() {
    try {
      loadingList.value = true;
      const todosSubservicos = [];

      if (servicos.value.length === 0) {
        subservicos.value = [];
        return;
      }

      for (const servico of servicos.value) {
        try {
          const response = await subservicoService.listarTodos(servico.id);
          const lista = response.data || [];
          lista.forEach((sub) => {
            todosSubservicos.push({ ...sub, servicoId: servico.id });
          });
        } catch {
          notify.error("Erro ao carregar subserviços do serviço");
        }
      }

      subservicos.value = todosSubservicos;
    } catch {
      notify.error("Erro ao carregar subserviços do serviço");
    } finally {
      loadingList.value = false;
    }
  }

  function getNomeServico(servicoId) {
    const servico = servicos.value.find((s) => s.id == servicoId);
    return servico ? servico.nome : "Serviço não encontrado";
  }

  async function handleSubmit() {
    if (!form.value.nome.trim()) {
      errorMessage.value = "Por favor, informe um nome para o subserviço";
      setTimeout(() => (errorMessage.value = ""), 3000);
      return;
    }
    if (!form.value.servicoId) {
      errorMessage.value = "Por favor, selecione um serviço";
      setTimeout(() => (errorMessage.value = ""), 3000);
      return;
    }

    try {
      loading.value = true;
      successMessage.value = "";
      errorMessage.value = "";

      await subservicoService.criar({
        servicoId: form.value.servicoId,
        nome: form.value.nome.trim(),
        descricao: form.value.descricao.trim(),
      });

      form.value = { nome: "", servicoId: "", descricao: "" };
      await nextTick();
      nomeInput.value?.focus();
      await carregarSubservicos();

      notify.success("Subserviço criado com sucesso!");
      emit?.("created");
    } catch {
      notify.error("Erro ao criar subserviço");
    } finally {
      loading.value = false;
    }
  }

  async function inicializar() {
    await carregarServicos();
    await carregarSubservicos();
  }

  return {
    form,
    servicos,
    subservicos,
    filtroServico,
    loading,
    loadingList,
    successMessage,
    errorMessage,
    nomeInput,
    subservicosFiltrados,
    carregarSubservicos,
    getNomeServico,
    handleSubmit,
    inicializar,
  };
}
