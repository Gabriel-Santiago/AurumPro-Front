<template>
  <BaseModal
    v-if="visible"
    variant="fullscreen"
    size="lg"
    modal-class="modal proposta-modal"
    no-body-padding
    @close="handleClose"
  >
    <template #header>
      <div class="modal-header">
        <h3>Criar Proposta - Passo {{ currentPage }} de {{ totalSteps }}</h3>
      </div>
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${(currentPage / totalSteps) * 100}%` }" />
        <div class="steps">
          <span
            v-for="step in totalSteps"
            :key="step"
            :class="{ active: currentPage >= step }"
          >
            {{ step }}
          </span>
        </div>
      </div>
    </template>

    <div class="modal-content">
      <PropostaItensForm v-if="currentPage === 1" />
      <PropostaForm v-else-if="currentPage === 2 || currentPage === 5 || currentPage === 6" :step="currentPage" />
      <PropostaCustosForm v-else-if="currentPage === 3 || currentPage === 4" :step="currentPage" />
      <PropostaResumo v-else-if="currentPage === 7" :cliente="cliente" />
    </div>

    <template #footer>
      <PropostaActions @submit="handleSubmit" />
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, provide, onMounted } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import {
  usePropostaForm,
  TOTAL_PROPOSTA_STEPS,
} from "@/composables/usePropostaForm";
import PropostaItensForm from "./PropostaItensForm.vue";
import PropostaForm from "./PropostaForm.vue";
import PropostaCustosForm from "./PropostaCustosForm.vue";
import PropostaResumo from "./PropostaResumo.vue";
import PropostaActions from "./PropostaActions.vue";

const props = defineProps({
  cliente: { type: Object, required: true },
});

const emit = defineEmits(["close", "created"]);

const visible = ref(true);
const totalSteps = TOTAL_PROPOSTA_STEPS;

const propostaForm = usePropostaForm(props.cliente, emit);
provide("propostaForm", propostaForm);

const { currentPage, carregarDados, submitProposta } = propostaForm;

function handleClose() {
  visible.value = false;
  setTimeout(() => {
    emit("close");
  }, 300);
}

async function handleSubmit() {
  const sucesso = await submitProposta();
  if (sucesso) {
    handleClose();
  }
}

onMounted(carregarDados);
</script>
