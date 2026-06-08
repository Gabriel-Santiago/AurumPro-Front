<template>
  <header
    class="sticky top-0 z-50 border-b px-4 py-3 shadow-sm transition-colors"
    :class="isDark
      ? 'border-border-dark-soft bg-surface-dark'
      : 'border-border-light bg-surface-light'"
  >
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-3">
      <button
        type="button"
        class="min-w-0 truncate text-left text-base font-bold transition-colors sm:text-lg"
        :class="isDark
          ? 'text-aurum hover:text-aurum-light'
          : 'text-text-primary hover:text-text-body'"
        @click="navegar('/clientes')"
      >
        {{ empresaNome }}
      </button>

      <nav class="hidden items-center gap-1 lg:flex">
        <button type="button" class="nav-button" @click="abrirColaboradorModal">Colaborador</button>
        <button type="button" class="nav-button" @click="abrirServicoModal">Serviços</button>
        <button type="button" class="nav-button" @click="abrirSubservicoModal">Sub Serviços</button>
        <button type="button" class="nav-button" @click="abrirConvenioModal">Convênios</button>
        <button type="button" class="nav-button" @click="navegar('/atividades')">Atividades</button>
        <button type="button" class="nav-button" @click="navegar('/financas')">Resumo Financeiro</button>
        <button type="button" class="nav-button" @click="themeStore.toggleTheme()">
          {{ isDark ? "☀️ Claro" : "🌙 Escuro" }}
        </button>
        <button type="button" class="nav-button-danger" @click="sair">Sair</button>
      </nav>

      <button
        type="button"
        class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors lg:hidden"
        :class="isDark
          ? 'border-border-dark text-aurum hover:bg-border-dark-soft'
          : 'border-border-muted text-text-body hover:bg-surface-hover-light'"
        aria-label="Abrir menu de navegação"
        :aria-expanded="menuAberto"
        @click="toggleMenu"
      >
        Menu
      </button>
    </div>

    <div
      v-if="menuAberto"
      class="mx-auto mt-3 grid max-w-7xl grid-cols-1 gap-2 border-t pt-3 sm:grid-cols-2 lg:hidden"
      :class="isDark ? 'border-border-dark-soft' : 'border-border-light'"
    >
      <button type="button" class="mobile-nav-button" @click="abrirColaboradorModal">Colaborador</button>
      <button type="button" class="mobile-nav-button" @click="abrirServicoModal">Serviços</button>
      <button type="button" class="mobile-nav-button" @click="abrirSubservicoModal">Sub Serviços</button>
      <button type="button" class="mobile-nav-button" @click="abrirConvenioModal">Convênios</button>
      <button type="button" class="mobile-nav-button" @click="navegar('/atividades')">Atividades</button>
      <button type="button" class="mobile-nav-button" @click="navegar('/financas')">Resumo Financeiro</button>
      <button type="button" class="mobile-nav-button" @click="themeStore.toggleTheme()">Alternar tema</button>
      <button type="button" class="mobile-nav-button-danger" @click="sair">Sair</button>
    </div>

    <ColaboradorModal
      v-if="showColaboradorModal"
      @close="showColaboradorModal = false"
      @created="onRecursoCriado('Colaborador cadastrado com sucesso!')"
    />
    <ServicoModal
      v-if="showServicoModal"
      @close="showServicoModal = false"
      @created="onRecursoCriado('Serviço cadastrado com sucesso!')"
    />
    <SubServicoModal
      v-if="showSubservicoModal"
      @close="showSubservicoModal = false"
      @created="onRecursoCriado('Sub serviço cadastrado com sucesso!')"
    />
    <ConvenioModal
      v-if="showConvenioModal"
      @close="showConvenioModal = false"
      @created="onRecursoCriado('Convênio cadastrado com sucesso!')"
    />
  </header>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import ColaboradorModal from "@/components/colaboradores/ColaboradorModal.vue";
import ServicoModal from "@/components/servicos/ServicoModal.vue";
import SubServicoModal from "@/components/servicos/SubServicoModal.vue";
import ConvenioModal from "@/components/convenios/ConvenioModal.vue";
import { notify } from "@/services/notificationService";

defineProps({
  empresaNome: { type: String, default: "Empresa" },
});

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const isDark = computed(() => themeStore.isDark);
const menuAberto = ref(false);
const showColaboradorModal = ref(false);
const showServicoModal = ref(false);
const showSubservicoModal = ref(false);
const showConvenioModal = ref(false);

function toggleMenu() {
  menuAberto.value = !menuAberto.value;
}

function fecharMenu() {
  menuAberto.value = false;
}

function navegar(path) {
  fecharMenu();
  router.push(path);
}

function abrirColaboradorModal() {
  fecharMenu();
  showColaboradorModal.value = true;
}

function abrirServicoModal() {
  fecharMenu();
  showServicoModal.value = true;
}

function abrirSubservicoModal() {
  fecharMenu();
  showSubservicoModal.value = true;
}

function abrirConvenioModal() {
  fecharMenu();
  showConvenioModal.value = true;
}

function onRecursoCriado(mensagem) {
  notify.success(mensagem);
}

async function sair() {
  fecharMenu();
  await authStore.logout();
  router.push("/");
}
</script>

<style scoped>
@reference "../../style.css";

.nav-button {
  @apply rounded-lg px-3 py-2 text-sm font-medium transition-colors;
  @apply text-text-body hover:bg-surface-hover-light;
}

.dark .nav-button {
  @apply text-aurum hover:bg-border-dark-soft;
}

.nav-button-danger {
  @apply rounded-lg px-3 py-2 text-sm font-medium transition-colors;
  @apply text-danger hover:bg-danger-bg;
}

.dark .nav-button-danger {
  @apply text-danger-soft hover:bg-danger-bg-dark;
}

.mobile-nav-button {
  @apply rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors;
  @apply text-text-body hover:bg-surface-hover-light;
}

.dark .mobile-nav-button {
  @apply text-aurum hover:bg-border-dark-soft;
}

.mobile-nav-button-danger {
  @apply rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors;
  @apply text-danger hover:bg-danger-bg;
}

.dark .mobile-nav-button-danger {
  @apply text-danger-soft hover:bg-danger-bg-dark;
}

@media (max-width: 480px) {
  .mobile-nav-button,
  .mobile-nav-button-danger {
    @apply py-3 text-base;
  }
}
</style>
