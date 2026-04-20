<template>
    <div class="atividades-container" :class="theme">
        <div class="atividades-header">
            <div class="header-left">
                <button class="btn-voltar" @click="voltar" title="Voltar">
                    ← Voltar
                </button>
                <div class="header-content">
                    <h1>📋 Atividades das Propostas Aceitas</h1>
                    <p class="subtitle">Gerencie as atividades das propostas que foram aceitas</p>
                </div>
            </div>

            <div class="header-actions">
                <button class="icon-btn theme-toggle" :title="theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'"
                    @click="themeStore.toggleTheme()">
                    {{ theme === 'dark' ? '☀️' : '🌙' }}
                </button>
                <button class="btn-refresh" @click="carregarPropostasAceitas" :disabled="loading">
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
            <p>Carregando propostas aceitas...</p>
        </div>

        <div v-else-if="erro" class="error-state">
            <div class="error-icon">❌</div>
            <h3>Erro ao carregar dados</h3>
            <p>{{ erro }}</p>
            <button class="btn-retry" @click="carregarPropostasAceitas">
                Tentar novamente
            </button>
        </div>

        <div v-else class="main-content">
            <div class="propostas-grid">
                <div v-for="proposta in propostasAceitas" :key="proposta.id" class="proposta-card">
                    <div class="proposta-header" @click="alternarAtividades(proposta.id)">
                        <div class="proposta-info">
                            <h3>{{ proposta.nomeCliente || `Proposta #${proposta.id}` }}</h3>
                            <div class="proposta-metadata">
                                <span class="metadata-item">
                                    <span class="metadata-icon">📅</span>
                                    <span class="metadata-text">Aprovada em: {{ formatarData(proposta.dataMudancaStatus) }}</span>
                                </span>
                            </div>
                        </div>
                        
                        <div class="proposta-actions">
                            <button class="btn-action btn-add" @click.stop="abrirModalNovaAtividade(proposta.id)" 
                                title="Adicionar atividade">
                                ➕ Adicionar Atividade
                            </button>
                            <span class="expand-icon" :class="{ 'expanded': propostaExpandida === proposta.id }">
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
                                <div v-for="atividade in atividadesPorProposta[proposta.id]" :key="atividade.id" 
                                    class="checklist-item">
                                    <label class="checkbox-label">
                                        <input type="checkbox" 
                                            :checked="atividade.concluida" 
                                            @change="alternarStatusAtividade(atividade)"
                                            class="checkbox-input">
                                        <span class="checkmark"></span>
                                        <span class="atividade-nome" :class="{ 'concluida': atividade.concluida }">
                                            {{ atividade.nome }}
                                        </span>
                                    </label>
                                    
                                    <button class="btn-delete-atividade" 
                                        @click="confirmarExclusaoAtividade(atividade)"
                                        title="Excluir atividade">
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

                <div v-if="!propostasAceitas || propostasAceitas.length === 0" class="sem-propostas">
                    <div class="empty-state">
                        <span class="empty-icon">🎉</span>
                        <h4>Nenhuma proposta aceita</h4>
                        <p>Quando suas propostas forem aceitas, elas aparecerão aqui para gerenciamento de atividades.</p>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="modalNovaAtividade.visible" class="modal-overlay" @click.self="fecharModalNovaAtividade">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>➕ Nova Atividade</h3>
                    <button class="btn-close" @click="fecharModalNovaAtividade">×</button>
                </div>

                <div class="modal-content">
                    <div class="form-group">
                        <label for="nomeAtividade">Nome da Atividade *</label>
                        <input type="text" 
                            id="nomeAtividade" 
                            v-model="modalNovaAtividade.nome"
                            placeholder="Digite o nome da atividade"
                            class="form-input"
                            @keyup.enter="criarAtividade">
                    </div>

                    <div class="modal-actions">
                        <button class="btn-cancelar" @click="fecharModalNovaAtividade">
                            Cancelar
                        </button>
                        <button class="btn-confirm" @click="criarAtividade" :disabled="!modalNovaAtividade.nome.trim()">
                            Criar Atividade
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="modalExclusaoAtividade.visible" class="modal-overlay" @click.self="cancelarExclusaoAtividade">
            <div class="modal-confirmacao">
                <div class="modal-icon">⚠️</div>
                <h3>Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir a atividade <strong>"{{ modalExclusaoAtividade.atividade?.nome }}"</strong>?</p>
                <p class="aviso">Esta ação não pode ser desfeita.</p>

                <div class="modal-actions">
                    <button class="btn-cancelar" @click="cancelarExclusaoAtividade">
                        Cancelar
                    </button>
                    <button class="btn-excluir" @click="excluirAtividade">
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '../store/themeStore';
import { notify } from '../services/notificationService';
import atividadeService from '../services/atividadeService'
import propostaService from '../services/propostaService';

const themeStore = useThemeStore();
const theme = computed(() => themeStore.theme);
const router = useRouter();

const propostasAceitas = ref([]);
const loading = ref(false);
const erro = ref(null);
const ultimaAtualizacao = ref('');

