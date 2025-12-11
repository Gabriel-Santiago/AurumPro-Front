<template>
    <div class="financas-container" :class="theme">
        <!-- Cabeçalho -->
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

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Carregando dashboard...</p>
        </div>

        <!-- Erro -->
        <div v-else-if="erro" class="error-state">
            <div class="error-icon">❌</div>
            <h3>Erro ao carregar dados</h3>
            <p>{{ erro }}</p>
            <button class="btn-retry" @click="carregarDashboard">
                Tentar novamente
            </button>
        </div>

        <!-- Conteúdo Principal -->
        <div v-else class="main-content">
            <!-- Cards de Resumo -->
            <div class="cards-container">
                <!-- Card 1: Total de Propostas -->
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

                <!-- Card 2: A Receber -->
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

                <!-- Card 3: Recebido -->
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

                <!-- Card 4: Taxa de Aceitação -->
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

            <!-- Tabs para diferentes status -->
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
                    <!-- Tab: Em Avaliação -->
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

                    <!-- Tab: Aceitas -->
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

                    <!-- Tab: Recusadas -->
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

                    <!-- Tab: Expiradas -->
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

        <!-- Modal de Detalhes -->
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
                            <!-- Valor Total (sempre mostra) -->
                            <div class="detalhes-item">
                                <span class="label">Valor Total:</span>
                                <span class="value valor">R$ {{ formatarValor(modalDetalhes.proposta.valorTotal)
                                }}</span>
                            </div>

                            <!-- Para EM_AVALIACAO: Mostra Data de Criação -->
                            <div v-if="modalDetalhes.proposta.statusProposta === 'EM_AVALIACAO'" class="detalhes-item">
                                <span class="label">Data de Criação:</span>
                                <span class="value">{{ formatarDataCompleta(modalDetalhes.proposta.dataCriacao)
                                }}</span>
                            </div>

                            <!-- Para EXPIRADA: Mostra Data de Criação -->
                            <div v-if="modalDetalhes.proposta.statusProposta === 'EXPIRADA'" class="detalhes-item">
                                <span class="label">Data de Criação:</span>
                                <span class="value">{{ formatarDataCompleta(modalDetalhes.proposta.dataCriacao)
                                }}</span>
                            </div>

                            <!-- Para ACEITA: Mostra Data de Criação e Data de Deferimento -->
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

                            <!-- Para RECUSADA: Mostra Data de Criação e Data de Indeferimento -->
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

                            <!-- Campos de validade e dias restantes apenas para EM_AVALIACAO e EXPIRADA -->
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
                            <!-- Ações para EM_AVALIACAO -->
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

                            <!-- Botão de exclusão (sempre mostra exceto para EXPIRADA) -->
                            <button class="btn-action-large btn-delete"
                                @click="confirmarExclusao(modalDetalhes.proposta)">
                                🗑️ Excluir Proposta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de Confirmação de Exclusão -->
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

        <!-- Modal de Confirmação de Mudança de Status -->
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

const authStore = useAuthStore();
const themeStore = useThemeStore();
const theme = computed(() => themeStore.theme);
const router = useRouter();

// Estados
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

// Tabs
const tabs = [
    { id: 'avaliacao', icon: '⏳', text: 'Em Avaliação' },
    { id: 'aceitas', icon: '✅', text: 'Aceitas' },
    { id: 'recusadas', icon: '❌', text: 'Recusadas' },
    { id: 'expiradas', icon: '⌛', text: 'Expiradas' }
];

// Carregar dashboard
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

        // Atualizar horário da última atualização
        ultimaAtualizacao.value = new Date().toLocaleTimeString('pt-BR');

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        erro.value = 'Erro ao carregar dados. Tente novamente.';
        dashboard.value = {};
    } finally {
        loading.value = false;
    }
};

// Funções auxiliares
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

// Abrir detalhes da proposta
const abrirDetalhesProposta = (proposta) => {
    modalDetalhes.value = {
        visible: true,
        proposta: proposta
    };
};

// Fechar modal de detalhes
const fecharModalDetalhes = () => {
    modalDetalhes.value = {
        visible: false,
        proposta: null
    };
};

