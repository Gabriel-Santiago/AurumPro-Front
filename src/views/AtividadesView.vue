<template>
  <div class="atividades-container" :class="theme">
    <AtividadesHeader
      :theme="theme"
      :loading="loading"
      :ultima-atualizacao="ultimaAtualizacao"
      @voltar="voltar"
      @toggle-theme="themeStore.toggleTheme()"
      @refresh="carregarPropostasAceitas"
    />

    <LoadingState v-if="loading" message="Carregando propostas aceitas..." />

    <ErrorState
      v-else-if="erro"
      :message="erro"
      @retry="carregarPropostasAceitas"
    />

    <div v-else class="main-content">
      <div v-if="propostasAceitas.length" class="propostas-grid">
        <AtividadeCard
          v-for="proposta in propostasAceitas"
          :key="proposta.id"
          :proposta="proposta"
        />
      </div>

      <EmptyState
        v-else
        icon="🎉"
        title="Nenhuma proposta aceita"
        description="Quando suas propostas forem aceitas, elas aparecerão aqui para gerenciamento de atividades."
      />
    </div>

    <AtividadeModal />
    <ExcluirAtividadeModal />
  </div>
</template>

<script setup>
import { computed, onMounted, provide } from "vue";
import { useRouter } from "vue-router";
import { useThemeStore } from "@/stores/themeStore";
import { useAtividadesPage } from "@/composables/useAtividadesPage";
import AtividadesHeader from "@/components/atividades/AtividadesHeader.vue";
import AtividadeCard from "@/components/atividades/AtividadeCard.vue";
import AtividadeModal from "@/components/atividades/AtividadeModal.vue";
import ExcluirAtividadeModal from "@/components/atividades/ExcluirAtividadeModal.vue";
import LoadingState from "@/components/common/LoadingState.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import ErrorState from "@/components/common/ErrorState.vue";

const themeStore = useThemeStore();
const theme = computed(() => themeStore.theme);
const router = useRouter();

const atividadesPage = useAtividadesPage();
provide("atividadesPage", atividadesPage);

const { propostasAceitas, loading, erro, ultimaAtualizacao, carregarPropostasAceitas } =
  atividadesPage;

const voltar = () => router.push("/clientes");

onMounted(carregarPropostasAceitas);
</script>
