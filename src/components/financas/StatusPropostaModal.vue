<template>
  <BaseModal
    v-if="modal.visible"
    variant="dialog"
    @close="fecharModalMudancaStatus"
  >
    <div class="text-center">
      <div
        class="mb-3 text-4xl"
        :class="{
          'text-[#4ade80]': getClasseIconeModal(modal.novoStatus) === 'success',
          'text-danger': getClasseIconeModal(modal.novoStatus) === 'error',
          'text-[#fbbf24]': getClasseIconeModal(modal.novoStatus) === 'warning',
        }"
        aria-hidden="true"
      >
        {{ getIconeModal(modal.novoStatus) }}
      </div>
      <h3 class="mb-3 text-xl font-semibold">Confirmar Mudança de Status</h3>
      <p class="mb-3 leading-relaxed">
        Tem certeza que deseja marcar a proposta de
        <strong>{{ modal.proposta?.nomeCliente }}</strong>
        como <strong>{{ formatarStatus(modal.novoStatus) }}</strong>?
      </p>
      <p class="mb-3 font-semibold">
        Valor: R$ {{ formatarValor(modal.proposta?.valorTotal) }}
      </p>

      <div class="form-actions mt-5 justify-center">
        <button class="btn-cancel" type="button" @click="fecharModalMudancaStatus">
          Cancelar
        </button>
        <button
          type="button"
          :class="getClasseBotaoModal(modal.novoStatus)"
          @click="atualizarStatusProposta"
        >
          {{ getTextoBotaoModal(modal.novoStatus) }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { inject } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import { formatarValor, formatarStatus } from "@/utils/formatters";

const {
  modalMudancaStatus: modal,
  fecharModalMudancaStatus,
  atualizarStatusProposta,
  getIconeModal,
  getClasseIconeModal,
  getTextoBotaoModal,
  getClasseBotaoModal,
} = inject("financasDashboard");
</script>
