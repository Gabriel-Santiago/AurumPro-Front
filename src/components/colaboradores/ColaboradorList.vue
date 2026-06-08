<template>
  <div class="list-section">
    <div class="list-header">
      <h4>Colaboradores Cadastrados</h4>
      <div class="list-controls">
        <select v-model="filtroFuncao" class="filter-select">
          <option value="">Todas as funções</option>
          <option v-for="funcao in funcoesUnicas" :key="funcao" :value="funcao">
            {{ funcao }}
          </option>
        </select>
        <button
          class="btn-refresh"
          type="button"
          :disabled="loadingList"
          title="Atualizar lista"
          @click="carregarColaboradores"
        >
          <span v-if="loadingList">⟳</span>
          <span v-else>↻</span>
        </button>
      </div>
    </div>

    <div v-if="!loadingList && colaboradoresFiltrados.length > 0" class="colaboradores-list">
      <div
        v-for="colaborador in colaboradoresFiltrados"
        :key="colaborador.id"
        class="colaborador-item"
      >
        <div class="colaborador-info">
          <div class="colaborador-nome">{{ colaborador.nome }}</div>
          <div class="colaborador-funcao">
            <span class="funcao-badge">{{ colaborador.funcao }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loadingList && colaboradoresFiltrados.length === 0" class="empty-state">
      <div v-if="filtroFuncao">Nenhum colaborador com a função selecionada.</div>
      <div v-else>Nenhum colaborador cadastrado ainda.</div>
    </div>

    <div v-else class="loading-state">Carregando colaboradores...</div>

    <div class="list-info">
      <small>
        Total: {{ colaboradoresFiltrados.length }} colaborador(es)
        <span v-if="filtroFuncao"> (filtrado)</span>
      </small>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";

const {
  filtroFuncao,
  funcoesUnicas,
  colaboradoresFiltrados,
  loadingList,
  carregarColaboradores,
} = inject("colaboradoresState");
</script>
