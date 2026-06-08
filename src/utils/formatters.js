export function formatarValor(valor) {
  if (!valor && valor !== 0) return "0,00";
  const valorNumerico = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valorNumerico || 0);
}

export function formatarData(dataString) {
  if (!dataString) return "";
  try {
    return new Date(dataString).toLocaleDateString("pt-BR");
  } catch {
    return dataString;
  }
}

export function formatarDataCompleta(dataString) {
  if (!dataString) return "";
  try {
    const data = new Date(dataString);
    return (
      data.toLocaleDateString("pt-BR") +
      " às " +
      data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return dataString;
  }
}

export function formatarStatus(status) {
  const statusMap = {
    EM_AVALIACAO: "Em Avaliação",
    ACEITA: "Aceita",
    RECUSADA: "Recusada",
    EXPIRADA: "Expirada",
  };
  return statusMap[status] || status || "Desconhecido";
}

export function formatarTaxaAceitacao(taxa) {
  if (taxa === null || taxa === undefined) return "0.00";
  if (typeof taxa === "number") return taxa.toFixed(2);
  if (typeof taxa === "string") return parseFloat(taxa).toFixed(2);
  return "0.00";
}

export function calcularDiasRestantes(dataValidade) {
  if (!dataValidade) return "";

  const hoje = new Date();
  const validade = new Date(dataValidade);

  hoje.setHours(0, 0, 0, 0);
  validade.setHours(0, 0, 0, 0);

  const dias = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));

  if (dias > 0) return `${dias} dias restantes`;
  if (dias === 0) return "Vence hoje";
  return `Expirada há ${Math.abs(dias)} dias`;
}

export function calcularDiasExpiracao(dataValidade) {
  if (!dataValidade) return "";
  const hoje = new Date();
  const validade = new Date(dataValidade);
  const dias = Math.ceil((hoje - validade) / (1000 * 60 * 60 * 24));
  return Math.max(0, dias);
}

export function getClasseValidade(dataValidade) {
  if (!dataValidade) return "";
  const hoje = new Date();
  const validade = new Date(dataValidade);
  const dias = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));

  if (dias <= 0) return "expirada";
  if (dias <= 2) return "urgente";
  if (dias <= 5) return "proxima";
  return "normal";
}

export function formatarTelefone(telefone) {
  if (!telefone) return "";
  const numeros = telefone.replace(/\D/g, "");

  if (numeros.length === 10) {
    return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
  }
  if (numeros.length === 11) {
    return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
  }
  return telefone;
}

export function formatarCNPJ(cnpj) {
  if (!cnpj) return "";
  const numeros = cnpj.replace(/\D/g, "");

  if (numeros.length === 14) {
    return `${numeros.substring(0, 2)}.${numeros.substring(2, 5)}.${numeros.substring(5, 8)}/${numeros.substring(8, 12)}-${numeros.substring(12)}`;
  }
  return cnpj;
}

export function formatarCPF(cpf) {
  if (!cpf) return "";
  const numeros = cpf.replace(/\D/g, "");

  if (numeros.length === 11) {
    return `${numeros.substring(0, 3)}.${numeros.substring(3, 6)}.${numeros.substring(6, 9)}-${numeros.substring(9)}`;
  }
  return cpf;
}