const atividadesPorProposta = ref({});
const carregandoAtividades = ref({});
const propostaExpandida = ref(null);

const modalNovaAtividade = ref({
    visible: false,
    propostaId: null,
    nome: ''
});

const modalExclusaoAtividade = ref({
    visible: false,
    atividade: null
});

const voltar = () => {
    router.push('/clientes');
};

const carregarPropostasAceitas = async () => {
    try {
        loading.value = true;
        erro.value = null;

        const response = await propostaService.getAceitas();
        const data = response.data || response;
        
        if (Array.isArray(data)) {
            propostasAceitas.value = data;
        } else {
            propostasAceitas.value = [];
        }

        ultimaAtualizacao.value = new Date().toLocaleTimeString('pt-BR');
        
        if (propostasAceitas.value.length > 0) {
            notify.success(`${propostasAceitas.value.length} propostas carregadas!`);
        } else {
            notify.info('Nenhuma proposta aceita encontrada.');
        }
        
    } catch {
        notify.error('Erro ao carregar propostas');
    } finally {
        loading.value = false;
    }
};

const carregarAtividades = async (id) => {
    try {
        carregandoAtividades.value[id] = true;

        const response = await atividadeService.getByProposta(id);
        const data = response.data || response;

        atividadesPorProposta.value[id] = Array.isArray(data)
            ? data.map(a => ({
                id: a.id,
                nome: a.nome,
                concluida: a.concluida,
                propostaId: a.propostaId || id
            }))
            : [];

    } catch {
        notify.error('Erro ao carregar atividades');
        atividadesPorProposta.value[id] = [];
    } finally {
        carregandoAtividades.value[id] = false;
    }
};

const alternarAtividades = async (id) => {
    if (propostaExpandida.value === id) {
        propostaExpandida.value = null;
    } else {
        propostaExpandida.value = id;
        await carregarAtividades(id);
    }
};

const getContadorConcluidas = (id) => {
    const atividades = atividadesPorProposta.value[id] || [];
    return atividades.filter(a => a.concluida).length;
};

const abrirModalNovaAtividade = (id) => {
    modalNovaAtividade.value = {
        visible: true,
        propostaId: id,
        nome: ''
    };
};

const fecharModalNovaAtividade = () => {
    modalNovaAtividade.value = {
        visible: false,
        propostaId: null,
        nome: ''
    };
};

const criarAtividade = async () => {
    try {
        const { propostaId, nome } = modalNovaAtividade.value;
        
        if (!nome.trim()) {
            notify.warning('Por favor, informe o nome da atividade');
            return;
        }
        
        const dadosAtividades = {
            propostaId: propostaId,
            nome: nome.trim()
        };
        
        const response = await atividadeService.criar(dadosAtividades);
        
        const novaAtividade = response.data || response;
        
        if (!atividadesPorProposta.value[propostaId]) {
            atividadesPorProposta.value[propostaId] = [];
        }
        
        atividadesPorProposta.value[propostaId].push({
            id: novaAtividade.id,
            nome: novaAtividade.nome,
            concluida: novaAtividade.concluida
        });
        
        fecharModalNovaAtividade();
        await carregarAtividades(propostaId);
        notify.success('Atividade criada com sucesso!');
        
    } catch (error) {
        notify.error(`Erro ao criar atividade: ${error.response?.data?.message || error.message}`);
    }
};

const alternarStatusAtividade = async (atividade) => {
    try {
        const novoStatus = !atividade.concluida;
        
        atividade.concluida = novoStatus;
        
        const updateAtividade = {
            id: atividade.id,
            concluida: novoStatus
        };
                
        await atividadeService.update(updateAtividade);
        
        notify.success(`Atividade ${novoStatus ? 'marcada como concluída' : 'desmarcada'}!`);
        
    } catch (error) {        
        atividade.concluida = !atividade.concluida;
        
        if (error.response?.status === 403) {
            notify.error('Acesso negado: você não tem permissão para alterar esta atividade');
        } else {
            notify.error(`Erro ao atualizar atividade: ${error.response?.data?.message || error.message}`);
        }
    }
};

const confirmarExclusaoAtividade = (atividade) => {
    modalExclusaoAtividade.value = {
        visible: true,
        atividade: atividade
    };
};

const cancelarExclusaoAtividade = () => {
    modalExclusaoAtividade.value = {
        visible: false,
        atividade: null
    };
};

const excluirAtividade = async () => {
    try {
        const { atividade } = modalExclusaoAtividade.value;
        
        await atividadeService.delete(atividade.id);
        
        const propostaId = propostaExpandida.value;
        if (atividadesPorProposta.value[propostaId]) {
            atividadesPorProposta.value[propostaId] = atividadesPorProposta.value[propostaId]
                .filter(a => a.id !== atividade.id);
        }
        
        cancelarExclusaoAtividade();
        notify.success('Atividade excluída com sucesso!');
        
    } catch (error) {        
        if (error.response?.status === 403) {
            notify.error('Acesso negado: você não tem permissão para excluir esta atividade');
        } else if (error.response?.status === 404) {
            notify.error('Atividade não encontrada');
        } else {
            notify.error(`Erro ao excluir atividade: ${error.response?.data?.message || error.message}`);
        }
    }
};

