import { ref, computed } from "vue";
import documentoService from "../services/documentoService";
import { notify } from "../services/notificationService";
import { getApiErrorMessage } from "../utils/errorUtils";
import {
  formatarValor,
  formatarTelefone,
  formatarCNPJ,
  formatarCPF,
} from "../utils/formatters";

export function useDocumento(proposta) {
  const documento = ref(null);
  const conteudo = ref("");
  const loading = ref(false);
  const erro = ref(null);
  const visualizacao = ref("visual");

  const consultorNome = computed(() => {
    if (!documento.value) return "Não informado";
    if (documento.value.colaborador?.nome) {
      return documento.value.colaborador.nome;
    }
    if (documento.value.empresa?.responsavel) {
      return `${documento.value.empresa.responsavel} (Responsável da Empresa)`;
    }
    return "Não informado";
  });

  const documentoClienteFormatado = computed(() => {
    if (!documento.value?.cliente) return "";
    if (documento.value.cliente.tipoPessoa === "PF") {
      return formatarCPF(documento.value.cliente.cpf);
    }
    return formatarCNPJ(documento.value.cliente.cnpj);
  });

  const enderecoEmpresa = computed(() => {
    if (!documento.value?.empresa) return "Não informado";
    const partes = [
      documento.value.empresa.rua,
      documento.value.empresa.bairro,
      documento.value.empresa.numero,
      documento.value.empresa.cidade,
      documento.value.empresa.estado,
    ].filter(Boolean);
    return partes.join(", ");
  });

  const cidadeUfEmpresa = computed(() => {
    if (!documento.value?.empresa) return "";
    return `${documento.value.empresa.cidade || ""}/${documento.value.empresa.estado || ""}`.trim();
  });

  const dataAtualFormatada = computed(() => {
    return new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  });

  function gerarConteudoBasico() {
    if (!documento.value) return "Dados não disponíveis";

    let texto = "TERMO DE PRESTAÇÃO DE SERVIÇOS\n\n";
    texto += "1. Dados do Cliente Contratante\n";

    if (documento.value.cliente) {
      texto += `• Nome: ${documento.value.cliente.nome}\n`;
      texto += `• Telefone: ${documento.value.cliente.telefone}\n`;
      texto += `• E-mail: ${documento.value.cliente.email}\n`;
    }

    texto += "\n2. Dados da Empresa Contratada\n";
    if (documento.value.empresa) {
      texto += `Empresa: ${documento.value.empresa.nome}\n`;
      texto += `Responsável: ${documento.value.empresa.responsavel}\n`;
    }

    texto += "\n3. Serviços e Subserviços Contratados\n";
    texto +=
      documento.value.servicoList?.length > 0
        ? `${documento.value.servicoList.length} serviço(s)\n`
        : "Nenhum serviço contratado\n";

    texto += "\n5. Investimento\n";
    texto += `• Valor proposto: R$ ${formatarValor(documento.value.valorTotal)}\n`;
    texto += "• Forma de pagamento: ___________________________\n\n";
    texto += "6. Condições Gerais\n";
    texto += "O início do atendimento será a partir do dia: _________________________.\n";
    texto += `${cidadeUfEmpresa.value}, ${dataAtualFormatada.value}\n\n`;
    texto += "Cliente: ___________________________________________\n";
    texto += `Consultor(a): ${consultorNome.value}\n`;

    return texto;
  }

  async function carregarConteudo() {
    try {
      const response = await documentoService.visualizarDados(proposta.id);
      conteudo.value = response.data.conteudo;
    } catch (error) {
      notify.error(getApiErrorMessage(error));
      conteudo.value = gerarConteudoBasico();
    }
  }

  async function carregarDados() {
    loading.value = true;
    erro.value = null;

    try {
      const response = await documentoService.buscarDados(proposta.id);
      documento.value = response.data;

      if (documento.value) {
        await carregarConteudo();
      } else {
        notify.error("Proposta não encontrada");
      }
    } catch (error) {
      notify.error(getApiErrorMessage(error));
      documento.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function baixarDocumento() {
    if (!documento.value) {
      erro.value = "Não há dados suficientes para gerar o documento";
      return;
    }

    try {
      loading.value = true;

      const response = await documentoService.downloadDados(proposta.id);

      const contentDisposition = response.headers["content-disposition"];
      let filename = `Proposta_${proposta.id}_${new Date().toISOString().slice(0, 10)}.docx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      notify.success("Documento será baixado!");
    } catch (error) {
      notify.error(getApiErrorMessage(error));

      if (error.message?.includes("colaborador") || error.response?.status === 500) {
        erro.value = "Erro ao gerar documento. Verifique se o colaborador está atribuído à proposta.";
      } else {
        erro.value = "Erro ao baixar o documento. Tente novamente.";
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    documento,
    conteudo,
    loading,
    erro,
    visualizacao,
    consultorNome,
    documentoClienteFormatado,
    enderecoEmpresa,
    cidadeUfEmpresa,
    dataAtualFormatada,
    formatarValor,
    formatarTelefone,
    formatarCNPJ,
    formatarCPF,
    carregarDados,
    baixarDocumento,
  };
}
