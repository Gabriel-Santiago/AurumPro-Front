<template>
  <div class="proposta-card">
    <div class="proposta-header" @click="alternarAtividades(proposta.id)">
      <div class="proposta-info">
        <h3>{{ proposta.nomeCliente || `Proposta #${proposta.id}` }}</h3>
        <div class="proposta-metadata">
          <span class="metadata-item">
            <span class="metadata-icon">📅</span>
            <span class="metadata-text">
              Aprovada em: {{ formatarData(proposta.dataMudancaStatus) }}
            </span>
          </span>
        </div>
      </div>

      <div class="proposta-actions">
        <button
          type="button"
          class="btn-action btn-add"
          title="Adicionar atividade"
          @click.stop="abrirModalNovaAtividade(proposta.id)"
        >
          ➕ Adicionar Atividade
        </button>
        <span class="expand-icon" :class="{ expanded: propostaExpandida === proposta.id }">
          {{ propostaExpandida === proposta.id ? '▼' : '▶' }}
        </span>
      </div>
    </div>

    <div v-if="propostaExpandida === proposta.id" class="atividades-lista">
      <div v-if="carregandoAtividades[proposta.id]" class="loading-atividades">
        <div class="spinner-small"></div>
        <span>Carregando atividades...</span>
      </div>

      <div v-else-if="atividadesPorProposta[proposta.id]?.length">
        <div class="atividades-header-list">
          <h4>📝 Lista de Atividades</h4>
          <span class="contador-atividades">
            {{ getContadorConcluidas(proposta.id) }}/{{ atividadesPorProposta[proposta.id]?.length }} concluídas
          </span>
        </div>

        <div class="checklist-container">
          <div
            v-for="atividade in atividadesPorProposta[proposta.id]"
            :key="atividade.id"
            class="checklist-item"
          >
            <label class="checkbox-label">
              <input
                type="checkbox"
                class="checkbox-input"
                :checked="atividade.concluida"
                @change="alternarStatusAtividade(atividade)"
              />
              <span class="checkmark"></span>
              <span class="atividade-nome" :class="{ concluida: atividade.concluida }">
                {{ atividade.nome }}
              </span>
            </label>
            <button
              type="button"
              class="btn-delete-atividade"
              title="Excluir atividade"
              @click="confirmarExclusaoAtividade(atividade)"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <div v-else class="sem-atividades">
        <div class="empty-state">
          <span class="empty-icon">📝</span>
          <h4>Nenhuma atividade cadastrada</h4>
          <p>Clique em "Adicionar Atividade" para criar a primeira atividade desta proposta.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";
import { formatarData } from "@/utils/formatters";

defineProps({
  proposta: { type: Object, required: true },
});

const {
  atividadesPorProposta,
  carregandoAtividades,
  propostaExpandida,
  alternarAtividades,
  abrirModalNovaAtividade,
  getContadorConcluidas,
  alternarStatusAtividade,
  confirmarExclusaoAtividade,
} = inject("atividadesPage");
</script>
