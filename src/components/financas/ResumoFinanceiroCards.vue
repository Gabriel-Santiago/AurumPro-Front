<template>
  <div class="cards-container">
    <div class="resumo-card total">
      <div class="card-icon"><span>📋</span></div>
      <div class="card-content">
        <h3>Total de Propostas</h3>
        <p class="card-value">{{ dashboard.totalPropostas || 0 }}</p>
        <div class="card-detalhes">
          <span class="detalhe-item">Em avaliação: {{ dashboard.propostasEmAvaliacao || 0 }}</span>
          <span class="detalhe-item">Expiradas: {{ dashboard.propostasExpiradas || 0 }}</span>
        </div>
      </div>
    </div>

    <div class="resumo-card em-aberto">
      <div class="card-icon"><span>⏳</span></div>
      <div class="card-content">
        <h3>A Receber</h3>
        <p class="card-value">R$ {{ formatarValor(dashboard.valorEmAvaliacao) }}</p>
        <div class="card-detalhes">
          <span class="detalhe-item">{{ dashboard.emAvaliacao?.length || 0 }} propostas</span>
          <span class="detalhe-item status-badge em-avaliacao">EM AVALIAÇÃO</span>
        </div>
      </div>
    </div>

    <div class="resumo-card recebido">
      <div class="card-icon"><span>✅</span></div>
      <div class="card-content">
        <h3>Recebido</h3>
        <p class="card-value">R$ {{ formatarValor(dashboard.valorRecebido) }}</p>
        <div class="card-detalhes">
          <span class="detalhe-item">{{ dashboard.propostasAceitas || 0 }} propostas</span>
          <span class="detalhe-item status-badge aceita">ACEITAS</span>
        </div>
      </div>
    </div>

    <div class="resumo-card taxa">
      <div class="card-icon"><span>📊</span></div>
      <div class="card-content">
        <h3>Taxa de Aceitação</h3>
        <p class="card-value">{{ formatarTaxaAceitacao(dashboard.taxaAceitacao) }}%</p>
        <div class="card-detalhes">
          <span class="detalhe-item">
            {{ dashboard.propostasAceitas || 0 }} de {{ dashboard.totalPropostas || 0 }}
          </span>
          <span class="detalhe-item status-badge info">DESEMPENHO</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";
import { formatarValor } from "@/utils/formatters";

const { dashboard, formatarTaxaAceitacao } = inject("financasDashboard");
</script>
