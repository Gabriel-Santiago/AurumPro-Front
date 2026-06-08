<template>
  <BaseModal
    v-if="modal.visible"
    variant="dialog"
    @close="cancelarExclusaoAtividade"
  >
    <div class="text-center">
      <div class="mb-3 text-4xl" aria-hidden="true">⚠️</div>
      <h3 class="mb-3 text-xl font-semibold">Confirmar Exclusão</h3>
      <p class="mb-3 leading-relaxed">
        Tem certeza que deseja excluir a atividade
        <strong>"{{ modal.atividade?.nome }}"</strong>?
      </p>
      <p class="text-sm opacity-70">Esta ação não pode ser desfeita.</p>

      <div class="form-actions mt-5 justify-center">
        <button class="btn-cancel" type="button" @click="cancelarExclusaoAtividade">
          Cancelar
        </button>
        <button class="btn-danger" type="button" @click="excluirAtividade">Excluir</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { inject } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";

const {
  modalExclusaoAtividade: modal,
  cancelarExclusaoAtividade,
  excluirAtividade,
} = inject("atividadesPage");
</script>
