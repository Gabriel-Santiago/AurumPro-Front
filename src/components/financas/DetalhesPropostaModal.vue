<template>
  <BaseModal
    v-if="modal.visible"
    title="Detalhes da Proposta"
    variant="fullscreen"
    size="lg"
    modal-class="modal-container"
    @close="fecharModalDetalhes"
  >
    <div v-if="modal.proposta" class="modal-content">
      <div class="detalhes-section">
        <div class="detalhes-header">
          <h4>{{ modal.proposta.nomeCliente }}</h4>
          <span class="status-badge" :class="modal.proposta.statusProposta?.toLowerCase()">
            {{ formatarStatus(modal.proposta.statusProposta) }}
          </span>
        </div>

        <div class="detalhes-grid">
          <div class="detalhes-item">
            <span class="label">Valor Total:</span>
            <span class="value valor">R$ {{ formatarValor(modal.proposta.valorTotal) }}</span>
          </div>

          <div
            v-if="['EM_AVALIACAO', 'EXPIRADA'].includes(modal.proposta.statusProposta)"
            class="detalhes-item"
          >
            <span class="label">Data de Criação:</span>
            <span class="value">{{ formatarDataCompleta(modal.proposta.dataCriacao) }}</span>
          </div>

          <template v-if="modal.proposta.statusProposta === 'ACEITA'">
            <div class="detalhes-item">
              <span class="label">Data de criação:</span>
              <span class="value">{{ formatarDataCompleta(modal.proposta.dataCriacao) }}</span>
            </div>
            <div class="detalhes-item">
              <span class="label">Data de deferimento:</span>
              <span class="value success">{{ formatarDataCompleta(modal.proposta.dataMudancaStatus) }}</span>
            </div>
          </template>

          <template v-if="modal.proposta.statusProposta === 'RECUSADA'">
            <div class="detalhes-item">
              <span class="label">Data de criação:</span>
              <span class="value">{{ formatarDataCompleta(modal.proposta.dataCriacao) }}</span>
            </div>
            <div class="detalhes-item">
              <span class="label">Data de indeferimento:</span>
              <span class="value error">{{ formatarDataCompleta(modal.proposta.dataMudancaStatus) }}</span>
            </div>
          </template>

          <template v-if="['EM_AVALIACAO', 'EXPIRADA'].includes(modal.proposta.statusProposta)">
            <div class="detalhes-item">
              <span class="label">Data de Validade:</span>
              <span class="value" :class="getClasseValidade(modal.proposta.dataValidade)">
                {{ formatarDataCompleta(modal.proposta.dataValidade) }}
              </span>
            </div>
            <div class="detalhes-item">
              <span class="label">
                {{ modal.proposta.statusProposta === 'EM_AVALIACAO' ? 'Dias Restantes:' : 'Dias de Expirado:' }}
              </span>
              <span class="value" :class="getClasseValidade(modal.proposta.dataValidade)">
                {{
                  modal.proposta.statusProposta === 'EM_AVALIACAO'
                    ? calcularDiasRestantes(modal.proposta.dataValidade)
                    : calcularDiasExpiracao(modal.proposta.dataValidade) + ' dias'
                }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <template v-if="modal.proposta?.statusProposta !== 'EXPIRADA'" #footer>
      <div class="modal-actions">
        <div class="actions-modal-group">
          <button
            v-if="modal.proposta.statusProposta === 'EM_AVALIACAO'"
            type="button"
            class="btn-action-large btn-success"
            @click="abrirModalMudancaStatus(modal.proposta, 'ACEITA')"
          >
            ✅ Aceitar Proposta
          </button>
          <button
            v-if="modal.proposta.statusProposta === 'EM_AVALIACAO'"
            type="button"
            class="btn-action-large btn-danger"
            @click="abrirModalMudancaStatus(modal.proposta, 'RECUSADA')"
          >
            ❌ Recusar Proposta
          </button>
          <button
            type="button"
            class="btn-action-large btn-delete"
            @click="confirmarExclusao(modal.proposta)"
          >
            🗑️ Excluir Proposta
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { inject } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import {
  formatarValor,
  formatarDataCompleta,
  formatarStatus,
  calcularDiasRestantes,
  calcularDiasExpiracao,
  getClasseValidade,
} from "@/utils/formatters";

const {
  modalDetalhes: modal,
  fecharModalDetalhes,
  abrirModalMudancaStatus,
  confirmarExclusao,
} = inject("financasDashboard");
</script>
