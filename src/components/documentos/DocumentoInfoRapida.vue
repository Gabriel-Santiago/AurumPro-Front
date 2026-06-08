<template>
  <div v-if="documento && !loading" class="info-rapida">
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Cliente:</span>
        <span class="info-value">{{ documento.cliente?.nome || 'Não informado' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Empresa:</span>
        <span class="info-value">{{ documento.empresa?.nome || 'Não informado' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Valor Total:</span>
        <span class="info-value valor-total">R$ {{ formatarValor(documento.valorTotal) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Consultor:</span>
        <span class="info-value">{{ consultorNome }}</span>
      </div>
    </div>

    <div v-if="!documento.colaborador" class="aviso-sem-colaborador">
      <span class="aviso-icon">ℹ️</span>
      <span>Usando responsável da empresa como consultor</span>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";

const { documento, loading, consultorNome, formatarValor } = inject("documentoState");
</script>