// Exclusão de proposta
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

        // Recarregar dashboard
        await carregarDashboard();

        // Fechar modais
        cancelarExclusao();
        fecharModalDetalhes();

        alert('Proposta excluída com sucesso!');

    } catch (error) {
        console.error('Erro ao excluir proposta:', error);
        alert('Erro ao excluir proposta: ' + error.message);
    } finally {
        loading.value = false;
    }
};

// Mudança de status
const abrirModalMudancaStatus = (proposta, novoStatus) => {
    modalMudancaStatus.value = {
        visible: true,
        proposta: proposta,
        novoStatus: novoStatus
    };
    // Fechar modal de detalhes se estiver aberto
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
        console.log(dados);
        await financasService.atualizarStatusProposta(dados);

        // Recarregar dashboard
        await carregarDashboard();

        // Fechar modal
        fecharModalMudancaStatus();

        alert('Status da proposta atualizado com sucesso!');

    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status da proposta: ' + error.message);
    } finally {
        loading.value = false;
    }
};

// Funções auxiliares para modais
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

// Funções de formatação
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

// Inicialização
onMounted(() => {
    carregarDashboard();
});
</script>

<style scoped>
/* Variáveis CSS para tema claro/escuro */
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-tertiary: #f1f5f9;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --text-tertiary: #94a3b8;
    --border-color: #e2e8f0;
    --shadow-color: rgba(0, 0, 0, 0.08);
    --shadow-hover: rgba(0, 0, 0, 0.12);
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-secondary: linear-gradient(135deg, #3b82f6, #2563eb);
    --card-bg: #ffffff;
    --modal-overlay: rgba(0, 0, 0, 0.5);
    --error-color: #ef4444;
    --warning-color: #f59e0b;
    --success-color: #10b981;
    --info-color: #3b82f6;
    --primary-color: #667eea;
}

.dark {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-tertiary: #94a3b8;
    --border-color: #475569;
    --shadow-color: rgba(0, 0, 0, 0.2);
    --shadow-hover: rgba(0, 0, 0, 0.3);
    --gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    --gradient-secondary: linear-gradient(135deg, #60a5fa, #3b82f6);
    --card-bg: #1e293b;
    --modal-overlay: rgba(15, 23, 42, 0.8);
    --error-color: #f87171;
    --warning-color: #fbbf24;
    --success-color: #34d399;
    --info-color: #60a5fa;
    --primary-color: #8b5cf6;
}

.financas-container {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    min-height: 100vh;
    background: var(--bg-primary);
    transition: background-color 0.3s ease;
}

/* Cabeçalho */
.financas-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding: 24px;
    background: var(--card-bg);
    border-radius: 16px;
    box-shadow: 0 4px 20px var(--shadow-color);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.header-content h1 {
    margin: 0;
    font-size: 2.2rem;
    color: var(--text-primary);
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transition: all 0.3s ease;
}

.subtitle {
    margin: 8px 0 0 0;
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.header-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
}

.btn-voltar {
    padding: 10px 20px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-voltar:hover {
    background: var(--bg-tertiary);
    transform: translateY(-2px);
}

.btn-refresh {
    padding: 12px 24px;
    background: var(--gradient-secondary);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.btn-refresh:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
}

.btn-refresh:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.icon-btn.theme-toggle {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.2rem;
}

.icon-btn.theme-toggle:hover {
    background: var(--bg-tertiary);
    transform: rotate(15deg);
}

.data-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.data-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.data-value {
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 500;
}

/* Loading State */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 40px;
    text-align: center;
    background: var(--card-bg);
    border-radius: 16px;
    box-shadow: 0 4px 20px var(--shadow-color);
    border: 1px solid var(--border-color);
}

.loading-state .spinner {
    width: 60px;
    height: 60px;
    border: 4px solid var(--border-color);
    border-top-color: var(--info-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-state p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1.1rem;
}

/* Error State */
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 40px;
    text-align: center;
    background: var(--card-bg);
    border-radius: 16px;
    box-shadow: 0 4px 20px var(--shadow-color);
    border: 1px solid var(--border-color);
}

.error-icon {
    font-size: 4rem;
    color: var(--error-color);
    margin-bottom: 20px;
}

.error-state h3 {
    margin: 0 0 12px 0;
    color: var(--text-primary);
    font-size: 1.5rem;
}

.error-state p {
    margin: 0 0 24px 0;
    color: var(--text-secondary);
    max-width: 500px;
    line-height: 1.6;
}

.btn-retry {
    padding: 12px 32px;
    background: var(--gradient-secondary);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-retry:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
}

/* Main Content */
.main-content {
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Cards de Resumo */
.cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
}

.resumo-card {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px var(--shadow-color);
    display: flex;
    align-items: center;
    gap: 20px;
    transition: all 0.4s ease;
    border-top: 4px solid transparent;
    border: 1px solid var(--border-color);
}

.resumo-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 40px var(--shadow-hover);
}

