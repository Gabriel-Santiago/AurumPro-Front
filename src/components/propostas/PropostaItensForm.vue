<template>
  <div class="page">
    <div class="page-header">
      <h4>Itens da Proposta</h4>
      <button type="button" class="btn-add" @click="adicionarItem">
        + Adicionar Item
      </button>
    </div>

    <div v-for="(item, index) in form.itens" :key="index" class="item-container">
      <div class="item-header">
        <h5>Item {{ index + 1 }}</h5>
        <button
          v-if="form.itens.length > 1"
          type="button"
          class="btn-remove"
          @click="removerItem(index)"
        >
          Remover
        </button>
      </div>

      <div class="form-group">
        <label>Serviço *</label>
        <select v-model="item.servicoId" required @change="carregarMicroServicos(item)">
          <option value="">Selecione um serviço</option>
          <option v-for="servico in servicos" :key="servico.id" :value="servico.id">
            {{ servico.nome }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Sub Serviços *</label>
        <select
          v-model="item.microServicoIds"
          multiple
          required
          @change="carregarValoresMicroServico(item)"
        >
          <option
            v-for="microServico in item.microServicosDisponiveis"
            :key="microServico.id"
            :value="microServico.id"
            :title="microServico.descricao"
          >
            {{ microServico.nome }}
          </option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Valor por Hora (R$)</label>
          <input
            v-model="item.valorHora"
            type="number"
            step="0.01"
            placeholder="0.00"
            min="0"
            @input="calcularValorTotal(item)"
          />
        </div>

        <div class="form-group">
          <label>Quantidade de Horas</label>
          <input
            v-model="item.qtdHora"
            type="number"
            step="0.5"
            placeholder="0.0"
            min="0"
            @input="calcularValorTotal(item)"
          />
        </div>
      </div>

      <div v-if="item.valorTotal > 0" class="valor-total">
        <strong>Valor Total: R$ {{ item.valorTotal.toFixed(2) }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";

const {
  form,
  servicos,
  adicionarItem,
  removerItem,
  carregarMicroServicos,
  carregarValoresMicroServico,
  calcularValorTotal,
} = inject("propostaForm");
</script>
