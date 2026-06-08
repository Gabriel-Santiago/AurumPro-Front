<template>
  <div
    class="filters grid gap-3 rounded-lg p-3 shadow-sm transition-colors max-[640px]:grid-cols-1 sm:grid-cols-2 lg:flex lg:items-end"
    :class="isDark
      ? 'border border-border-dark-soft bg-surface-card-dark'
      : 'border border-border-faint bg-surface-light'"
  >
    <div class="flex flex-col gap-1.5">
      <label for="filter-tipo" class="label-field">Tipo</label>
      <select
        id="filter-tipo"
        class="input-field"
        :value="tipo"
        @change="$emit('changeTipo', $event.target.value)"
      >
        <option value="PF">PF</option>
        <option value="PJ">PJ</option>
      </select>
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="filter-estado" class="label-field">Estado</label>
      <select
        id="filter-estado"
        class="input-field"
        :value="estado"
        @change="$emit('changeEstado', $event.target.value)"
      >
        <option v-for="uf in ufList" :key="uf" :value="uf">{{ uf }}</option>
      </select>
    </div>

    <div class="flex gap-2 sm:col-span-2 lg:col-span-1 lg:ml-auto max-[640px]:flex-col">
      <button type="button" class="btn-cancel flex-1 lg:flex-none" @click="$emit('limpar')">
        Limpar filtros
      </button>
      <button
        type="button"
        class="flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors lg:flex-none"
        :class="isDark
          ? 'bg-aurum text-surface-dark hover:bg-aurum-light hover:shadow-[0_2px_8px_rgba(218,165,32,0.3)]'
          : 'bg-surface-dark text-white hover:bg-[#333]'"
        @click="$emit('abrirCriar')"
      >
        Criar Cliente
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useThemeStore } from "@/stores/themeStore";

defineProps({
  ufList: { type: Array, default: () => [] },
  tipo: { type: String, default: "" },
  estado: { type: String, default: "" },
});

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);
</script>
