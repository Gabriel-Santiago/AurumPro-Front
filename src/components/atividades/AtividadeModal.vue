<template>
  <BaseModal
    v-if="modal.visible"
    title="Nova Atividade"
    variant="dialog"
    @close="fecharModalNovaAtividade"
  >
    <div class="mb-5 flex flex-col gap-2">
      <label for="nomeAtividade" class="label-field">Nome da Atividade *</label>
      <input
        id="nomeAtividade"
        v-model="modal.nome"
        type="text"
        class="input-field"
        placeholder="Digite o nome da atividade"
        @keyup.enter="criarAtividade"
      />
    </div>

    <div class="form-actions">
      <button class="btn-cancel" type="button" @click="fecharModalNovaAtividade">
        Cancelar
      </button>
      <button
        class="btn-aurum"
        type="button"
        :disabled="!modal.nome.trim()"
        @click="criarAtividade"
      >
        Criar Atividade
      </button>
    </div>
  </BaseModal>
</template>

<script setup>
import { inject } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";

const {
  modalNovaAtividade: modal,
  fecharModalNovaAtividade,
  criarAtividade,
} = inject("atividadesPage");
</script>
