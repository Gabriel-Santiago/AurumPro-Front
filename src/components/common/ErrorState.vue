<template>
  <div class="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center" role="alert">
    <div class="text-3xl" aria-hidden="true">❌</div>
    <h3 class="m-0 text-xl font-semibold" :class="isDark ? 'text-aurum' : 'text-text-body'">
      {{ title }}
    </h3>
    <p class="m-0 max-w-lg leading-relaxed" :class="isDark ? 'text-aurum' : 'text-text-muted'">
      {{ message }}
    </p>
    <button
      v-if="showRetry"
      type="button"
      class="btn-aurum mt-2 !text-surface-dark"
      @click="$emit('retry')"
    >
      {{ retryLabel }}
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useThemeStore } from "@/stores/themeStore";

defineProps({
  title: { type: String, default: "Erro ao carregar dados" },
  message: { type: String, required: true },
  showRetry: { type: Boolean, default: true },
  retryLabel: { type: String, default: "Tentar novamente" },
});

defineEmits(["retry"]);

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);
</script>
