<template>
  <div v-if="step === 3" class="page">
    <div class="page-header">
      <h4>Custos Adicionais</h4>
      <button type="button" class="btn-add" @click="adicionarCusto">
        + Adicionar Custo
      </button>
    </div>

    <div v-for="(custo, index) in form.custos" :key="index" class="item-container">
      <div class="item-header">
        <h5>Custo {{ index + 1 }}</h5>
        <button type="button" class="btn-remove" @click="removerCusto(index)">
          Remover
        </button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Nome do Custo *</label>
          <input v-model="custo.nome" placeholder="Ex: Materiais, Transporte" required />
        </div>

        <div class="form-group">
          <label>Valor (R$) *</label>
          <input
            v-model="custo.valor"
            type="number"
            step="0.01"
            placeholder="0.00"
            min="0"
            required
          />
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="step === 4" class="page">
    <h4>Aplicar Desconto</h4>

    <div class="form-group">
      <label>Tipo de Desconto</label>
      <div class="radio-group">
        <label class="radio-option">
          <input v-model="form.tipoDesconto" type="radio" value="NENHUM" />
          <span>Nenhum Desconto</span>
        </label>
        <label class="radio-option">
          <input v-model="form.tipoDesconto" type="radio" value="VALOR" />
          <span>Desconto em Valor</span>
        </label>
        <label class="radio-option">
          <input v-model="form.tipoDesconto" type="radio" value="PORCENTAGEM" />
          <span>Desconto em Porcentagem</span>
        </label>
      </div>
    </div>

    <div v-if="form.tipoDesconto === 'VALOR'" class="form-group">
      <label>Valor do Desconto (R$)</label>
      <input
        v-model="form.valorDesconto"
        type="number"
        step="0.01"
        placeholder="0.00"
        min="0"
      />
    </div>

    <div v-if="form.tipoDesconto === 'PORCENTAGEM'" class="form-group">
      <label>Porcentagem de Desconto (%)</label>
      <input
        v-model="form.porcentagemDesconto"
        type="number"
        step="0.1"
        min="0"
        max="100"
        placeholder="0.0"
      />
    </div>

    <div v-if="form.tipoDesconto !== 'NENHUM'" class="desconto-preview">
      <p>
        Desconto aplicado:
        <span v-if="form.tipoDesconto === 'VALOR'">
          R$ {{ (form.valorDesconto || 0).toFixed(2) }}
        </span>
        <span v-if="form.tipoDesconto === 'PORCENTAGEM'">
          {{ form.porcentagemDesconto || 0 }}%
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";

defineProps({
  step: { type: Number, required: true },
});

const { form, adicionarCusto, removerCusto } = inject("propostaForm");
</script>
