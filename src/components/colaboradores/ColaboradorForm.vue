<template>
  <div class="add-section">
    <h4>Adicionar Novo Colaborador</h4>
    <form class="add-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Nome *</label>
        <input
          ref="nomeInput"
          v-model="form.nome"
          placeholder="Digite o nome do colaborador"
          required
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label>Telefone *</label>
        <input
          v-model="form.telefone"
          placeholder="(00) 00000-0000"
          required
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label>Função *</label>
        <input
          v-model="form.funcao"
          list="funcoes-list"
          placeholder="Selecione ou digite uma nova função"
          required
          class="funcao-input"
          :disabled="loading || loadingFuncoes"
        />
        <datalist id="funcoes-list">
          <option
            v-for="funcao in funcoes"
            :key="funcao.id || funcao.key"
            :value="funcao.nome || funcao.value"
          >
            {{ funcao.nome || funcao.value }}
          </option>
        </datalist>
        <small v-if="loadingFuncoes" class="loading">Carregando funções...</small>
        <small v-if="!loadingFuncoes && funcoes.length === 0" class="info">
          Nenhuma função cadastrada. Digite uma nova função.
        </small>
      </div>

      <button type="submit" class="btn-submit" :disabled="loading || loadingFuncoes">
        <span v-if="loading">Criando...</span>
        <span v-else>Criar Colaborador</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { inject } from "vue";

const {
  form,
  funcoes,
  loading,
  loadingFuncoes,
  nomeInput,
  handleSubmit,
} = inject("colaboradoresState");
</script>
