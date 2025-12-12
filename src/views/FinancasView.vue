<template>
    <div class="financas-container" :class="theme">
        <div class="financas-header">
            <div class="header-left">
                <button class="btn-voltar" @click="voltar" title="Voltar">
                    ← Voltar
                </button>
                <div class="header-content">
                    <h1>💰 Dashboard Financeiro</h1>
                    <p class="subtitle">Acompanhe todas as suas propostas e valores</p>
                </div>
            </div>

            <div class="header-actions">
                <button class="icon-btn theme-toggle" :title="theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'"
                    @click="themeStore.toggleTheme()">
                    {{ theme === 'dark' ? '☀️' : '🌙' }}
                </button>
                <button class="btn-refresh" @click="carregarDashboard" :disabled="loading">
                    🔄 Atualizar
                </button>

                <div class="data-info" v-if="!loading && ultimaAtualizacao">
                    <span class="data-label">Última atualização:</span>
                    <span class="data-value">{{ ultimaAtualizacao }}</span>
                </div>
            </div>
        </div>

        <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Carregando dashboard...</p>
        </div>

        <div v-else-if="erro" class="error-state">
            <div class="error-icon">❌</div>
            <h3>Erro ao carregar dados</h3>
            <p>{{ erro }}</p>
            <button class="btn-retry" @click="carregarDashboard">
                Tentar novamente
            </button>
        </div>

        <div v-else class="main-content">
            <div class="cards-container">
                <div class="resumo-card total">
                    <div class="card-icon">
                        <span>📋</span>
                    </div>
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
                    <div class="card-icon">
                        <span>⏳</span>
                    </div>
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
                    <div class="card-icon">
                        <span>✅</span>
                    </div>
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
                    <div class="card-icon">
                        <span>📊</span>
                    </div>
                    <div class="card-content">
                        <h3>Taxa de Aceitação</h3>
                        <p class="card-value">{{ formatarTaxaAceitacao(dashboard.taxaAceitacao) }}%</p>
                        <div class="card-detalhes">
                            <span class="detalhe-item">{{ dashboard.propostasAceitas || 0 }} de {{
                                dashboard.totalPropostas || 0 }}</span>
                            <span class="detalhe-item status-badge info">DESEMPENHO</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tabs-container">
                <div class="tabs-header">
                    <button v-for="tab in tabs" :key="tab.id" class="tab-button"
                        :class="{ active: tabAtiva === tab.id }" @click="tabAtiva = tab.id">
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
                            <div v-for="proposta in dashboard.emAvaliacao || []" :key="proposta.id"
                                class="proposta-card" @click="abrirDetalhesProposta(proposta)">
                                <div class="proposta-header">
                                    <div class="cliente-info">
                                        <h4>{{ proposta.nomeCliente }}</h4>
                                        <div class="proposta-metadata">
                                            <span class="metadata-item">
                                                <span class="metadata-icon">📅</span>
                                                <span class="metadata-text">Criada: {{
                                                    formatarData(proposta.dataCriacao) }}</span>
                                            </span>
                                            <span class="metadata-item"
                                                :class="getClasseValidade(proposta.dataValidade)">
                                                <span class="metadata-icon">⏰</span>
                                                <span class="metadata-text">
                                                    Validade: {{ formatarData(proposta.dataValidade) }}
                                                    <span class="dias-restantes">({{
                                                        calcularDiasRestantes(proposta.dataValidade) }})</span>
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    <div class="proposta-valor">
                                        <span class="valor-label">Valor:</span>
                                        <span class="valor">R$ {{ formatarValor(proposta.valorTotal) }}</span>
                                    </div>
                                </div>

                                <div class="proposta-actions">
                                    <div class="actions-group">
                                        <button class="btn-action btn-success"
                                            @click.stop="abrirModalMudancaStatus(proposta, 'ACEITA')"
                                            title="Marcar como aceita">
                                            ✅ Aceito
                                        </button>
                                        <button class="btn-action btn-danger"
                                            @click.stop="abrirModalMudancaStatus(proposta, 'RECUSADA')"
                                            title="Marcar como recusada">
                                            ❌ Recusada
                                        </button>
                                        <button class="btn-action btn-delete" @click.stop="confirmarExclusao(proposta)"
                                            title="Excluir proposta">
                                            🗑️ Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div v-if="!dashboard.emAvaliacao || dashboard.emAvaliacao.length === 0"
                                class="sem-propostas">
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
                            <div v-for="proposta in dashboard.aceita || []" :key="proposta.id"
                                class="proposta-card aceita" @click="abrirDetalhesProposta(proposta)">
                                <div class="proposta-header">
                                    <div class="cliente-info">
                                        <h4>{{ proposta.nomeCliente }}</h4>
                                        <div class="proposta-metadata">
                                            <span class="metadata-item">
                                                <span class="metadata-icon">✅</span>
                                                <span class="metadata-text">Status: Aceita</span>
                                            </span>
                                            <span class="metadata-item">
                                                <span class="metadata-icon">📅</span>
                                                <span class="metadata-text">Aceita em: {{
                                                    formatarData(proposta.dataMudancaStatus) }}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div class="proposta-valor">
                                        <span class="valor-label">Valor recebido:</span>
                                        <span class="valor">R$ {{ formatarValor(proposta.valorTotal) }}</span>
                                    </div>
                                </div>

                                <div class="proposta-actions">
                                    <div class="actions-group">
                                        <button class="btn-action btn-delete" @click.stop="confirmarExclusao(proposta)"
                                            title="Excluir proposta">
                                            🗑️ Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div v-if="!dashboard.aceita || dashboard.aceita.length === 0" class="sem-propostas">
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
                            <div v-for="proposta in dashboard.recusada || []" :key="proposta.id"
                                class="proposta-card recusada" @click="abrirDetalhesProposta(proposta)">
                                <div class="proposta-header">
                                    <div class="cliente-info">
                                        <h4>{{ proposta.nomeCliente }}</h4>
                                        <div class="proposta-metadata">
                                            <span class="metadata-item">
                                                <span class="metadata-icon">❌</span>
                                                <span class="metadata-text">Status: Recusada</span>
                                            </span>
                                            <span class="metadata-item">
                                                <span class="metadata-icon">📅</span>
                                                <span class="metadata-text">Recusada em: {{
                                                    formatarData(proposta.dataMudancaStatus) }}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div class="proposta-valor">
                                        <span class="valor-label">Valor:</span>
                                        <span class="valor">R$ {{ formatarValor(proposta.valorTotal) }}</span>
                                    </div>
                                </div>

                                <div class="proposta-actions">
                                    <div class="actions-group">
                                        <button class="btn-action btn-delete" @click.stop="confirmarExclusao(proposta)"
                                            title="Excluir proposta">
                                            🗑️ Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div v-if="!dashboard.recusada || dashboard.recusada.length === 0" class="sem-propostas">
                                <div class="empty-state">
                                    <span class="empty-icon">👍</span>
                                    <h4>Nenhuma proposta recusada</h4>
                                    <p>Ótimo! Isso significa que todas as suas propostas foram aceitas ou estão em
                                        avaliação.</p>
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
                            <div v-for="proposta in dashboard.expirada || []" :key="proposta.id"
                                class="proposta-card expirada" @click="abrirDetalhesProposta(proposta)">
                                <div class="proposta-header">
                                    <div class="cliente-info">
                                        <h4>{{ proposta.nomeCliente }}</h4>
                                        <div class="proposta-metadata">
                                            <span class="metadata-item">
                                                <span class="metadata-icon">⌛</span>
                                                <span class="metadata-text">Status: Expirada</span>
                                            </span>
                                            <span class="metadata-item">
                                                <span class="metadata-icon">📅</span>
                                                <span class="metadata-text">Criada: {{
                                                    formatarData(proposta.dataCriacao) }}</span>
                                            </span>
                                            <span class="metadata-item expirada">
                                                <span class="metadata-icon">⏰</span>
                                                <span class="metadata-text">Expirou há {{
                                                    calcularDiasExpiracao(proposta.dataValidade) }} dias</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div class="proposta-valor">
                                        <span class="valor-label">Valor perdido:</span>
                                        <span class="valor">R$ {{ formatarValor(proposta.valorTotal) }}</span>
                                    </div>
                                </div>

                                <div class="proposta-actions">
                                    <button class="btn-action btn-delete" @click.stop="confirmarExclusao(proposta)"
                                        title="Excluir proposta">
                                        🗑️ Excluir
                                    </button>
                                </div>
                            </div>

                            <div v-if="!dashboard.expirada || dashboard.expirada.length === 0" class="sem-propostas">
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
        </div>

        <div v-if="modalDetalhes.visible" class="modal-overlay" @click.self="fecharModalDetalhes">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>📋 Detalhes da Proposta</h3>
                    <button class="btn-close" @click="fecharModalDetalhes">×</button>
                </div>

                <div class="modal-content" v-if="modalDetalhes.proposta">
                    <div class="detalhes-section">
                        <div class="detalhes-header">
                            <h4>{{ modalDetalhes.proposta.nomeCliente }}</h4>
                            <span class="status-badge" :class="modalDetalhes.proposta.statusProposta?.toLowerCase()">
                                {{ formatarStatus(modalDetalhes.proposta.statusProposta) }}
                            </span>
                        </div>

                        <div class="detalhes-grid">
                            <div class="detalhes-item">
                                <span class="label">Valor Total:</span>
                                <span class="value valor">R$ {{ formatarValor(modalDetalhes.proposta.valorTotal)
                                }}</span>
                            </div>

                            <div v-if="modalDetalhes.proposta.statusProposta === 'EM_AVALIACAO'" class="detalhes-item">
                                <span class="label">Data de Criação:</span>
                                <span class="value">{{ formatarDataCompleta(modalDetalhes.proposta.dataCriacao)
                                }}</span>
                            </div>

                            <div v-if="modalDetalhes.proposta.statusProposta === 'EXPIRADA'" class="detalhes-item">
                                <span class="label">Data de Criação:</span>
                                <span class="value">{{ formatarDataCompleta(modalDetalhes.proposta.dataCriacao)
                                }}</span>
                            </div>

                            <div v-if="modalDetalhes.proposta.statusProposta === 'ACEITA'">
                                <div class="detalhes-item">
                                    <span class="label">Data de criação:</span>
                                    <span class="value">{{ formatarDataCompleta(modalDetalhes.proposta.dataCriacao)
                                        }}</span>
                                </div>
                                <div class="detalhes-item">
                                    <span class="label">Data de deferimento:</span>
                                    <span class="value success">{{
                                        formatarDataCompleta(modalDetalhes.proposta.dataMudancaStatus) }}</span>
                                </div>
                            </div>

                            <div v-if="modalDetalhes.proposta.statusProposta === 'RECUSADA'">
                                <div class="detalhes-item">
                                    <span class="label">Data de criação:</span>
                                    <span class="value">{{ formatarDataCompleta(modalDetalhes.proposta.dataCriacao)
                                        }}</span>
                                </div>
                                <div class="detalhes-item">
                                    <span class="label">Data de indeferimento:</span>
                                    <span class="value error">{{
                                        formatarDataCompleta(modalDetalhes.proposta.dataMudancaStatus) }}</span>
                                </div>
                            </div>

                            <template
                                v-if="modalDetalhes.proposta.statusProposta === 'EM_AVALIACAO' || modalDetalhes.proposta.statusProposta === 'EXPIRADA'">
                                <div class="detalhes-item">
                                    <span class="label">Data de Validade:</span>
                                    <span class="value" :class="getClasseValidade(modalDetalhes.proposta.dataValidade)">
                                        {{ formatarDataCompleta(modalDetalhes.proposta.dataValidade) }}
                                    </span>
                                </div>

                                <div class="detalhes-item">
                                    <span class="label" v-if="modalDetalhes.proposta.statusProposta === 'EM_AVALIACAO'">
                                        Dias Restantes:
                                    </span>
                                    <span class="label"
                                        v-else-if="modalDetalhes.proposta.statusProposta === 'EXPIRADA'">
                                        Dias de Expirado:
                                    </span>
                                    <span class="value" :class="getClasseValidade(modalDetalhes.proposta.dataValidade)">
                                        {{ modalDetalhes.proposta.statusProposta === 'EM_AVALIACAO'
                                            ? calcularDiasRestantes(modalDetalhes.proposta.dataValidade)
                                            : calcularDiasExpiracao(modalDetalhes.proposta.dataValidade) + ' dias'
                                        }}
                                    </span>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div class="modal-actions" v-if="modalDetalhes.proposta.statusProposta !== 'EXPIRADA'">
                        <div class="actions-modal-group">
                            <button v-if="modalDetalhes.proposta.statusProposta === 'EM_AVALIACAO'"
                                class="btn-action-large btn-success"
                                @click="abrirModalMudancaStatus(modalDetalhes.proposta, 'ACEITA')">
                                ✅ Aceitar Proposta
                            </button>
                            <button v-if="modalDetalhes.proposta.statusProposta === 'EM_AVALIACAO'"
                                class="btn-action-large btn-danger"
                                @click="abrirModalMudancaStatus(modalDetalhes.proposta, 'RECUSADA')">
                                ❌ Recusar Proposta
                            </button>

                            <button class="btn-action-large btn-delete"
                                @click="confirmarExclusao(modalDetalhes.proposta)">
                                🗑️ Excluir Proposta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="modalExclusao.visible" class="modal-overlay" @click.self="cancelarExclusao">
            <div class="modal-confirmacao">
                <div class="modal-icon">⚠️</div>
                <h3>Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir a proposta de <strong>{{ modalExclusao.proposta?.nomeCliente
                        }}</strong>?</p>
                <p class="modal-valor">Valor: R$ {{ formatarValor(modalExclusao.proposta?.valorTotal) }}</p>
                <p class="aviso">Esta ação não pode ser desfeita.</p>

                <div class="modal-actions">
                    <button class="btn-cancelar" @click="cancelarExclusao">
                        Cancelar
                    </button>
                    <button class="btn-excluir" @click="excluirProposta">
                        Excluir
                    </button>
                </div>
            </div>
        </div>

        <div v-if="modalMudancaStatus.visible" class="modal-overlay" @click.self="fecharModalMudancaStatus">
            <div class="modal-confirmacao">
                <div class="modal-icon" :class="getClasseIconeModal(modalMudancaStatus.novoStatus)">
                    {{ getIconeModal(modalMudancaStatus.novoStatus) }}
                </div>
                <h3>Confirmar Mudança de Status</h3>
                <p>Tem certeza que deseja marcar a proposta de <strong>{{ modalMudancaStatus.proposta?.nomeCliente
                        }}</strong>
                    como <strong>{{ formatarStatus(modalMudancaStatus.novoStatus) }}</strong>?</p>
                <p class="modal-valor">Valor: R$ {{ formatarValor(modalMudancaStatus.proposta?.valorTotal) }}</p>

                <div class="modal-actions">
                    <button class="btn-cancelar" @click="fecharModalMudancaStatus">
                        Cancelar
                    </button>
                    <button class="btn-confirm" :class="getClasseBotaoModal(modalMudancaStatus.novoStatus)"
                        @click="atualizarStatusProposta">
                        {{ getTextoBotaoModal(modalMudancaStatus.novoStatus) }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import financasService from '../services/financasService';
import propostaService from '../services/propostaService';
import { notify } from '../services/notificationService';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const theme = computed(() => themeStore.theme);
const router = useRouter();

const dashboard = ref({});
const loading = ref(false);
const erro = ref(null);
const tabAtiva = ref('avaliacao');
const ultimaAtualizacao = ref('');

const modalDetalhes = ref({
    visible: false,
    proposta: null
});

const modalExclusao = ref({
    visible: false,
    proposta: null
});

const modalMudancaStatus = ref({
    visible: false,
    proposta: null,
    novoStatus: null
});

const voltar = () => {
    router.push('/clientes');
};

const tabs = [
    { id: 'avaliacao', icon: '⏳', text: 'Em Avaliação' },
    { id: 'aceitas', icon: '✅', text: 'Aceitas' },
    { id: 'recusadas', icon: '❌', text: 'Recusadas' },
    { id: 'expiradas', icon: '⌛', text: 'Expiradas' }
];

const carregarDashboard = async () => {
    try {
        loading.value = true;
        erro.value = null;
        const empresaId = authStore.empresa?.empresaId;

        if (!empresaId) {
            erro.value = 'Empresa ID não encontrado';
            loading.value = false;
            return;
        }

        const data = await financasService.getDashboard(empresaId);
        dashboard.value = data || {};

        ultimaAtualizacao.value = new Date().toLocaleTimeString('pt-BR');

    } catch (error) {
        notify.error('Erro ao carregar dashboard');
        erro.value = 'Erro ao carregar dados. Tente novamente.';
        dashboard.value = {};
    } finally {
        loading.value = false;
    }
};

const getContadorTab = (tabId) => {
    switch (tabId) {
        case 'avaliacao': return dashboard.value?.emAvaliacao?.length || 0;
        case 'aceitas': return dashboard.value?.aceita?.length || 0;
        case 'recusadas': return dashboard.value?.recusada?.length || 0;
        case 'expiradas': return dashboard.value?.expirada?.length || 0;
        default: return 0;
    }
};

const formatarTaxaAceitacao = (taxa) => {
    if (taxa === null || taxa === undefined) return '0.00';
    if (typeof taxa === 'number') return taxa.toFixed(2);
    if (typeof taxa === 'string') return parseFloat(taxa).toFixed(2);
    return '0.00';
};

const abrirDetalhesProposta = (proposta) => {
    modalDetalhes.value = {
        visible: true,
        proposta: proposta
    };
};

const fecharModalDetalhes = () => {
    modalDetalhes.value = {
        visible: false,
        proposta: null
    };
};

const confirmarExclusao = (proposta) => {
    modalExclusao.value = {
        visible: true,
        proposta: proposta
    };
};

const cancelarExclusao = () => {
    modalExclusao.value = {
        visible: false,
        proposta: null
    };
};

const excluirProposta = async () => {
    try {
        loading.value = true;
        await propostaService.excluirProposta(modalExclusao.value.proposta.id);

        await carregarDashboard();

        cancelarExclusao();
        fecharModalDetalhes();

        notify.success('Proposta excluída com sucesso!');
    } catch (error) {
        notify.error('Erro ao excluir proposta');
    } finally {
        loading.value = false;
    }
};

const abrirModalMudancaStatus = (proposta, novoStatus) => {
    modalMudancaStatus.value = {
        visible: true,
        proposta: proposta,
        novoStatus: novoStatus
    };
    fecharModalDetalhes();
};

const fecharModalMudancaStatus = () => {
    modalMudancaStatus.value = {
        visible: false,
        proposta: null,
        novoStatus: null
    };
};

const atualizarStatusProposta = async () => {
    try {
        loading.value = true;

        const dados = {
            empresaId: authStore.empresa?.empresaId,
            propostaId: modalMudancaStatus.value.proposta.id,
            statusProposta: modalMudancaStatus.value.novoStatus
        };
        await financasService.atualizarStatusProposta(dados);

        await carregarDashboard();

        fecharModalMudancaStatus();

        notify.success('Status da proposta atualizado com sucesso!');

    } catch (error) {
        notify.error('Erro ao atualizar status:', error);
    } finally {
        loading.value = false;
    }
};

const getIconeModal = (status) => {
    switch (status) {
        case 'ACEITA': return '✅';
        case 'RECUSADA': return '❌';
        case 'EM_AVALIACAO': return '⏳';
        default: return '⚠️';
    }
};

const getClasseIconeModal = (status) => {
    switch (status) {
        case 'ACEITA': return 'success';
        case 'RECUSADA': return 'error';
        case 'EM_AVALIACAO': return 'warning';
        default: return '';
    }
};

const getTextoBotaoModal = (status) => {
    switch (status) {
        case 'ACEITA': return '✅ Aceitar';
        case 'RECUSADA': return '❌ Recusar';
        case 'EM_AVALIACAO': return '⏳ Reavaliar';
        default: return 'Confirmar';
    }
};

const getClasseBotaoModal = (status) => {
    switch (status) {
        case 'ACEITA': return 'btn-success';
        case 'RECUSADA': return 'btn-danger';
        case 'EM_AVALIACAO': return 'btn-warning';
        default: return 'btn-primary';
    }
};

const formatarValor = (valor) => {
    if (!valor && valor !== 0) return '0,00';
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valorNumerico || 0);
};

