<template>
    <div class="modal-backdrop" @click.self="closeModal" :class="theme">
        <div class="modal" :class="theme">
            <div class="modal-header">
                <h3>Gerenciar Colaboradores</h3>
                <button class="close-btn" @click="closeModal">×</button>
            </div>

            <div class="modal-content">
                <div class="add-section">
                    <h4>Adicionar Novo Colaborador</h4>
                    <form @submit.prevent="handleSubmit" class="add-form">
                        <div class="form-group">
                            <label>Nome *</label>
                            <input v-model="form.nome" placeholder="Digite o nome do colaborador" required
                                :disabled="loading" ref="nomeInput" />
                        </div>

                        <div class="form-group">
                            <label>Telefone *</label>
                            <input v-model="form.telefone" placeholder="(00) 00000-0000" required :disabled="loading" />
                        </div>

                        <div class="form-group">
                            <label>Função *</label>
                            <input v-model="form.funcao" list="funcoes-list"
                                placeholder="Selecione ou digite uma nova função" required
                                :disabled="loading || loadingFuncoes" class="funcao-input" />
                            <datalist id="funcoes-list">
                                <option v-for="funcao in funcoes" :key="funcao.id || funcao.key"
                                    :value="funcao.nome || funcao.value">
                                    {{ funcao.nome || funcao.value }}
                                </option>
                            </datalist>
                            <small v-if="loadingFuncoes" class="loading">Carregando funções...</small>
                            <small v-if="!loadingFuncoes && funcoes.length === 0" class="info">
                                Nenhuma função cadastrada. Digite uma nova função.
                            </small>
                        </div>

                        <button type="submit" class="btn-submit" :disabled="loading || loadingFuncoes">
                            <span v-if="loading">Criando...</span>
                            <span v-else>Criar Colaborador</span>
                        </button>
                    </form>
                </div>

                <div class="list-section">
                    <div class="list-header">
                        <h4>Colaboradores Cadastrados</h4>
                        <div class="list-controls">
                            <select v-model="filtroFuncao" @change="filtrarColaboradores" class="filter-select">
                                <option value="">Todas as funções</option>
                                <option v-for="funcao in funcoesUnicas" :key="funcao" :value="funcao">
                                    {{ funcao }}
                                </option>
                            </select>
                            <button class="btn-refresh" @click="carregarColaboradores" :disabled="loadingList"
                                title="Atualizar lista">
                                <span v-if="loadingList">⟳</span>
                                <span v-else>↻</span>
                            </button>
                        </div>
                    </div>

                    <div class="colaboradores-list" v-if="!loadingList && colaboradoresFiltrados.length > 0">
                        <div v-for="colaborador in colaboradoresFiltrados" :key="colaborador.id"
                            class="colaborador-item">
                            <div class="colaborador-info">
                                <div class="colaborador-nome">{{ colaborador.nome }}</div>
                                <div class="colaborador-funcao">
                                    <span class="funcao-badge">
                                        {{ colaborador.funcao }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="empty-state" v-else-if="!loadingList && colaboradoresFiltrados.length === 0">
                        <div v-if="filtroFuncao">
                            Nenhum colaborador com a função selecionada.
                        </div>
                        <div v-else>
                            Nenhum colaborador cadastrado ainda.
                        </div>
                    </div>

                    <div class="loading-state" v-else>
                        Carregando colaboradores...
                    </div>

                    <div class="list-info">
                        <small>
                            Total: {{ colaboradoresFiltrados.length }} colaborador(es)
                            <span v-if="filtroFuncao"> (filtrado)</span>
                        </small>
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-cancel" @click="closeModal">Fechar</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import colaboradorService from "../../services/colaboradorService";
import { notify } from '../../services/notificationService';

const emit = defineEmits(["close", "created"]);

const themeStore = useThemeStore();
const authStore = useAuthStore();
const theme = computed(() => themeStore.theme);

const funcoes = ref([]);
const colaboradores = ref([]);
const form = ref({
    nome: "",
    telefone: "",
    funcao: ""
});

const filtroFuncao = ref("");
const loading = ref(false);
const loadingList = ref(false);
const loadingFuncoes = ref(false);
const nomeInput = ref(null);

const empresaId = computed(() => authStore.empresa?.empresaId);

onMounted(() => {
    carregarDados();
});

const carregarDados = async () => {
    await Promise.all([carregarFuncoes(), carregarColaboradores()]);
};

const carregarFuncoes = async () => {
    try {
        loadingFuncoes.value = true;
        const response = await colaboradorService.listarFuncoes();

        if (response.data && Array.isArray(response.data)) {
            if (typeof response.data[0] === 'string') {
                funcoes.value = response.data.map(funcao => ({
                    nome: funcao,
                    key: funcao.toUpperCase().replace(/\s+/g, '_')
                }));
            }
            else if (typeof response.data[0] === 'object') {
                funcoes.value = response.data.map(item => {
                    const keys = Object.keys(item);
                    if (keys.length > 0) {
                        return {
                            key: keys[0],
                            value: item[keys[0]],
                            nome: item[keys[0]]
                        };
                    }
                    return null;
                }).filter(item => item !== null);
            }
            else if (response.data[0] && response.data[0].nome) {
                funcoes.value = response.data;
            }
        } else {
            notify.error('Formato inesperado de resposta');
            funcoes.value = []; 
        }

    } catch (err) {
        notify.error('Erro ao carregar funções');
        funcoes.value = [];
    } finally {
        loadingFuncoes.value = false;
    }
};

const carregarColaboradores = async () => {
    if (!empresaId.value) return;

    try {
        loadingList.value = true;
        const response = await colaboradorService.listarPorEmpresa(empresaId.value);
        colaboradores.value = response.data || [];

        atualizarFuncoesUnicas();
    } catch (err) {
        notify.error('Erro ao carregar colaboradores');
    } finally {
        loadingList.value = false;
    }
};

const atualizarFuncoesUnicas = () => {
    const funcoesExistentes = [...new Set(colaboradores.value.map(c => c.funcao).filter(Boolean))];

    funcoesExistentes.forEach(funcao => {
        if (!funcoes.value.some(f => f.nome === funcao || f.value === funcao)) {
            funcoes.value.push({
                nome: funcao,
                key: funcao.toUpperCase().replace(/\s+/g, '_'),
                value: funcao
            });
        }
    });
};

const funcoesUnicas = computed(() => {
    const todasFuncoes = funcoes.value.map(f => f.nome || f.value).filter(Boolean);
    return [...new Set(todasFuncoes)];
});

const colaboradoresFiltrados = computed(() => {
    if (!filtroFuncao.value) {
        return colaboradores.value;
    }
    return colaboradores.value.filter(colaborador => colaborador.funcao === filtroFuncao.value);
});

const filtrarColaboradores = () => {
};

const handleSubmit = async () => {
    if (!form.value.nome.trim()) {
        notify.error('Por favor, informe o nome do colaborador');
        return;
    }

    if (!form.value.telefone.trim()) {
        notify.error('Por favor, informe o telefone');
        return;
    }

    if (!form.value.funcao) {
        notify.error('Por favor, selecione ou digite uma função');
        return;
    }

    if (!empresaId.value) {
        notify.error('Empresa não identificada');
        return;
    }

    try {
        loading.value = true;

        const dados = {
            empresaId: empresaId.value,
            nome: form.value.nome.trim(),
            telefone: form.value.telefone.trim(),
            funcao: form.value.funcao.trim()
        };

        await colaboradorService.criar(dados);

        notify.success('Colaborador criado com sucesso!');

        const novaFuncao = dados.funcao;
        const funcaoExiste = funcoes.value.some(f =>
            (f.nome && f.nome.toLowerCase() === novaFuncao.toLowerCase()) ||
            (f.value && f.value.toLowerCase() === novaFuncao.toLowerCase())
        );

        if (!funcaoExiste) {
            funcoes.value.push({
                nome: novaFuncao,
                key: novaFuncao.toUpperCase().replace(/\s+/g, '_'),
                value: novaFuncao
            });
        }

        form.value.nome = "";
        form.value.telefone = "";
        form.value.funcao = "";

        await nextTick();
        if (nomeInput.value) {
            nomeInput.value.focus();
        }

        await carregarColaboradores();

        emit("created");
    } catch (err) {
        notify.error('Erro ao criar colaborador');
    } finally {
        loading.value = false;
    }
};

const closeModal = () => {
    emit("close");
};
</script>

<style scoped>
.funcao-badge {
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: #3b82f6;
    color: white;
}

.funcao-badge {
    background: var(--funcao-color, #3b82f6);
}

.modal.dark .funcao-badge {
    opacity: 0.9;
}

small.info {
    display: block;
    margin-top: 4px;
    font-size: 0.8rem;
    color: #6b7280;
    font-style: italic;
}

.modal.dark small.info {
    color: #9ca3af;
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    transition: all 0.3s ease;
}

.modal-backdrop.light {
    background: rgba(0, 0, 0, 0.35);
}

.modal-backdrop.dark {
    background: rgba(0, 0, 0, 0.6);
}

.modal {
    width: 900px;
    max-width: 95vw;
    max-height: 85vh;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    overflow: hidden;
}

.modal.light {
    background: #fff;
}

.modal.dark {
    background: #1a1a1a;
    border: 1px solid #333;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid;
}

.modal.light .modal-header {
    border-color: #e6e6e6;
}

.modal.dark .modal-header {
    border-color: #333;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    transition: color 0.3s ease;
}

.modal.light .modal-header h3 {
    color: #111;
}

.modal.dark .modal-header h3 {
    color: #daa520;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.modal.light .close-btn {
    color: #666;
}

.modal.light .close-btn:hover {
    background: #f5f5f5;
    color: #333;
}

.modal.dark .close-btn {
    color: #daa520;
}

.modal.dark .close-btn:hover {
    background: #333;
    color: #fff;
}

.modal-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 24px;
    flex: 1;
    overflow: hidden;
}

.add-section,
.list-section {
    display: flex;
    flex-direction: column;
}

.add-section h4,
.list-section h4 {
    margin: 0 0 16px 0;
    font-size: 1.1rem;
    font-weight: 600;
    transition: color 0.3s ease;
}

.modal.light .add-section h4,
.modal.light .list-section h4 {
    color: #333;
}

.modal.dark .add-section h4,
.modal.dark .list-section h4 {
    color: #daa520;
}

.add-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-size: 0.85rem;
    font-weight: 500;
    transition: color 0.3s ease;
}

