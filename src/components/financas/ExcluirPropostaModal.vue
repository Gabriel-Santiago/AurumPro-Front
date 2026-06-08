<template>
  <BaseModal
    v-if="modal.visible"
    variant="dialog"
    @close="cancelarExclusao"
  >
    <div class="text-center">
      <div class="mb-3 text-4xl" aria-hidden="true">⚠️</div>
      <h3 class="mb-3 text-xl font-semibold">Confirmar Exclusão</h3>
      <p class="mb-3 leading-relaxed">
        Tem certeza que deseja excluir a proposta de
        <strong>{{ modal.proposta?.nomeCliente }}</strong>?
      </p>
      <p class="mb-3 font-semibold">
        Valor: R$ {{ formatarValor(modal.proposta?.valorTotal) }}
      </p>
      <p class="text-sm opacity-70">Esta ação não pode ser desfeita.</p>

      <div class="form-actions mt-5 justify-center">
        <button class="btn-cancel" type="button" @click="cancelarExclusao">Cancelar</button>
        <button class="btn-danger" type="button" @click="excluirProposta">Excluir</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { inject } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import { formatarValor } from "@/utils/formatters";

const { modalExclusao: modal, cancelarExclusao, excluirProposta } = inject("financasDashboard");
</script>
