<template>
  <div class="modal-actions">
    <button v-if="currentPage > 1" type="button" class="btn-secondary" @click="prevPage">
      Voltar
    </button>

    <button
      v-if="currentPage < totalSteps"
      type="button"
      class="btn-primary"
      :disabled="!validarPaginaAtual()"
      @click="nextPage"
    >
      Próximo
    </button>

    <button
      v-if="currentPage === totalSteps"
      type="button"
      class="btn-submit"
      :disabled="loading"
      @click="onSubmit"
    >
      <span v-if="loading">Criando...</span>
      <span v-else>Criar Proposta</span>
    </button>
  </div>
</template>

<script setup>
import { inject } from "vue";
import { TOTAL_PROPOSTA_STEPS } from "@/composables/usePropostaForm";

const emit = defineEmits(["submit"]);

const {
  currentPage,
  loading,
  validarPaginaAtual,
  nextPage,
  prevPage,
} = inject("propostaForm");

const totalSteps = TOTAL_PROPOSTA_STEPS;

function onSubmit() {
  emit("submit");
}
</script>
