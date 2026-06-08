<template>
  <div class="modal-actions">
    <div class="actions-container">
      <div class="download-section">
        <span class="download-label">Baixar documento:</span>
        <button
          class="btn-download"
          type="button"
          :disabled="loading || !documento"
          @click="baixarDocumento"
        >
          <span class="download-icon">📥</span>
          <span>Baixar DOCX</span>
        </button>
        <div v-if="!documento" class="aviso-download">
          <span class="aviso-text">⚠️ Dados insuficientes para download</span>
        </div>
      </div>
      <button class="btn-close" type="button" :disabled="loading" @click="$emit('close')">
        Fechar
      </button>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";

defineEmits(["close"]);

const { documento, loading, baixarDocumento } = inject("documentoState");
</script>
