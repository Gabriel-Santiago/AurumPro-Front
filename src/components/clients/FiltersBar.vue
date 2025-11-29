<template>
  <div class="filters" :class="theme">
    <div class="group">
      <label>Tipo</label>
      <select :value="tipo" @change="$emit('changeTipo', $event.target.value)">
        <option value="PF">PF</option>
        <option value="PJ">PJ</option>
      </select>
    </div>

    <div class="group">
      <label>Estado</label>
      <select :value="estado" @change="$emit('changeEstado', $event.target.value)">
        <option v-for="uf in ufList" :key="uf" :value="uf">{{ uf }}</option>
      </select>
    </div>

    <div class="actions">
      <button class="clear" @click="$emit('limpar')">Limpar filtros</button>
      <button class="primary" @click="$emit('abrirCriar')">Criar Cliente</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useThemeStore } from '../../store/themeStore';

defineProps({
  ufList: { type: Array, default: () => [] },
  tipo: { type: String, default: "" },
  estado: { type: String, default: "" }
});

const themeStore = useThemeStore();
const theme = computed(() => themeStore.theme);
</script>

<style scoped>
.filters {
  display:flex;
  gap:12px;
  align-items:end;
  padding:12px;
  border-radius:8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  transition: all 0.3s ease;
}

/* Modo Claro */
.filters.light {
  background: #fff;
  border: 1px solid #f0f0f0;
}

/* Modo Escuro */
.filters.dark {
  background: #1a1a1a;
  border: 1px solid #333;
}

.group { 
  display:flex; 
  flex-direction:column; 
  gap:6px; 
}

label {
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

/* Modo Claro */
.filters.light label {
  color: #333;
}

/* Modo Escuro */
.filters.dark label {
  color: #daa520;
}

select { 
  padding:8px 10px; 
  border-radius:6px; 
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

/* Modo Claro */
.filters.light select {
  border: 1px solid #e6e6e6;
  background: #fff;
  color: #333;
}

.filters.light select:focus {
  border-color: #daa520;
  outline: none;
}

/* Modo Escuro */
.filters.dark select {
  border: 1px solid #444;
  background: #2a2a2a;
  color: #daa520;
}

.filters.dark select:focus {
  border-color: #daa520;
  outline: none;
}

.filters.dark select option {
  background: #2a2a2a;
  color: #daa520;
}

.actions {
  margin-left:auto;
  display:flex;
  gap:8px;
}

.clear, .primary {
  padding:8px 12px;
  border-radius:6px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* Botão Limpar */
.filters.light .clear {
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
}

.filters.light .clear:hover {
  background: #f8f9fa;
  border-color: #ccc;
}

.filters.dark .clear {
  background: transparent;
  border: 1px solid #444;
  color: #daa520;
}

.filters.dark .clear:hover {
  background: #333;
  border-color: #555;
}

/* Botão Primary */
.filters.light .primary {
  background: #111;
  color: #fff;
}

.filters.light .primary:hover {
  background: #333;
}

.filters.dark .primary {
  background: #daa520;
  color: #111;
}

.filters.dark .primary:hover {
  background: #e6b800;
  box-shadow: 0 2px 8px rgba(218, 165, 32, 0.3);
}
</style>