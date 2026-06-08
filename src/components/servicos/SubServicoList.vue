<template>
  <div class="list-section">
    <div class="list-header">
      <h4>Sub Serviços Cadastrados</h4>
      <div class="list-controls">
        <select v-model="filtroServico" class="filter-select">
          <option value="">Todos os serviços</option>
          <option v-for="servico in servicos" :key="servico.id" :value="servico.id">
            {{ servico.nome }}
          </option>
        </select>
        <button
          class="btn-refresh"
          type="button"
          :disabled="loadingList"
          title="Atualizar lista"
          @click="carregarSubservicos"
        >
          <span v-if="loadingList">⟳</span>
          <span v-else>↻</span>
        </button>
      </div>
    </div>

    <div v-if="!loadingList && subservicosFiltrados.length > 0" class="subservicos-list">
      <div
        v-for="subservico in subservicosFiltrados"
        :key="subservico.id"
        class="subservico-item"
      >
        <div class="subservico-nome">{{ subservico.nome }}</div>
        <div v-if="subservico.descricao" class="subservico-descricao">
          {{ subservico.descricao }}
        </div>
        <div class="subservico-servico">
          <small>Serviço: {{ getNomeServico(subservico.servicoId) }}</small>
        </div>
      </div>
    </div>

    <div v-else-if="!loadingList && subservicosFiltrados.length === 0" class="empty-state">
      <div v-if="filtroServico">Nenhum subserviço para o serviço selecionado.</div>
      <div v-else>Nenhum subserviço cadastrado ainda.</div>
    </div>

    <div v-else class="loading-state">Carregando subserviços...</div>

    <div class="list-info">
      <small>
        Total: {{ subservicosFiltrados.length }} sub serviço(s)
        <span v-if="filtroServico"> (filtrado)</span>
      </small>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";

const {
  servicos,
  filtroServico,
  subservicosFiltrados,
  loadingList,
  carregarSubservicos,
  getNomeServico,
} = inject("subservicosState");
</script>
