<template>
    <div class="modal-backdrop" @click.self="closeModal" :class="theme">
        <div class="modal" :class="theme">
            <div class="modal-header">
                <h3>Gerenciar Consultores</h3>
                <button class="close-btn" @click="closeModal">×</button>
            </div>

            <div class="modal-content">
                <!-- Lado esquerdo: Adicionar consultor -->
                <div class="add-section">
                    <h4>Adicionar Novo Consultor</h4>
                    <form @submit.prevent="handleSubmit" class="add-form">
                        <div class="form-group">
                            <label>Nome *</label>
                            <input v-model="form.nome" placeholder="Digite o nome do consultor" required
                                :disabled="loading" ref="nomeInput" />
                        </div>

                        <div class="form-group">
                            <label>Telefone *</label>
                            <input v-model="form.telefone" placeholder="(00) 00000-0000" required :disabled="loading" />
                        </div>

                        <div class="form-group">
                            <label>Tipo de Consultor *</label>
                            <select v-model="form.tipoConsultor" required :disabled="loading || loadingTipos">
                                <option value="">Selecione o tipo</option>
                                <option v-for="tipo in tiposConsultor" :key="tipo.key" :value="tipo.key">
                                    {{ tipo.value }}
                                </option>
                            </select>
                            <small v-if="loadingTipos" class="loading">Carregando tipos...</small>
                        </div>

                        <button type="submit" class="btn-submit" :disabled="loading || loadingTipos">
                            <span v-if="loading">Criando...</span>
                            <span v-else>Criar Consultor</span>
                        </button>

                        <div v-if="successMessage" class="success-message">
                            ✓ {{ successMessage }}
                        </div>

                        <div v-if="errorMessage" class="error-message">
                            ✗ {{ errorMessage }}
                        </div>
                    </form>
                </div>

                <!-- Lado direito: Listar consultores -->
                <!-- Lado direito: Listar consultores -->
                <div class="list-section">
                    <div class="list-header">
                        <h4>Consultores Cadastrados</h4>
                        <div class="list-controls">
                            <select v-model="filtroTipo" @change="filtrarConsultores" class="filter-select">
                                <option value="">Todos os tipos</option>
                                <option v-for="tipo in tiposConsultor" :key="tipo.key" :value="tipo.key">
                                    {{ tipo.value }}
                                </option>
                            </select>
                            <button class="btn-refresh" @click="carregarConsultores" :disabled="loadingList"
                                title="Atualizar lista">
                                <span v-if="loadingList">⟳</span>
                                <span v-else>↻</span>
                            </button>
                        </div>
                    </div>

                    <div class="consultores-list" v-if="!loadingList && consultoresFiltrados.length > 0">
                        <div v-for="consultor in consultoresFiltrados" :key="consultor.id" class="consultor-item">
                            <div class="consultor-nome">{{ consultor.nome }}</div>
                            <div class="consultor-tipo">
                                <span class="tipo-badge" :class="getTipoClass(consultor.tipoConsultor)">
                                    {{ getDescricaoTipo(consultor.tipoConsultor) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="empty-state" v-else-if="!loadingList && consultoresFiltrados.length === 0">
                        <div v-if="filtroTipo">
                            Nenhum consultor do tipo selecionado.
                        </div>
                        <div v-else>
                            Nenhum consultor cadastrado ainda.
                        </div>
                    </div>

                    <div class="loading-state" v-else>
                        Carregando consultores...
                    </div>

                    <div class="list-info">
                        <small>
                            Total: {{ consultoresFiltrados.length }} consultor(es)
                            <span v-if="filtroTipo"> (filtrado)</span>
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
import consultorService from "../../services/consultorService";

const emit = defineEmits(["close", "created"]);

const themeStore = useThemeStore();
const authStore = useAuthStore();
const theme = computed(() => themeStore.theme);

const tiposConsultor = ref([]);
const consultores = ref([]);
const form = ref({
    nome: "",
    telefone: "",
    tipoConsultor: ""
});

const filtroTipo = ref("");
const loading = ref(false);
const loadingList = ref(false);
const loadingTipos = ref(false);
const nomeInput = ref(null);
const successMessage = ref("");
const errorMessage = ref("");

// Campos dinâmicos baseados na estrutura do retorno
const tipoEnumField = ref("CONSULTOR"); // Campo do enum name
const tipoDescricaoField = ref("Consultor"); // Campo da descrição

const empresaId = computed(() => authStore.empresa?.empresaId);

// Carregar dados ao abrir o modal
onMounted(() => {
    carregarDados();
});

const carregarDados = async () => {
    await Promise.all([carregarTiposConsultor(), carregarConsultores()]);
};

const carregarTiposConsultor = async () => {
    try {
        loadingTipos.value = true;
        const response = await consultorService.listarTiposConsultor();

        // O backend retorna: [{"CONSULTOR":"Consultor"},{"INSTRUTOR":"Instrutor"},{"PALESTRANTE":"Palestrante"}]
        // Cada item é um objeto com uma única propriedade {chave: valor}

        if (response.data && Array.isArray(response.data)) {
            // Transformar cada item do array
            tiposConsultor.value = response.data.map(item => {
                // Cada item tem formato: {"CONSULTOR": "Consultor"}
                const keys = Object.keys(item);
                if (keys.length > 0) {
                    const key = keys[0];
                    return {
                        key: key, // ex: "CONSULTOR"
                        value: item[key] // ex: "Consultor"
                    };
                }
                return null;
            }).filter(item => item !== null); // Remove possíveis valores nulos

            console.log("Tipos de consultor processados:", tiposConsultor.value);
        } else {
            console.error("Formato inesperado de resposta:", response.data);
            // Fallback para os tipos padrão
            tiposConsultor.value = [
                { key: "CONSULTOR", value: "Consultor" },
                { key: "INSTRUTOR", value: "Instrutor" },
                { key: "PALESTRANTE", value: "Palestrante" }
            ];
        }

    } catch (err) {
        console.error("Erro ao carregar tipos de consultor:", err);
        // Fallback para os tipos padrão se a API falhar
        tiposConsultor.value = [
            { key: "CONSULTOR", value: "Consultor" },
            { key: "INSTRUTOR", value: "Instrutor" },
            { key: "PALESTRANTE", value: "Palestrante" }
        ];
        errorMessage.value = "Erro ao carregar tipos de consultor. Usando tipos padrão.";
        setTimeout(() => errorMessage.value = "", 3000);
    } finally {
        loadingTipos.value = false;
    }
};

const carregarConsultores = async () => {
    if (!empresaId.value) return;

    try {
        loadingList.value = true;
        const response = await consultorService.listarPorEmpresa(empresaId.value);
        consultores.value = response.data || [];
    } catch (err) {
        console.error("Erro ao carregar consultores:", err);
        errorMessage.value = "Erro ao carregar consultores: " + (err.response?.data?.message || err.message);
        setTimeout(() => errorMessage.value = "", 3000);
    } finally {
        loadingList.value = false;
    }
};

// Consultores filtrados
const consultoresFiltrados = computed(() => {
    if (!filtroTipo.value) {
        return consultores.value;
    }
    return consultores.value.filter(consultor => consultor.tipoConsultor === filtroTipo.value);
});

const filtrarConsultores = () => {
    // Apenas atualiza a lista filtrada (já é computed)
};

// Obter a descrição do tipo baseado no enum
const getDescricaoTipo = (tipoEnum) => {
    if (!tipoEnum) return "";
    const tipo = tiposConsultor.value.find(t => t.key === tipoEnum);
    return tipo ? tipo.value : tipoEnum;
};

const getTipoClass = (tipo) => {
    // Classes CSS baseadas no tipo
    const tipoClasses = {
        'CONSULTOR': 'tipo-consultor',
        'INSTRUTOR': 'tipo-instrutor',
        'PALESTRANTE': 'tipo-palestrante',
        'default': 'tipo-default'
    };
    return tipoClasses[tipo] || tipoClasses.default;
};

const handleSubmit = async () => {
    if (!form.value.nome.trim()) {
        errorMessage.value = "Por favor, informe o nome do consultor";
        setTimeout(() => errorMessage.value = "", 3000);
        return;
    }

    if (!form.value.telefone.trim()) {
        errorMessage.value = "Por favor, informe o telefone";
        setTimeout(() => errorMessage.value = "", 3000);
        return;
    }

    if (!form.value.tipoConsultor) {
        errorMessage.value = "Por favor, selecione o tipo de consultor";
        setTimeout(() => errorMessage.value = "", 3000);
        return;
    }

    if (!empresaId.value) {
        errorMessage.value = "Empresa não identificada";
        setTimeout(() => errorMessage.value = "", 3000);
        return;
    }

    try {
        loading.value = true;
        successMessage.value = "";
        errorMessage.value = "";

        const dados = {
            empresaId: empresaId.value,
            nome: form.value.nome.trim(),
            telefone: form.value.telefone.trim(),
            tipoConsultor: form.value.tipoConsultor
        };

        console.log("Enviando dados:", dados);
        await consultorService.criar(dados);

        // Exibir mensagem de sucesso
        successMessage.value = "Consultor criado com sucesso!";

        // Limpar formulário
        form.value.nome = "";
        form.value.telefone = "";
        form.value.tipoConsultor = "";

        // Focar novamente no campo de entrada
        await nextTick();
        if (nomeInput.value) {
            nomeInput.value.focus();
        }

        // Recarregar lista de consultores
        await carregarConsultores();

        // Emitir evento para o componente pai
        emit("created");

        // Limpar mensagem de sucesso após alguns segundos
        setTimeout(() => {
            successMessage.value = "";
        }, 3000);

    } catch (err) {
        console.error("Erro ao criar consultor:", err);
        console.log("Status:", err.response?.status);
        console.log("Dados do erro:", err.response?.data);

        let mensagemErro = "Erro ao criar consultor";
        if (err.response?.data?.message) {
            mensagemErro += ": " + err.response.data.message;
        } else if (err.message) {
            mensagemErro += ": " + err.message;
        }

        errorMessage.value = mensagemErro;
        setTimeout(() => errorMessage.value = "", 5000);
    } finally {
        loading.value = false;
    }
};

const closeModal = () => {
    emit("close");
};
</script>

<style scoped>
/* Mantenha o mesmo CSS, apenas ajuste as cores dos badges */

.tipo-consultor {
    background: #10b981;
}

.modal.dark .tipo-consultor {
    background: #059669;
}

.tipo-instrutor {
    background: #3b82f6;
}

.modal.dark .tipo-instrutor {
    background: #1d4ed8;
}

.tipo-palestrante {
    background: #8b5cf6;
}

.modal.dark .tipo-palestrante {
    background: #6d28d9;
}

.tipo-default {
    background: #6b7280;
}

.modal.dark .tipo-default {
    background: #4b5563;
}

/* O restante do CSS permanece igual ao anterior */
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

.success-message {
    padding: 10px 12px;
    border-radius: 6px;
    background: #10b981;
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
    animation: fadeIn 0.3s ease;
    margin-top: 8px;
}

.error-message {
    padding: 10px 12px;
    border-radius: 6px;
    background: #e53e3e;
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
    animation: fadeIn 0.3s ease;
    margin-top: 8px;
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

/* List section styles */
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
    min-width: 150px;
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

.consultores-list {
    flex: 1;
    overflow-y: auto;
    border: 1px solid;
    border-radius: 8px;
    padding: 8px;
    min-height: 250px;
    max-height: 350px;
}

.modal.light .consultores-list {
    border-color: #e6e6e6;
    background: #fafafa;
}

.modal.dark .consultores-list {
    border-color: #444;
    background: #2a2a2a;
}

.consultor-item {
    padding: 12px;
    border-bottom: 1px solid;
    transition: all 0.3s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal.light .consultor-item {
    border-color: #f0f0f0;
}

.modal.dark .consultor-item {
    border-color: #444;
}

.consultor-item:last-child {
    border-bottom: none;
}

.consultor-info {
    flex: 1;
}

.consultor-nome {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 4px;
    transition: color 0.3s ease;
}

.modal.light .consultor-nome {
    color: #333;
}

.modal.dark .consultor-nome {
    color: #daa520;
}

.consultor-telefone {
    font-size: 0.85rem;
    color: #666;
}

.modal.dark .consultor-telefone {
    color: #888;
}

.consultor-tipo {
    display: flex;
    gap: 4px;
}

.tipo-badge {
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.modal.light .tipo-badge {
    color: white;
}

.modal.dark .tipo-badge {
    color: white;
}

.modal.light .consultor-item:hover {
    background: #f8f9fa;
}

.modal.dark .consultor-item:hover {
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

/* Responsivo */
@media (max-width: 768px) {
    .modal {
        width: 95vw;
        max-height: 90vh;
    }

    .modal-content {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .consultores-list {
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

    .consultor-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .consultor-telefone {
        align-self: flex-start;
    }
}
</style>