const formatarData = (dataString) => {
    if (!dataString) return '';
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    } catch (err) {
        return dataString;
    }
};

const formatarDataCompleta = (dataString) => {
    if (!dataString) return '';
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR') + ' às ' +
            data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
        return dataString;
    }
};

const formatarStatus = (status) => {
    const statusMap = {
        'EM_AVALIACAO': 'Em Avaliação',
        'ACEITA': 'Aceita',
        'RECUSADA': 'Recusada',
        'EXPIRADA': 'Expirada'
    };
    return statusMap[status] || status || 'Desconhecido';
};

const calcularDiasRestantes = (dataValidade) => {
    if (!dataValidade) return '';
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const dias = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));

    if (dias > 0) return `${dias} dias restantes`;
    if (dias === 0) return 'Vence hoje';
    return `Expirada há ${Math.abs(dias)} dias`;
};

const calcularDiasExpiracao = (dataValidade) => {
    if (!dataValidade) return '';
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const dias = Math.ceil((hoje - validade) / (1000 * 60 * 60 * 24));
    return Math.max(0, dias);
};

const getClasseValidade = (dataValidade) => {
    if (!dataValidade) return '';
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const dias = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));

    if (dias <= 0) return 'expirada';
    if (dias <= 2) return 'urgente';
    if (dias <= 5) return 'proxima';
    return 'normal';
};