const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    } catch {
        return dataString;
    }
};

onMounted(() => {
    carregarPropostasAceitas();
});
</script>

<style scoped>
.atividades-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  transition: all 0.3s ease;
}

.atividades-container.light {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  color: #111;
}

.atividades-container.dark {
  background: linear-gradient(180deg, #111 0%, #1a1a1a 100%);
  color: #daa520;
}

.atividades-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 20px;
  width: 100%;
  max-width: 1200px;
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

.atividades-container.dark .btn-voltar {
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

.atividades-container.dark .icon-btn,
.atividades-container.dark .btn-refresh {
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

.atividades-container.dark .spinner {
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 20px 40px;
}

.propostas-grid {
  display: grid;
  gap: 20px;
}

.proposta-card {
  background: #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  transition: all .3s ease;
}

.atividades-container.dark .proposta-card {
  background: #222;
}

.proposta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  cursor: pointer;
  transition: background .3s ease;
}

.proposta-header:hover {
  background: rgba(0,0,0,0.05);
}

.atividades-container.dark .proposta-header:hover {
  background: rgba(255,255,255,0.05);
}

.proposta-info h3 {
  margin: 0;
  font-size: 1.2rem;
}

.proposta-metadata {
  margin-top: 8px;
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  opacity: 0.8;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.proposta-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-action {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all .3s ease;
}

.btn-add {
  background: #3b82f6;
  color: white;
}

.btn-add:hover {
  background: #2563eb;
}

.expand-icon {
  font-size: 0.9rem;
  opacity: 0.7;
  transition: transform .3s ease;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.atividades-lista {
  padding: 0 18px 18px;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.atividades-container.dark .atividades-lista {
  border-top-color: rgba(255,255,255,0.1);
}

.loading-atividades {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  justify-content: center;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.atividades-container.dark .spinner-small {
  border-top-color: #daa520;
}

.atividades-header-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-top: 16px;
}

.atividades-header-list h4 {
  margin: 0;
  font-size: 1.1rem;
}

.contador-atividades {
  background: #e5e7eb;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.atividades-container.dark .contador-atividades {
  background: #333;
}

.checklist-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checklist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  transition: all .3s ease;
}

.atividades-container.dark .checklist-item {
  background: #2a2a2a;
}

.checklist-item:hover {
  transform: translateX(4px);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

.checkbox-input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  transition: all .3s ease;
}

.checkbox-input:checked + .checkmark {
  background: #10b981;
  border-color: #10b981;
}

.checkbox-input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.atividade-nome {
  font-size: 0.95rem;
  transition: all .3s ease;
}

.atividade-nome.concluida {
  text-decoration: line-through;
  opacity: 0.6;
}

.btn-delete-atividade {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.6;
  transition: all .3s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.btn-delete-atividade:hover {
  opacity: 1;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.sem-atividades,
.sem-propostas {
  text-align: center;
  padding: 40px 20px;
}

.empty-state {
  opacity: 0.7;
}

.empty-state .empty-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.empty-state h4 {
  margin: 8px 0;
  font-size: 1.1rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
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
  z-index: 1000;
}

.modal-container,
.modal-confirmacao {
  width: 100%;
  max-width: 500px;
  background: #f8fafc;
  padding: 24px;
  border-radius: 14px;
  transition: all .3s ease;
}

.atividades-container.dark .modal-container,
.atividades-container.dark .modal-confirmacao {
  background: #222;
  color: #daa520;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity .3s ease;
}

.btn-close:hover {
  opacity: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all .3s ease;
  box-sizing: border-box;
}

.atividades-container.dark .form-input {
  background: #333;
  border-color: #444;
  color: #daa520;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px;
  background: #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
}

.atividades-container.dark .form-info {
  background: #333;
}

.info-icon {
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancelar {
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  transition: all .3s ease;
}

.atividades-container.dark .btn-cancelar {
  border-color: #444;
}

.btn-cancelar:hover {
  background: #e5e7eb;
}

.atividades-container.dark .btn-cancelar:hover {
  background: #333;
}

.btn-confirm {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all .3s ease;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-confirm:hover:not(:disabled) {
  background: #2563eb;
}

.btn-excluir {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: #ef4444;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all .3s ease;
}

.btn-excluir:hover {
  background: #dc2626;
}

.modal-confirmacao .modal-icon {
  font-size: 2.4rem;
  margin-bottom: 16px;
  text-align: center;
}

.modal-confirmacao h3 {
  margin: 0 0 12px 0;
  font-size: 1.3rem;
  text-align: center;
}

.modal-confirmacao p {
  margin: 0 0 12px 0;
  text-align: center;
}

.aviso {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-top: 16px !important;
}
</style>