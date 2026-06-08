<template>
  <BaseModal
    title="Gerenciar Sub Serviços"
    variant="fullscreen"
    size="lg"
    modal-class="modal"
    @close="closeModal"
  >
    <div class="modal-content">
      <SubServicoForm />
      <SubServicoList />
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
import { useSubservicos } from "@/composables/useSubservicos";
import SubServicoForm from "./SubServicoForm.vue";
import SubServicoList from "./SubServicoList.vue";

const emit = defineEmits(["close", "created"]);

const subservicosState = useSubservicos(emit);
provide("subservicosState", subservicosState);

const closeModal = () => emit("close");

onMounted(subservicosState.inicializar);
</script>
