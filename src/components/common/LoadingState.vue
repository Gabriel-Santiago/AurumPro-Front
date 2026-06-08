<template>
  <div
    class="flex flex-col items-center justify-center gap-4 px-4 py-12"
    role="status"
    aria-live="polite"
    :aria-label="message"
  >
    <div
      class="h-10 w-10 animate-spin rounded-full border-4 border-transparent border-t-aurum"
      aria-hidden="true"
    />
    <p class="text-sm" :class="isDark ? 'text-aurum' : 'text-text-muted'">
      {{ message }}
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useThemeStore } from "@/stores/themeStore";

defineProps({
  message: { type: String, default: "Carregando..." },
});

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);
</script>
