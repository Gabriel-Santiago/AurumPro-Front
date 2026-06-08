<template>
  <div class="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center" role="status">
    <span v-if="icon" class="text-4xl leading-none" aria-hidden="true">{{ icon }}</span>
    <h4
      v-if="title"
      class="m-0 text-lg font-semibold"
      :class="isDark ? 'text-aurum' : 'text-text-body'"
    >
      {{ title }}
    </h4>
    <p
      v-if="description"
      class="m-0 max-w-md text-sm leading-relaxed"
      :class="isDark ? 'text-aurum' : 'text-text-muted'"
    >
      {{ description }}
    </p>
    <slot />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useThemeStore } from "@/stores/themeStore";

defineProps({
  icon: { type: String, default: "" },
  title: { type: String, default: "" },
  description: { type: String, default: "" },
});

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);
</script>