.modal.light .form-group label {
    color: #333;
}

.modal.dark .form-group label {
    color: #daa520;
}

input,
select {
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
}

.modal.light input,
.modal.light select {
    border-color: #e6e6e6;
    background: #fff;
    color: #333;
}

.modal.light input:focus,
.modal.light select:focus {
    border-color: #daa520;
    outline: none;
    box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.1);
}

.modal.dark input,
.modal.dark select {
    border-color: #444;
    background: #2a2a2a;
    color: #daa520;
}

.modal.dark input:focus,
.modal.dark select:focus {
    border-color: #daa520;
    outline: none;
    box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.2);
}

small.loading {
    color: #666;
    font-style: italic;
}

.modal.dark small.loading {
    color: #888;
}

.add-section .btn-submit {
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    background: #111;
    color: #fff;
    margin-top: 8px;
}

.modal.light .add-section .btn-submit {
    background: #111;
}

.modal.light .add-section .btn-submit:hover:not(:disabled) {
    background: #333;
}

.modal.dark .add-section .btn-submit {
    background: #daa520;
    color: #111;
}

.modal.dark .add-section .btn-submit:hover:not(:disabled) {
    background: #e6b800;
    box-shadow: 0 4px 12px rgba(218, 165, 32, 0.3);
}

.btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.modal.dark .success-message {
    background: #059669;
}

