<template>
  <BaseModal
    variant="fullscreen"
    size="xl"
    modal-class="modal documento-modal"
    no-body-padding
    @close="$emit('close')"
  >
    <template #header>
      <div class="modal-header">
        <div class="header-content">
          <h3>📄 Documento da Proposta</h3>
          <div class="proposta-info">
            <span class="proposta-numero">ID: {{ proposta.id }}</span>
            <span class="proposta-data">{{ formatarData(proposta.dataCriacao) }}</span>
          </div>
        </div>
      </div>
    </template>

    <div class="modal-content-wrapper">
      <div class="modal-content-container">
        <DocumentoInfoRapida />
        <DocumentoPreview />
      </div>
    </div>

    <template #footer>
      <DocumentoActions @close="$emit('close')" />
    </template>
  </BaseModal>
</template>

<script setup>
import { onMounted, provide } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import { useDocumento } from "@/composables/useDocumento";
import { formatarData } from "@/utils/formatters";
import DocumentoInfoRapida from "./DocumentoInfoRapida.vue";
import DocumentoPreview from "./DocumentoPreview.vue";
import DocumentoActions from "./DocumentoActions.vue";

const props = defineProps({
  proposta: { type: Object, required: true },
});

defineEmits(["close"]);

const documentoState = useDocumento(props.proposta);
provide("documentoState", documentoState);

const { carregarDados } = documentoState;

onMounted(() => {
  carregarDados();
});
</script>
