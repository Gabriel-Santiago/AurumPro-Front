<template>
  <div class="financas-container" :class="theme">
    <FinancasHeader
      :theme="theme"
      :loading="loading"
      :ultima-atualizacao="ultimaAtualizacao"
      @toggle-theme="themeStore.toggleTheme()"
      @refresh="carregarDashboard"
    />

    <LoadingState v-if="loading" message="Carregando dashboard..." />

    <ErrorState
      v-else-if="erro"
      :message="erro"
      @retry="carregarDashboard"
    />

    <div v-else class="main-content">
      <ResumoFinanceiroCards />
      <PropostasFinanceirasList />

      <div class="page-bottom-actions">
        <button class="btn-voltar" type="button" @click="voltar">
          ← Voltar
        </button>
      </div>
    </div>

    <DetalhesPropostaModal />
    <ExcluirPropostaModal />
    <StatusPropostaModal />
  </div>
</template>

<script setup>
import { computed, onMounted, provide } from "vue";
import { useRouter } from "vue-router";
import { useThemeStore } from "@/stores/themeStore";
import { useFinancasDashboard } from "@/composables/useFinancasDashboard";
import FinancasHeader from "@/components/financas/FinancasHeader.vue";
import ResumoFinanceiroCards from "@/components/financas/ResumoFinanceiroCards.vue";
import PropostasFinanceirasList from "@/components/financas/PropostasFinanceirasList.vue";
import DetalhesPropostaModal from "@/components/financas/DetalhesPropostaModal.vue";
import ExcluirPropostaModal from "@/components/financas/ExcluirPropostaModal.vue";
import StatusPropostaModal from "@/components/financas/StatusPropostaModal.vue";
import LoadingState from "@/components/common/LoadingState.vue";
import ErrorState from "@/components/common/ErrorState.vue";

const themeStore = useThemeStore();
const theme = computed(() => themeStore.theme);
const router = useRouter();

const financasDashboard = useFinancasDashboard();
provide("financasDashboard", financasDashboard);

const { loading, erro, ultimaAtualizacao, carregarDashboard } = financasDashboard;

const voltar = () => router.push("/clientes");

onMounted(carregarDashboard);
</script>