.resumo-card.total {
    border-top-color: #667eea;
}

.resumo-card.em-aberto {
    border-top-color: var(--warning-color);
}

.resumo-card.recebido {
    border-top-color: var(--success-color);
}

.resumo-card.taxa {
    border-top-color: #8b5cf6;
}

.card-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
}

.total .card-icon {
    background: rgba(102, 126, 234, 0.1);
}

.em-aberto .card-icon {
    background: rgba(245, 158, 11, 0.1);
}

.recebido .card-icon {
    background: rgba(16, 185, 129, 0.1);
}

.taxa .card-icon {
    background: rgba(139, 92, 246, 0.1);
}

.card-content {
    flex: 1;
}

.card-content h3 {
    margin: 0 0 8px 0;
    font-size: 1rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.card-value {
    margin: 0 0 12px 0;
    font-size: 2rem;
    font-weight: 700;
}

.total .card-value {
    color: #667eea;
}

.em-aberto .card-value {
    color: var(--warning-color);
}

.recebido .card-value {
    color: var(--success-color);
}

.taxa .card-value {
    color: #8b5cf6;
}

.card-detalhes {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.detalhe-item {
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.em-avaliacao {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
}

.status-badge.aceita {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.status-badge.info {
    background: rgba(139, 92, 246, 0.1);
    color: #7c3aed;
}

/* Tabs */
.tabs-container {
    background: var(--card-bg);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px var(--shadow-color);
    border: 1px solid var(--border-color);
}

.tabs-header {
    display: flex;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    padding: 0 20px;
}

.tab-button {
    padding: 18px 24px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
    position: relative;
}

.tab-button:hover {
    color: var(--text-primary);
    background: rgba(0, 0, 0, 0.02);
}

.tab-button.active {
    color: var(--info-color);
    border-bottom-color: var(--info-color);
    background: var(--bg-primary);
}

.tab-icon {
    font-size: 1.2rem;
}

.tab-badge {
    background: var(--border-color);
    color: var(--text-secondary);
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.tab-button.active .tab-badge {
    background: var(--info-color);
    color: white;
}

.tabs-content {
    padding: 0;
}

.tab-pane {
    padding: 0;
}

.tab-header {
    padding: 24px 32px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-secondary);
}

.tab-header h3 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
}

.tab-subtitle {
    margin: 8px 0 0 0;
    color: var(--text-secondary);
    font-size: 1.1rem;
}

/* Propostas Grid */
.propostas-grid {
    padding: 24px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    max-height: 600px;
    overflow-y: auto;
}

.proposta-card {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 20px;
    border-left: 4px solid var(--warning-color);
    box-shadow: 0 2px 8px var(--shadow-color);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);
}

.proposta-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px var(--shadow-hover);
}

.proposta-card.aceita {
    border-left-color: var(--success-color);
}

.proposta-card.recusada {
    border-left-color: var(--error-color);
}

.proposta-card.expirada {
    border-left-color: var(--text-tertiary);
}

.proposta-header {
    margin-bottom: 20px;
}

.cliente-info h4 {
    margin: 0 0 12px 0;
    font-size: 1.2rem;
    color: var(--text-primary);
    font-weight: 600;
}

.proposta-metadata {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.metadata-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.metadata-item.expirada {
    color: var(--error-color);
    font-weight: 600;
}

.metadata-icon {
    font-size: 1rem;
}

.metadata-item.urgente {
    color: var(--warning-color);
    font-weight: 600;
}

.metadata-item.proxima {
    color: #8b5cf6;
    font-weight: 600;
}

.metadata-item.normal {
    color: var(--success-color);
    font-weight: 600;
}

.dias-restantes {
    font-weight: 600;
    font-size: 0.85rem;
    margin-left: 4px;
}

.proposta-valor {
    margin-top: 16px;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.valor-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.valor {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
}

/* Ações das Propostas */
.proposta-actions {
    margin-top: 20px;
}

.actions-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 100%;
}

@media (max-width: 480px) {
    .actions-group {
        grid-template-columns: 1fr;
    }
}

.btn-action {
    padding: 10px 15px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 0.9rem;
    text-align: center;
}

.btn-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-success {
    background: linear-gradient(135deg, var(--success-color), #059669);
    color: white;
}

.btn-success:hover {
    background: linear-gradient(135deg, #059669, #047857);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-danger {
    background: linear-gradient(135deg, var(--error-color), #dc2626);
    color: white;
}

.btn-danger:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-warning {
    background: linear-gradient(135deg, var(--warning-color), #d97706);
    color: white;
}

.btn-warning:hover {
    background: linear-gradient(135deg, #d97706, #b45309);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-delete {
    grid-column: span 2;
    background: linear-gradient(135deg, #64748b, #475569);
    color: white;
}

@media (max-width: 480px) {
    .btn-delete {
        grid-column: span 1;
    }
}

.btn-delete:hover {
    background: linear-gradient(135deg, #475569, #334155);
    box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3);
}

/* Sem propostas */
.sem-propostas {
    grid-column: 1 / -1;
}

.empty-state {
    text-align: center;
    padding: 60px 40px;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    display: block;
    color: var(--border-color);
}

.empty-state h4 {
    margin: 0 0 12px 0;
    font-size: 1.5rem;
    color: var(--text-secondary);
}

.empty-state p {
    margin: 0;
    color: var(--text-tertiary);
    font-size: 1.1rem;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
}

/* Modais */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--modal-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal-container {
    background: var(--card-bg);
    border-radius: 20px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px var(--shadow-hover);
    animation: slideUp 0.3s ease;
    border: 1px solid var(--border-color);
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    border-bottom: 1px solid var(--border-color);
    background: var(--gradient-primary);
    color: white;
    border-radius: 20px 20px 0 0;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-close {
    background: transparent;
    border: none;
    font-size: 2rem;
    color: white;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.btn-close:hover {
    background: rgba(255, 255, 255, 0.1);
}

.modal-content {
    padding: 32px;
}

.detalhes-section {
    margin-bottom: 32px;
}

.detalhes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.detalhes-header h4 {
    margin: 0;
    font-size: 1.4rem;
    color: var(--text-primary);
}

.detalhes-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}

.detalhes-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-color);
}

.detalhes-item:last-child {
    border-bottom: none;
}

.label {
    font-size: 0.95rem;
    color: var(--text-secondary);
}

.value {
    font-size: 1.1rem;
    color: var(--text-primary);
    font-weight: 500;
}

.valor {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--success-color);
}

/* Ações no modal */
.modal-actions {
    margin-top: 32px;
}

.actions-modal-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.btn-action-large {
    padding: 16px 24px;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
}

.btn-action-large:hover {
    transform: translateY(-2px);
}

.btn-action-large.btn-success {
    background: linear-gradient(135deg, var(--success-color), #059669);
}

.btn-action-large.btn-success:hover {
    background: linear-gradient(135deg, #059669, #047857);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.btn-action-large.btn-danger {
    background: linear-gradient(135deg, var(--error-color), #dc2626);
}

.btn-action-large.btn-danger:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}

.btn-action-large.btn-warning {
    background: linear-gradient(135deg, var(--warning-color), #d97706);
}

.btn-action-large.btn-warning:hover {
    background: linear-gradient(135deg, #d97706, #b45309);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
}

.btn-action-large.btn-delete {
    background: linear-gradient(135deg, #64748b, #475569);
}

.btn-action-large.btn-delete:hover {
    background: linear-gradient(135deg, #475569, #334155);
    box-shadow: 0 6px 20px rgba(100, 116, 139, 0.3);
}

/* Modal de Confirmação */
.modal-confirmacao {
    background: var(--card-bg);
    border-radius: 20px;
    padding: 40px;
    width: 90%;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 25px 50px var(--shadow-hover);
    animation: scaleIn 0.3s ease;
    border: 1px solid var(--border-color);
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.modal-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    color: var(--warning-color);
}

.modal-icon.success {
    color: var(--success-color);
}

.modal-icon.error {
    color: var(--error-color);
}

.modal-icon.warning {
    color: var(--warning-color);
}

.modal-confirmacao h3 {
    margin: 0 0 16px 0;
    color: var(--text-primary);
}

.modal-confirmacao p {
    margin: 12px 0;
    color: var(--text-secondary);
    line-height: 1.6;
}

.modal-valor {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
}

.aviso {
    color: var(--error-color) !important;
    font-weight: 500;
    font-size: 0.95rem;
}

/* Botões do modal de confirmação */
.modal-actions {
    display: flex;
    gap: 16px;
    margin-top: 32px;
    justify-content: center;
}

.btn-cancelar {
    padding: 12px 32px;
    background: var(--border-color);
    color: var(--text-secondary);
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-cancelar:hover {
    background: var(--text-tertiary);
    color: white;
}

.btn-excluir {
    padding: 12px 32px;
    background: var(--error-color);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-excluir:hover {
    background: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}

.btn-confirm {
    padding: 12px 32px;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-confirm:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.btn-confirm.btn-success {
    background: linear-gradient(135deg, var(--success-color), #059669);
}

.btn-confirm.btn-success:hover {
    background: linear-gradient(135deg, #059669, #047857);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.btn-confirm.btn-danger {
    background: linear-gradient(135deg, var(--error-color), #dc2626);
}

.btn-confirm.btn-danger:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}

.btn-confirm.btn-warning {
    background: linear-gradient(135deg, var(--warning-color), #d97706);
}

.btn-confirm.btn-warning:hover {
    background: linear-gradient(135deg, #d97706, #b45309);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
}

.btn-confirm.btn-primary {
    background: linear-gradient(135deg, var(--primary-color), #5a67d8);
}

.btn-confirm.btn-primary:hover {
    background: linear-gradient(135deg, #5a67d8, #4c51bf);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

/* Status badges no modal */
.status-badge.em_avaliacao {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.aceita {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.recusada {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.expirada {
    background: rgba(100, 116, 139, 0.1);
    color: #64748b;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Responsividade */
@media (max-width: 1200px) {
    .propostas-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
}

@media (max-width: 768px) {
    .financas-container {
        padding: 16px;
    }

    .financas-header {
        flex-direction: column;
        align-items: stretch;
        gap: 20px;
    }

    .header-left {
        flex-direction: column;
        gap: 16px;
    }

    .header-actions {
        align-items: stretch;
    }

    .cards-container {
        grid-template-columns: 1fr;
    }

    .tabs-header {
        flex-wrap: wrap;
    }

    .tab-button {
        flex: 1;
        min-width: 120px;
        justify-content: center;
    }

    .propostas-grid {
        grid-template-columns: 1fr;
    }

    .modal-container,
    .modal-confirmacao {
        width: 95%;
        padding: 20px;
        margin: 10px;
    }

    .modal-actions {
        flex-direction: column;
    }

    .btn-cancelar,
    .btn-excluir,
    .btn-confirm {
        width: 100%;
    }
}

@media (max-width: 480px) {
    .header-content h1 {
        font-size: 1.8rem;
    }

    .tab-button {
        padding: 12px 16px;
        font-size: 0.9rem;
    }

    .tab-icon {
        font-size: 1rem;
    }

    .tab-badge {
        padding: 2px 6px;
        font-size: 0.75rem;
    }

    .actions-group {
        grid-template-columns: 1fr;
    }

    .btn-delete {
        grid-column: span 1;
    }
}
</style>