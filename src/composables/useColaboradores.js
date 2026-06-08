import { ref, computed, nextTick } from "vue";
import colaboradorService from "../services/colaboradorService";
import { notify } from "../services/notificationService";
import { getApiErrorMessage } from "../utils/errorUtils";

export function useColaboradores(emit) {
  const form = ref({ nome: "", telefone: "", funcao: "" });
  const colaboradores = ref([]);
  const funcoes = ref([]);
  const filtroFuncao = ref("");
  const loading = ref(false);
  const loadingList = ref(false);
  const loadingFuncoes = ref(false);
  const nomeInput = ref(null);

  const funcoesUnicas = computed(() => {
    const todasFuncoes = funcoes.value.map((f) => f.nome || f.value).filter(Boolean);
    return [...new Set(todasFuncoes)];
  });

  const colaboradoresFiltrados = computed(() => {
    if (!filtroFuncao.value) return colaboradores.value;
    return colaboradores.value.filter((c) => c.funcao === filtroFuncao.value);
  });

  async function carregarFuncoes() {
    try {
      loadingFuncoes.value = true;
      const response = await colaboradorService.listarFuncoes();
      funcoes.value = response.data || [];
    } catch {
      funcoes.value = [];
    } finally {
      loadingFuncoes.value = false;
    }
  }

  async function carregarColaboradores() {
    try {
      loadingList.value = true;
      const response = await colaboradorService.listarPorEmpresa();
      colaboradores.value = response.data || [];

      const funcoesExistentes = [
        ...new Set(colaboradores.value.map((c) => c.funcao).filter(Boolean)),
      ];

      funcoesExistentes.forEach((funcao) => {
        if (!funcoes.value.some((f) => f.nome === funcao || f.value === funcao)) {
          funcoes.value.push({
            nome: funcao,
            key: funcao.toUpperCase().replace(/\s+/g, "_"),
            value: funcao,
          });
        }
      });
    } catch (err) {
      notify.error(getApiErrorMessage(err));
      colaboradores.value = [];
    } finally {
      loadingList.value = false;
    }
  }

  async function handleSubmit() {
    if (!form.value.nome.trim()) {
      notify.error("Por favor, informe o nome do colaborador");
      return;
    }
    if (!form.value.telefone.trim()) {
      notify.error("Por favor, informe o telefone");
      return;
    }
    if (!form.value.funcao) {
      notify.error("Por favor, selecione ou digite uma função");
      return;
    }

    try {
      loading.value = true;

      const dados = {
        nome: form.value.nome.trim(),
        telefone: form.value.telefone.trim(),
        funcao: form.value.funcao.trim(),
      };

      await colaboradorService.criar(dados);
      notify.success("Colaborador criado com sucesso!");

      const novaFuncao = dados.funcao;
      const funcaoExiste = funcoes.value.some(
        (f) =>
          (f.nome && f.nome.toLowerCase() === novaFuncao.toLowerCase()) ||
          (f.value && f.value.toLowerCase() === novaFuncao.toLowerCase())
      );

      if (!funcaoExiste) {
        funcoes.value.push({
          nome: novaFuncao,
          key: novaFuncao.toUpperCase().replace(/\s+/g, "_"),
          value: novaFuncao,
        });
      }

      form.value = { nome: "", telefone: "", funcao: "" };
      await nextTick();
      nomeInput.value?.focus();
      await carregarColaboradores();
      emit?.("created");
    } catch (err) {
      notify.error(getApiErrorMessage(err));
    } finally {
      loading.value = false;
    }
  }

  async function inicializar() {
    await Promise.all([carregarFuncoes(), carregarColaboradores()]);
  }

  return {
    form,
    colaboradores,
    funcoes,
    filtroFuncao,
    loading,
    loadingList,
    loadingFuncoes,
    nomeInput,
    funcoesUnicas,
    colaboradoresFiltrados,
    carregarColaboradores,
    handleSubmit,
    inicializar,
  };
}
