<template>
  <div class="proposta-card" :class="variant" @click="$emit('detalhes', proposta)">
    <div class="proposta-header">
      <div class="cliente-info">
        <h4>{{ proposta.nomeCliente }}</h4>
        <div class="proposta-metadata">
          <slot name="metadata" />
        </div>
      </div>

      <div class="proposta-valor">
        <span class="valor-label">{{ valorLabel }}</span>
        <span class="valor">R$ {{ formatarValor(proposta.valorTotal) }}</span>
      </div>
    </div>

    <div class="proposta-actions">
      <div class="actions-group">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatarValor } from "@/utils/formatters";

defineProps({
  proposta: { type: Object, required: true },
  variant: { type: String, default: "" },
  valorLabel: { type: String, default: "Valor:" },
});

defineEmits(["detalhes"]);
</script>
