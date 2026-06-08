<template>
  <div class="page">
    <h4>Confirmação da Proposta</h4>

    <div class="resumo">
      <div class="resumo-section">
        <h5>Cliente</h5>
        <p>{{ cliente.nome }} ({{ cliente.tipoPessoa }})</p>
      </div>

      <div v-if="colaboradorSelecionado" class="resumo-section">
        <h5>Colaborador Responsável</h5>
        <div class="colaborador-resumo">
          <p><strong>Nome:</strong> {{ colaboradorSelecionado.nome }}</p>
          <p v-if="colaboradorSelecionado.funcao">
            <strong>Função:</strong> {{ colaboradorSelecionado.funcao }}
          </p>
        </div>
      </div>
      <div v-else class="resumo-section">
        <h5>Colaborador Responsável</h5>
        <p><em>Nenhum colaborador atribuído</em></p>
      </div>

      <div
        v-if="form.convenioSelecao === 'SELECIONAR' && convenioSelecionado"
        class="resumo-section"
      >
        <h5>Origem do Cliente</h5>
        <p>{{ convenioSelecionado.nome }}</p>
        <p v-if="convenioSelecionado.descricao" class="convenio-descricao-resumo">
          <small>{{ convenioSelecionado.descricao }}</small>
        </p>
      </div>
      <div v-else class="resumo-section">
        <h5>Origem do Cliente</h5>
        <p><em>Não informada</em></p>
      </div>

      <div class="resumo-section">
        <h5>Itens da Proposta ({{ form.itens.length }})</h5>
        <div v-for="(item, index) in form.itens" :key="index" class="resumo-item">
          <p><strong>Item {{ index + 1 }}:</strong> {{ getNomeServico(item.servicoId) }}</p>
          <p v-if="item.microServicoIds.length > 0">
            Micro Serviços: {{ item.microServicoIds.length }} selecionados
          </p>
          <p v-if="item.valorTotal > 0">Valor: R$ {{ item.valorTotal.toFixed(2) }}</p>
        </div>
      </div>

      <div v-if="form.atividades.length > 0" class="resumo-section">
        <h5>Atividades ({{ form.atividades.length }})</h5>
        <div v-for="(atividade, index) in form.atividades" :key="index" class="resumo-item">
          <p><strong>Atividade {{ index + 1 }}:</strong> {{ atividade.nome }}</p>
        </div>
      </div>
      <div v-else class="resumo-section">
        <h5>Atividades</h5>
        <p><em>Nenhuma atividade cadastrada</em></p>
      </div>

      <div v-if="form.custos.length > 0" class="resumo-section">
        <h5>Custos Adicionais ({{ form.custos.length }})</h5>
        <div v-for="(custo, index) in form.custos" :key="index" class="resumo-item">
          <p>
            <strong>{{ custo.nome || "Custo sem nome" }}:</strong>
            R$ {{ (parseFloat(custo.valor) || 0).toFixed(2) }}
          </p>
        </div>
      </div>

      <div v-if="form.tipoDesconto !== 'NENHUM'" class="resumo-section">
        <h5>Desconto Aplicado</h5>
        <p>
          <strong>Tipo:</strong>
          {{ form.tipoDesconto === "VALOR" ? "Valor Fixo" : "Porcentagem" }}<br />
          <span v-if="form.tipoDesconto === 'VALOR'">
            <strong>Valor:</strong> R$ {{ (form.valorDesconto || 0).toFixed(2) }}
          </span>
          <span v-if="form.tipoDesconto === 'PORCENTAGEM'">
            <strong>Porcentagem:</strong> {{ form.porcentagemDesconto || 0 }}%
          </span>
        </p>
      </div>

      <div class="resumo-section total">
        <h5>Valor Total Estimado</h5>
        <p class="total-valor">R$ {{ calcularValorTotalProposta().toFixed(2) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";

defineProps({
  cliente: { type: Object, required: true },
});

const {
  form,
  colaboradorSelecionado,
  convenioSelecionado,
  getNomeServico,
  calcularValorTotalProposta,
} = inject("propostaForm");
</script>
