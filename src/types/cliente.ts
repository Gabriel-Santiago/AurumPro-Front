export type TipoPessoa = "PF" | "PJ";

export interface Cliente {
  id: number | string;
  tipoPessoa: TipoPessoa;
  nome?: string;
  responsavel?: string;
  email?: string;
  telefone?: string;
  uf?: string;
  [key: string]: unknown;
}

export interface DeletarClientePayload {
  id: number | string;
  senha: string;
  tipoPessoa: TipoPessoa;
}
