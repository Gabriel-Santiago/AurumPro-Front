<template>
  <div class="add-section">
    <h4>Adicionar Novo Sub Serviço</h4>
    <form class="add-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Nome do Sub Serviço *</label>
        <input
          ref="nomeInput"
          v-model="form.nome"
          placeholder="Digite o nome do subserviço"
          required
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label>Serviço *</label>
        <select v-model="form.servicoId" required :disabled="loading || servicos.length === 0">
          <option value="">Selecione um serviço</option>
          <option v-for="servico in servicos" :key="servico.id" :value="servico.id">
            {{ servico.nome }}
          </option>
        </select>
        <small v-if="servicos.length === 0" class="warning">
          Nenhum serviço cadastrado. Crie um serviço primeiro.
        </small>
      </div>

      <div class="form-group">
        <label>Descrição</label>
        <textarea
          v-model="form.descricao"
          placeholder="Descrição do subserviço"
          rows="3"
          :disabled="loading"
        ></textarea>
      </div>

      <button type="submit" class="btn-submit" :disabled="loading || servicos.length === 0">
        <span v-if="loading">Criando...</span>
        <span v-else>Criar Sub Serviço</span>
      </button>

      <div v-if="successMessage" class="success-message">✓ {{ successMessage }}</div>
      <div v-if="errorMessage" class="error-message">✗ {{ errorMessage }}</div>
    </form>
  </div>
</template>

<script setup>
import { inject } from "vue";

const {
  form,
  servicos,
  loading,
  successMessage,
  errorMessage,
  nomeInput,
  handleSubmit,
} = inject("subservicosState");
</script>
