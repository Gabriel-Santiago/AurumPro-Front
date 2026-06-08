import { ref, computed, watch } from "vue";
import servicoService from "../services/servicoService";
import subservicoService from "../services/subservicoService";
import convenioService from "../services/convenioService";
import propostaService from "../services/propostaService";
import custoService from "../services/custoService";
import itemPropostaService from "../services/itemPropostaService";
import colaboradorService from "../services/colaboradorService";
import atividadeService from "../services/atividadeService";
import { notify } from "../services/notificationService";
import { getApiErrorMessage } from "../utils/errorUtils";

export const TOTAL_PROPOSTA_STEPS = 7;

export function createInitialForm() {
  return {
    itens: [{
      servicoId: "",
      microServicoIds: [],
      microServicosDisponiveis: [],
      valorHora: 0,
      qtdHora: 0,
      valorTotal: 0,
    }],
    atividades: [],
    custos: [],
    tipoDesconto: "NENHUM",
    valorDesconto: 0,
    porcentagemDesconto: 0,
    colaboradorSelecao: "NENHUM",
    colaboradorId: null,
    convenioSelecao: "NENHUM",
    convenioId: null,
  };
}

export function usePropostaForm(cliente, emit) {
  const currentPage = ref(1);
  const servicos = ref([]);
  const colaboradores = ref([]);
  const convenios = ref([]);
  const loading = ref(false);

  const form = ref(createInitialForm());

  const convenioSelecionado = computed(() => {
    if (!form.value.convenioId) return null;
    return convenios.value.find((c) => c.id === form.value.convenioId) || null;
  });

  const colaboradorSelecionado = computed(() => {
    if (!form.value.colaboradorId) return null;
    return colaboradores.value.find((c) => c.id === form.value.colaboradorId) || null;
  });

  const carregarDados = async () => {
    try {
      const [resServicos, resColaboradores, resConvenios] = await Promise.all([
        servicoService.listarTodos(),
        colaboradorService.listarPorEmpresa(),
        convenioService.listarPorEmpresa(),
      ]);

      servicos.value = resServicos.data || [];
      colaboradores.value = resColaboradores.data || [];
      convenios.value = resConvenios.data || [];
    } catch (err) {
      notify.error(getApiErrorMessage(err));
    }
  };

  const validarPaginaAtual = () => {
    switch (currentPage.value) {
      case 1:
        return (
          form.value.itens.length > 0 &&
          form.value.itens.every(
            (item) =>
              item.servicoId &&
              item.microServicoIds.length > 0 &&
              (parseFloat(item.valorHora) || 0) > 0 &&
              (parseFloat(item.qtdHora) || 0) > 0
          )
        );
      case 2:
        return form.value.atividades.every(
          (atividade) => atividade.nome && atividade.nome.trim() !== ""
        );
      case 3:
        return form.value.custos.every(
          (custo) =>
            custo.nome &&
            custo.nome.trim() !== "" &&
            (parseFloat(custo.valor) || 0) >= 0
        );
      case 4:
        if (form.value.tipoDesconto === "VALOR") {
          return (parseFloat(form.value.valorDesconto) || 0) > 0;
        }
        if (form.value.tipoDesconto === "PORCENTAGEM") {
          const porcentagem = parseFloat(form.value.porcentagemDesconto) || 0;
          return porcentagem > 0 && porcentagem <= 100;
        }
        return true;
      case 5:
        if (form.value.colaboradorSelecao === "SELECIONAR") {
          return form.value.colaboradorId !== null && form.value.colaboradorId !== "";
        }
        return true;
      case 6:
        if (form.value.convenioSelecao === "SELECIONAR") {
          return form.value.convenioId !== null && form.value.convenioId !== "";
        }
        return true;
      default:
        return true;
    }
  };

  const adicionarItem = () => {
    form.value.itens.push({
      servicoId: "",
      microServicoIds: [],
      microServicosDisponiveis: [],
      valorHora: 0,
      qtdHora: 0,
      valorTotal: 0,
    });
  };

  const removerItem = (index) => {
    if (form.value.itens.length > 1) {
      form.value.itens.splice(index, 1);
    }
  };

  const adicionarAtividade = () => {
    form.value.atividades.push({ nome: "" });
  };

  const removerAtividade = (index) => {
    form.value.atividades.splice(index, 1);
  };

  const adicionarCusto = () => {
    form.value.custos.push({ nome: "", valor: 0 });
  };

  const removerCusto = (index) => {
    form.value.custos.splice(index, 1);
  };

  const carregarMicroServicos = async (item) => {
    try {
      if (!item.servicoId) {
        item.microServicosDisponiveis = [];
        item.microServicoIds = [];
        item.valorTotal = 0;
        return;
      }

      const res = await subservicoService.listarTodos(item.servicoId);
      item.microServicosDisponiveis = res.data || [];
      item.microServicoIds = [];
      item.valorTotal = 0;
    } catch (err) {
      notify.error(getApiErrorMessage(err));
      item.microServicosDisponiveis = [];
    }
  };

  const carregarValoresMicroServico = async (item) => {
    calcularValorTotal(item);
  };

  const calcularValorTotal = (item) => {
    const valorHora = parseFloat(item.valorHora) || 0;
    const qtdHora = parseFloat(item.qtdHora) || 0;
    item.valorTotal = valorHora * qtdHora;
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return "";
    const numeros = telefone.replace(/\D/g, "");

    if (numeros.length === 10) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
    }
    if (numeros.length === 11) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
    }

    return telefone;
  };

  const getNomeServico = (servicoId) => {
    if (!servicoId) return "Serviço não selecionado";
    const servico = servicos.value.find((s) => s.id === servicoId);
    return servico ? servico.nome : "Serviço não encontrado";
  };

  const calcularValorTotalProposta = () => {
    let totalItens = 0;
    form.value.itens.forEach((item) => {
      totalItens += item.valorTotal || 0;
    });

    let totalCustos = 0;
    form.value.custos.forEach((custo) => {
      totalCustos += parseFloat(custo.valor) || 0;
    });

    let totalComDesconto = totalItens + totalCustos;

    if (form.value.tipoDesconto === "VALOR") {
      totalComDesconto -= parseFloat(form.value.valorDesconto) || 0;
    } else if (form.value.tipoDesconto === "PORCENTAGEM") {
      const porcentagem = parseFloat(form.value.porcentagemDesconto) || 0;
      totalComDesconto -= totalComDesconto * (porcentagem / 100);
    }

    return Math.max(0, totalComDesconto);
  };

  const mostrarErroValidacao = () => {
    let mensagem = "";

    switch (currentPage.value) {
      case 1:
        mensagem = "Preencha corretamente os itens da proposta.";
        break;
      case 2:
        mensagem = "Se adicionar atividades, todas precisam ter nome.";
        break;
      case 3:
        mensagem = "Se adicionar custos, todos precisam ter nome e valor válido.";
        break;
      case 4:
        if (form.value.tipoDesconto === "VALOR") {
          mensagem = "Informe um valor de desconto maior que zero.";
        } else if (form.value.tipoDesconto === "PORCENTAGEM") {
          mensagem = "Informe uma porcentagem entre 0 e 100.";
        }
        break;
      case 5:
        mensagem = "Selecione um colaborador ou escolha não atribuir.";
        break;
      case 6:
        mensagem = "Selecione um convênio ou escolha não informar origem.";
        break;
      default:
        mensagem = "Revise os dados informados.";
    }

    notify.alert(mensagem);
  };

  const nextPage = () => {
    if (currentPage.value < TOTAL_PROPOSTA_STEPS && validarPaginaAtual()) {
      currentPage.value++;
    } else {
      mostrarErroValidacao();
    }
  };

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  const criarCustos = async () => {
    const custosValidos = form.value.custos.filter(
      (custo) =>
        custo.nome &&
        custo.nome.trim() !== "" &&
        (parseFloat(custo.valor) || 0) >= 0
    );

    if (custosValidos.length === 0) return [];

    const results = await Promise.all(
      custosValidos.map(async (custo) => {
        const response = await custoService.criar({
          nome: custo.nome.trim(),
          valor: parseFloat(custo.valor) || 0,
        });
        return Number(response?.data?.id ?? response?.id ?? null);
      })
    );

    return results.filter((id) => id !== null && !Number.isNaN(id));
  };

  const criarAtividades = async () => {
    const atividadesValidas = form.value.atividades.filter(
      (atividade) => atividade.nome && atividade.nome.trim() !== ""
    );

    if (atividadesValidas.length === 0) return [];

    const results = await Promise.all(
      atividadesValidas.map(async (atividade) => {
        const response = await atividadeService.criarAtividadeProposta({
          nome: atividade.nome.trim(),
        });
        return Number(response?.data?.id ?? response?.id ?? null);
      })
    );

    return results.filter((id) => id !== null && !Number.isNaN(id));
  };

  const criarItens = async () => {
    const itensValidos = form.value.itens.filter(
      (item) => item.servicoId && item.microServicoIds.length > 0
    );

    if (itensValidos.length === 0) return [];

    const promises = [];

    for (const item of itensValidos) {
      for (const microServicoId of item.microServicoIds) {
        promises.push(
          itemPropostaService
            .criar({
              servicoId: Number(item.servicoId),
              microServicoId: Number(microServicoId),
              valorHora: parseFloat(item.valorHora) || 0,
              qtdHora: parseFloat(item.qtdHora) || 0,
              valorTotal: parseFloat(item.valorTotal) || 0,
            })
            .then((response) => Number(response?.data?.id ?? response?.id ?? null))
        );
      }
    }

    const results = await Promise.all(promises);
    return results.filter((id) => id !== null && !Number.isNaN(id));
  };

  const submitProposta = async () => {
    try {
      loading.value = true;

      const itemPropostaIds = await criarItens();

      if (itemPropostaIds.length === 0) {
        notify.alert("Adicione pelo menos um item válido à proposta.");
        currentPage.value = 1;
        return false;
      }

      const [custosIds, atividadeIds] = await Promise.all([
        criarCustos(),
        criarAtividades(),
      ]);

      await propostaService.criar({
        clienteId: Number(cliente.id),
        convenioId:
          form.value.convenioSelecao === "SELECIONAR" && form.value.convenioId
            ? Number(form.value.convenioId)
            : null,
        colaboradorId:
          form.value.colaboradorSelecao === "SELECIONAR" && form.value.colaboradorId
            ? Number(form.value.colaboradorId)
            : null,
        custoList: custosIds,
        itemPropostaList: itemPropostaIds,
        atividadeList: atividadeIds,
        tipoDesconto: form.value.tipoDesconto,
        desconto: form.value.tipoDesconto !== "NENHUM",
        valorDesconto:
          form.value.tipoDesconto === "VALOR"
            ? parseFloat(form.value.valorDesconto) || 0
            : 0,
        porcentagemDesconto:
          form.value.tipoDesconto === "PORCENTAGEM"
            ? parseFloat(form.value.porcentagemDesconto) || 0
            : 0,
      });

      notify.success("Proposta criada com sucesso!");
      emit("created");
      return true;
    } catch (err) {
      notify.error(getApiErrorMessage(err));
      return false;
    } finally {
      loading.value = false;
    }
  };

  watch(
    () => form.value.colaboradorSelecao,
    (newVal) => {
      if (newVal === "NENHUM") form.value.colaboradorId = null;
    }
  );

  watch(
    () => form.value.convenioSelecao,
    (newVal) => {
      if (newVal === "NENHUM") form.value.convenioId = null;
    }
  );

  watch(
    () => form.value.tipoDesconto,
    (newVal) => {
      if (newVal !== "VALOR") form.value.valorDesconto = 0;
      if (newVal !== "PORCENTAGEM") form.value.porcentagemDesconto = 0;
    }
  );

  return {
    currentPage,
    servicos,
    colaboradores,
    convenios,
    loading,
    form,
    convenioSelecionado,
    colaboradorSelecionado,
    carregarDados,
    validarPaginaAtual,
    adicionarItem,
    removerItem,
    adicionarAtividade,
    removerAtividade,
    adicionarCusto,
    removerCusto,
    carregarMicroServicos,
    carregarValoresMicroServico,
    calcularValorTotal,
    formatarTelefone,
    getNomeServico,
    calcularValorTotalProposta,
    nextPage,
    prevPage,
    submitProposta,
  };
}
