<template>
  <nav
    v-if="totalPages > 1"
    class="mt-5 flex flex-col items-center gap-3 py-4"
    aria-label="Paginação"
  >
    <p class="m-0 text-sm" :class="isDark ? 'text-aurum' : 'text-text-muted'">
      Exibindo {{ rangeStart }}–{{ rangeEnd }} de {{ totalItems }}
    </p>

    <div class="flex w-full flex-wrap items-center justify-center gap-3 max-[480px]:w-full">
      <button
        type="button"
        class="rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 max-[480px]:flex-1"
        :class="isDark
          ? 'border-border-dark bg-surface-card-dark text-aurum hover:border-[#555] hover:bg-border-dark-soft'
          : 'border-border-muted bg-surface-light text-text-body hover:border-[#ccc] hover:bg-surface-hover-light'"
        :disabled="page <= 1"
        aria-label="Página anterior"
        @click="$emit('prev')"
      >
        ← Anterior
      </button>

      <span
        class="min-w-16 text-center text-sm font-semibold"
        :class="isDark ? 'text-aurum' : 'text-text-muted'"
        aria-current="page"
      >
        {{ page }} / {{ totalPages }}
      </span>

      <button
        type="button"
        class="rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 max-[480px]:flex-1"
        :class="isDark
          ? 'border-border-dark bg-surface-card-dark text-aurum hover:border-[#555] hover:bg-border-dark-soft'
          : 'border-border-muted bg-surface-light text-text-body hover:border-[#ccc] hover:bg-surface-hover-light'"
        :disabled="page >= totalPages"
        aria-label="Próxima página"
        @click="$emit('next')"
      >
        Próxima →
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useThemeStore } from "@/stores/themeStore";

defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  rangeStart: { type: Number, required: true },
  rangeEnd: { type: Number, required: true },
  totalItems: { type: Number, required: true },
});

defineEmits(["prev", "next"]);

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);
</script>
