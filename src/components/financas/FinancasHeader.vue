<template>
  <div class="financas-header">
    <div class="header-left">
      <button class="btn-voltar" type="button" title="Voltar" @click="$emit('voltar')">
        ← Voltar
      </button>
      <div class="header-content">
        <h1>💰 Dashboard Financeiro</h1>
        <p class="subtitle">Acompanhe todas as suas propostas e valores</p>
      </div>
    </div>

    <div class="header-actions">
      <button
        class="icon-btn theme-toggle"
        type="button"
        :title="theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'"
        @click="$emit('toggleTheme')"
      >
        {{ theme === 'dark' ? '☀️' : '🌙' }}
      </button>
      <button
        class="btn-refresh"
        type="button"
        :disabled="loading"
        @click="$emit('refresh')"
      >
        🔄 Atualizar
      </button>
      <div v-if="!loading && ultimaAtualizacao" class="data-info">
        <span class="data-label">Última atualização:</span>
        <span class="data-value">{{ ultimaAtualizacao }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  theme: { type: String, required: true },
  loading: { type: Boolean, default: false },
  ultimaAtualizacao: { type: String, default: "" },
});

defineEmits(["voltar", "toggleTheme", "refresh"]);
</script>
