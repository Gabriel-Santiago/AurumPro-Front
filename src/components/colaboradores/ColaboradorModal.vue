<template>
  <BaseModal
    title="Gerenciar Colaboradores"
    variant="fullscreen"
    size="lg"
    modal-class="modal"
    @close="closeModal"
  >
    <div class="modal-content">
      <ColaboradorForm />
      <ColaboradorList />
    </div>

    <template #footer>
      <div class="modal-actions">
        <button type="button" class="btn-cancel" @click="closeModal">Fechar</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { onMounted, provide } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import { useColaboradores } from "@/composables/useColaboradores";
import ColaboradorForm from "./ColaboradorForm.vue";
import ColaboradorList from "./ColaboradorList.vue";

const emit = defineEmits(["close", "created"]);

const colaboradoresState = useColaboradores(emit);
provide("colaboradoresState", colaboradoresState);

const closeModal = () => emit("close");

onMounted(colaboradoresState.inicializar);
</script>