.modal.dark .error-message {
    background: #c53030;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.list-controls {
    display: flex;
    gap: 8px;
    align-items: center;
}

.filter-select {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid;
    font-size: 0.85rem;
    min-width: 160px;
}

.modal.light .filter-select {
    border-color: #e6e6e6;
    background: #fff;
    color: #333;
}

.modal.dark .filter-select {
    border-color: #444;
    background: #2a2a2a;
    color: #daa520;
}

.btn-refresh {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.modal.light .btn-refresh {
    color: #666;
}

.modal.light .btn-refresh:hover:not(:disabled) {
    background: #f5f5f5;
    color: #333;
}

.modal.dark .btn-refresh {
    color: #888;
}

.modal.dark .btn-refresh:hover:not(:disabled) {
    background: #333;
    color: #daa520;
}

.btn-refresh:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.btn-refresh span {
    display: inline-block;
}

.btn-refresh:disabled span {
    animation: spin 1s linear infinite;
}

.colaboradores-list {
    flex: 1;
    overflow-y: auto;
    border: 1px solid;
    border-radius: 8px;
    padding: 8px;
    min-height: 250px;
    max-height: 350px;
}

.modal.light .colaboradores-list {
    border-color: #e6e6e6;
    background: #fafafa;
}

.modal.dark .colaboradores-list {
    border-color: #444;
    background: #2a2a2a;
}

.colaborador-item {
    padding: 12px;
    border-bottom: 1px solid;
    transition: all 0.3s ease;
}

.modal.light .colaborador-item {
    border-color: #f0f0f0;
}

.modal.dark .colaborador-item {
    border-color: #444;
}

.colaborador-item:last-child {
    border-bottom: none;
}

.colaborador-info {
    flex: 1;
}

.colaborador-nome {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 4px;
    transition: color 0.3s ease;
}

.modal.light .colaborador-nome {
    color: #333;
}

.modal.dark .colaborador-nome {
    color: #daa520;
}

.colaborador-funcao {
    display: flex;
    gap: 4px;
}

.modal.light .colaborador-item:hover {
    background: #f8f9fa;
}

.modal.dark .colaborador-item:hover {
    background: #333;
}

.empty-state,
.loading-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed;
    border-radius: 8px;
    padding: 40px 20px;
    text-align: center;
    font-style: italic;
    min-height: 250px;
    max-height: 350px;
}

