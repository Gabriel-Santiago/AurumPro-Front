<template>
  <div class="tabs-container">
    <div class="tabs-header">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="tab-button"
        :class="{ active: tabAtiva === tab.id }"
        @click="tabAtiva = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-text">{{ tab.text }}</span>
        <span class="tab-badge">{{ getContadorTab(tab.id) }}</span>
      </button>
    </div>

    <div class="tabs-content">
      <div v-if="tabAtiva === 'avaliacao'" class="tab-pane">
        <div class="tab-header">
          <h3>⏳ Propostas em Avaliação</h3>
          <p class="tab-subtitle">Total: R$ {{ formatarValor(dashboard.valorEmAvaliacao) }}</p>
        </div>

        <div class="propostas-grid">
          <PropostaFinanceiraCard
            v-for="proposta in dashboard.emAvaliacao || []"
            :key="proposta.id"
            :proposta="proposta"
            @detalhes="abrirDetalhesProposta"
          >
            <template #metadata>
              <span class="metadata-item">
                <span class="metadata-icon">📅</span>
                <span class="metadata-text">Criada: {{ formatarData(proposta.dataCriacao) }}</span>
              </span>
              <span class="metadata-item" :class="getClasseValidade(proposta.dataValidade)">
                <span class="metadata-icon">⏰</span>
                <span class="metadata-text">
                  Validade: {{ formatarData(proposta.dataValidade) }}
                  <span class="dias-restantes">({{ calcularDiasRestantes(proposta.dataValidade) }})</span>
                </span>
              </span>
            </template>
            <template #actions>
              <button
                type="button"
                class="btn-action btn-success"
                title="Marcar como aceita"
                @click.stop="abrirModalMudancaStatus(proposta, 'ACEITA')"
              >
                ✅ Aceito
              </button>
              <button
                type="button"
                class="btn-action btn-danger"
                title="Marcar como recusada"
                @click.stop="abrirModalMudancaStatus(proposta, 'RECUSADA')"
              >
                ❌ Recusada
              </button>
              <button
                type="button"
                class="btn-action btn-delete"
                title="Excluir proposta"
                @click.stop="confirmarExclusao(proposta)"
              >
                🗑️ Excluir
              </button>
            </template>
          </PropostaFinanceiraCard>

          <div v-if="!dashboard.emAvaliacao?.length" class="sem-propostas">
            <div class="empty-state">
              <span class="empty-icon">📭</span>
              <h4>Nenhuma proposta em avaliação</h4>
              <p>Todas as propostas foram processadas ou não há propostas criadas.</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tabAtiva === 'aceitas'" class="tab-pane">
        <div class="tab-header">
          <h3>✅ Propostas Aceitas</h3>
          <p class="tab-subtitle">Total recebido: R$ {{ formatarValor(dashboard.valorRecebido) }}</p>
        </div>

        <div class="propostas-grid">
          <PropostaFinanceiraCard
            v-for="proposta in dashboard.aceita || []"
            :key="proposta.id"
            :proposta="proposta"
            variant="aceita"
            valor-label="Valor recebido:"
            @detalhes="abrirDetalhesProposta"
          >
            <template #metadata>
              <span class="metadata-item">
                <span class="metadata-icon">✅</span>
                <span class="metadata-text">Status: Aceita</span>
              </span>
              <span class="metadata-item">
                <span class="metadata-icon">📅</span>
                <span class="metadata-text">Aceita em: {{ formatarData(proposta.dataMudancaStatus) }}</span>
              </span>
            </template>
            <template #actions>
              <button
                type="button"
                class="btn-action btn-delete"
                title="Excluir proposta"
                @click.stop="confirmarExclusao(proposta)"
              >
                🗑️ Excluir
              </button>
            </template>
          </PropostaFinanceiraCard>

          <div v-if="!dashboard.aceita?.length" class="sem-propostas">
            <div class="empty-state">
              <span class="empty-icon">🎉</span>
              <h4>Nenhuma proposta aceita ainda</h4>
              <p>Quando suas propostas forem aceitas, elas aparecerão aqui.</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tabAtiva === 'recusadas'" class="tab-pane">
        <div class="tab-header">
          <h3>❌ Propostas Recusadas</h3>
          <p class="tab-subtitle">{{ dashboard.propostasRecusadas || 0 }} propostas</p>
        </div>

        <div class="propostas-grid">
          <PropostaFinanceiraCard
            v-for="proposta in dashboard.recusada || []"
            :key="proposta.id"
            :proposta="proposta"
            variant="recusada"
            @detalhes="abrirDetalhesProposta"
          >
            <template #metadata>
              <span class="metadata-item">
                <span class="metadata-icon">❌</span>
                <span class="metadata-text">Status: Recusada</span>
              </span>
              <span class="metadata-item">
                <span class="metadata-icon">📅</span>
                <span class="metadata-text">Recusada em: {{ formatarData(proposta.dataMudancaStatus) }}</span>
              </span>
            </template>
            <template #actions>
              <button
                type="button"
                class="btn-action btn-delete"
                title="Excluir proposta"
                @click.stop="confirmarExclusao(proposta)"
              >
                🗑️ Excluir
              </button>
            </template>
          </PropostaFinanceiraCard>

          <div v-if="!dashboard.recusada?.length" class="sem-propostas">
            <div class="empty-state">
              <span class="empty-icon">👍</span>
              <h4>Nenhuma proposta recusada</h4>
              <p>Ótimo! Isso significa que todas as suas propostas foram aceitas ou estão em avaliação.</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tabAtiva === 'expiradas'" class="tab-pane">
        <div class="tab-header">
          <h3>⌛ Propostas Expiradas</h3>
          <p class="tab-subtitle">{{ dashboard.propostasExpiradas || 0 }} propostas</p>
        </div>

        <div class="propostas-grid">
          <PropostaFinanceiraCard
            v-for="proposta in dashboard.expirada || []"
            :key="proposta.id"
            :proposta="proposta"
            variant="expirada"
            valor-label="Valor perdido:"
            @detalhes="abrirDetalhesProposta"
          >
            <template #metadata>
              <span class="metadata-item">
                <span class="metadata-icon">⌛</span>
                <span class="metadata-text">Status: Expirada</span>
              </span>
              <span class="metadata-item">
                <span class="metadata-icon">📅</span>
                <span class="metadata-text">Criada: {{ formatarData(proposta.dataCriacao) }}</span>
              </span>
              <span class="metadata-item expirada">
                <span class="metadata-icon">⏰</span>
                <span class="metadata-text">
                  Expirou há {{ calcularDiasExpiracao(proposta.dataValidade) }} dias
                </span>
              </span>
            </template>
            <template #actions>
              <button
                type="button"
                class="btn-action btn-delete"
                title="Excluir proposta"
                @click.stop="confirmarExclusao(proposta)"
              >
                🗑️ Excluir
              </button>
            </template>
          </PropostaFinanceiraCard>

          <div v-if="!dashboard.expirada?.length" class="sem-propostas">
            <div class="empty-state">
              <span class="empty-icon">🚀</span>
              <h4>Nenhuma proposta expirada</h4>
              <p>Excelente! Você está gerenciando bem os prazos das suas propostas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";
import { FINANCAS_TABS } from "@/composables/useFinancasDashboard";
import {
  formatarValor,
  formatarData,
  calcularDiasRestantes,
  calcularDiasExpiracao,
  getClasseValidade,
} from "@/utils/formatters";
import PropostaFinanceiraCard from "./PropostaFinanceiraCard.vue";

const {
  dashboard,
  tabAtiva,
  getContadorTab,
  abrirDetalhesProposta,
  abrirModalMudancaStatus,
  confirmarExclusao,
} = inject("financasDashboard");

const tabs = FINANCAS_TABS;
</script>