onMounted(() => {
    carregarDashboard();
});
</script>

<style scoped>
.financas-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  transition: all 0.3s ease;
}

.financas-container.light {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  color: #111;
}

.financas-container.dark {
  background: linear-gradient(180deg, #111 0%, #1a1a1a 100%);
  color: #daa520;
}

.financas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 20px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  transition: color .3s ease;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-content h1 {
  font-size: 1.6rem;
  margin: 0;
}

.subtitle {
  margin-top: 2px;
  font-size: 0.9rem;
  opacity: 0.7;
}

.btn-voltar {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  background: #e5e7eb;
  cursor: pointer;
  transition: all .3s ease;
}

.financas-container.dark .btn-voltar {
  background: #333;
  color: #daa520;
}

.btn-voltar:hover {
  opacity: 0.8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-btn,
.btn-refresh {
  padding: 8px 12px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  background: #e5e7eb;
  border-radius: 8px;
  transition: all .3s ease;
}

.financas-container.dark .icon-btn,
.financas-container.dark .btn-refresh {
  background: #333;
  color: #daa520;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.data-info {
  font-size: 0.85rem;
  opacity: 0.7;
  display: flex;
  gap: 6px;
}

.loading-state {
  text-align: center;
  margin-top: 40px;
}

.spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #ccc;
  border-top-color: #111;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 1s linear infinite;
}

.financas-container.dark .spinner {
  border-top-color: #daa520;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  text-align: center;
  padding: 40px 0;
}

.error-icon {
  font-size: 2rem;
}

.btn-retry {
  padding: 10px 16px;
  margin-top: 12px;
  border: none;
  cursor: pointer;
  background: #e11d48;
  color: white;
  border-radius: 8px;
  transition: all .3s ease;
}

.main-content {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 10px 20px 40px;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 26px;
}

.resumo-card {
  background: #f1f5f9;
  padding: 18px;
  border-radius: 12px;
  display: flex;
  gap: 14px;
  transition: all .3s ease;
  cursor: pointer;
}

.resumo-card:hover {
  transform: translateY(-2px);
}

.financas-container.dark .resumo-card {
  background: #222;
}

.card-icon span {
  font-size: 2rem;
}

.card-content h3 {
  margin: 0;
  font-size: 1rem;
}

.card-value {
  font-weight: bold;
  font-size: 1.4rem;
  margin: 4px 0;
}

.card-detalhes {
  font-size: 0.85rem;
  opacity: 0.8;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  width: fit-content;
}

.status-badge.em-avaliacao {
  background: #fde047;
}

.status-badge.aceita {
  background: #4ade80;
  color: #111;
}

.status-badge.info {
  background: #3b82f6;
  color: white;
}

.tabs-container {
  margin-top: 24px;
}

.tabs-header {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.tab-button {
  padding: 10px 18px;
  border-radius: 8px;
  background: #e5e7eb;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all .3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.financas-container.dark .tab-button {
  background: #222;
  color: #daa520;
}

.tab-button.active {
  background: #111;
  color: #daa520;
  font-weight: 600;
}

.tab-badge {
  background: #111;
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.75rem;
}

.financas-container.dark .tab-badge {
  background: #daa520;
  color: #111;
}

.propostas-grid {
  margin-top: 20px;
  display: grid;
  gap: 16px;
}

.proposta-card {
  padding: 18px;
  background: #f1f5f9;
  border-radius: 12px;
  transition: all .3s ease;
  cursor: pointer;
}

.financas-container.dark .proposta-card {
  background: #222;
}

.proposta-card:hover {
  transform: translateY(-2px);
}

.proposta-header {
  display: flex;
  justify-content: space-between;
}

.cliente-info h4 {
  margin: 0;
  font-size: 1.1rem;
}

.proposta-metadata {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  opacity: 0.8;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.valor-label {
  font-size: 0.85rem;
  opacity: 0.7;
}

.valor {
  font-weight: bold;
  font-size: 1.1rem;
}

.expirada {
  color: #ef4444;
}

.urgente {
  color: #f97316;
}

.proxima {
  color: #eab308;
}

.normal {
  color: #22c55e;
}

.proposta-actions {
  margin-top: 14px;
}

.actions-group {
  display: flex;
  gap: 10px;
}

.btn-action {
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all .3s ease;
  font-size: 0.85rem;
}

.btn-success {
  background: #4ade80;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-delete {
  background: #333;
  color: white;
}

.btn-action:hover {
  opacity: 0.8;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  opacity: 0.8;
}

.empty-state .empty-icon {
  font-size: 2rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(4px);
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-container,
.modal-confirmacao {
  width: 100%;
  max-width: 520px;
  background: #f8fafc;
  padding: 20px;
  border-radius: 14px;
  transition: all .3s ease;
}

.financas-container.dark .modal-container,
.financas-container.dark .modal-confirmacao {
  background: #222;
  color: #daa520;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
}

.detalhes-section {
  margin-top: 20px;
}

.detalhes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detalhes-grid {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.detalhes-item .label {
  font-size: 0.85rem;
  opacity: 0.7;
}

.detalhes-item .value {
  font-weight: 600;
}

.actions-modal-group,
.modal-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-action-large {
  padding: 12px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all .3s ease;
  flex: 1;
}

.btn-warning {
  background: #fbbf24;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-cancelar {
  background: #e5e7eb;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
}

.financas-container.dark .btn-cancelar {
  background: #333;
}

.btn-excluir,
.btn-confirm {
  background: #ef4444;
  color: white;
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
}

.modal-icon {
  font-size: 2.4rem;
  margin-bottom: 10px;
}

.modal-icon.success {
  color: #4ade80;
}

.modal-icon.error {
  color: #ef4444;
}

.modal-icon.warning {
  color: #fbbf24;
}

.modal-valor {
  font-weight: 600;
}

.aviso {
  font-size: 0.85rem;
  opacity: 0.7;
}
</style>