.modal.light .empty-state,
.modal.light .loading-state {
    border-color: #e6e6e6;
    color: #666;
    background: #fafafa;
}

.modal.dark .empty-state,
.modal.dark .loading-state {
    border-color: #444;
    color: #888;
    background: #2a2a2a;
}

.list-info {
    margin-top: 12px;
    text-align: center;
}

.list-info small {
    font-size: 0.8rem;
    opacity: 0.7;
}

.modal.light .list-info small {
    color: #666;
}

.modal.dark .list-info small {
    color: #888;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    padding: 20px 24px;
    border-top: 1px solid;
}

.modal.light .modal-actions {
    border-color: #f0f0f0;
    background: #fafafa;
}

.modal.dark .modal-actions {
    border-color: #333;
    background: #2a2a2a;
}

.btn-cancel {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    min-width: 100px;
    background: transparent;
    border: 1px solid;
}

.modal.light .btn-cancel {
    border-color: #ddd;
    color: #666;
}

.modal.light .btn-cancel:hover {
    background: #f8f9fa;
    border-color: #ccc;
}

.modal.dark .btn-cancel {
    border-color: #444;
    color: #daa520;
}

.modal.dark .btn-cancel:hover {
    background: #333;
    border-color: #555;
}

@media (max-width: 768px) {
    .modal {
        width: 95vw;
        max-height: 90vh;
    }

    .modal-content {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .colaboradores-list {
        min-height: 200px;
        max-height: 250px;
    }

    .empty-state,
    .loading-state {
        min-height: 200px;
    }

    .list-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .list-controls {
        width: 100%;
        justify-content: space-between;
    }
}
</style>