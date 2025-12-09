<template>
    <div class="modal-backdrop" @click.self="$emit('close')" :class="theme">
        <div class="modal" :class="theme">
            <div class="modal-header">
                <h3>Detalhes do Cliente</h3>
                <button class="close-btn" @click="$emit('close')">×</button>
            </div>

            <div class="modal-content">
                <!-- Informações do Cliente -->
                <div class="cliente-info-section">
                    <h4>Informações do Cliente</h4>

                    <div class="info-grid">
                        <!-- Nome -->
                        <div class="info-item">
                            <span class="info-label">Nome:</span>
                            <span class="info-value">{{ cliente.nome || cliente.responsavel || 'Não informado' }}</span>
                        </div>

                        <!-- Responsável (somente PJ) -->
                        <div v-if="cliente.tipoPessoa === 'PJ'" class="info-item">
                            <span class="info-label">Responsável:</span>
                            <span class="info-value">{{ cliente.responsavel || 'Não informado' }}</span>
                        </div>

                        <!-- Email -->
                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value">{{ cliente.email || 'Não informado' }}</span>
                        </div>

                        <!-- Telefone -->
                        <div class="info-item">
                            <span class="info-label">Telefone:</span>
                            <span class="info-value">{{ formatarTelefone(cliente.telefone) || 'Não informado' }}</span>
                        </div>

                        <!-- CNPJ (somente PJ) -->
                        <div v-if="cliente.tipoPessoa === 'PJ'" class="info-item">
                            <span class="info-label">CNPJ:</span>
                            <span class="info-value">{{ formatarCNPJ(cliente.cnpj) || 'Não informado' }}</span>
                        </div>

                        <!-- CPF e Idade (somente PF) -->
                        <div v-if="cliente.tipoPessoa === 'PF'" class="info-row">
                            <div class="info-item">
                                <span class="info-label">CPF:</span>
                                <span class="info-value">{{ formatarCPF(cliente.cpf) || 'Não informado' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Idade:</span>
                                <span class="info-value">{{ cliente.idade || calcularIdade(cliente.dataNascimento) ||
                                    'Não informada' }} anos</span>
                            </div>
                        </div>

                        <!-- Endereço -->
                        <div class="info-item full-width">
                            <span class="info-label">Endereço:</span>
                            <span class="info-value">
                                {{ [cliente.logradouro, cliente.numero].filter(Boolean).join(', ') || 'Logradouro não informado' }}<br>
                                {{ cliente.bairro || 'Bairro não informado' }}<br>
                                {{ [cliente.localidade, cliente.uf].filter(Boolean).join('/') || 'Cidade/UF não informados' }}
                            </span>
                        </div>

                        <!-- CEP -->
                        <div class="info-item">
                            <span class="info-label">CEP:</span>
                            <span class="info-value">{{ formatarCEP(cliente.cep) || 'Não informado' }}</span>
                        </div>

                        <!-- Tipo de Pessoa -->
                        <div class="info-item">
                            <span class="info-label">Tipo:</span>
                            <span class="info-value tipo-badge" :class="cliente.tipoPessoa">
                                {{ cliente.tipoPessoa === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica' }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Lista de Propostas -->
                <div class="propostas-section">
                    <div class="section-header">
                        <h4>Propostas do Cliente</h4>
                        <span class="propostas-count">{{ propostas.length }} proposta(s)</span>
                    </div>

                    <div v-if="loadingPropostas" class="loading-propostas">
                        <span>Carregando propostas...</span>
                    </div>

                    <div v-else-if="propostas.length === 0" class="empty-propostas">
                        <span>Nenhuma proposta cadastrada para este cliente.</span>
                    </div>

                    <div v-else class="propostas-list">
                        <div v-for="(proposta, index) in propostas" :key="proposta.id" class="proposta-item">
                            <div class="proposta-simples">
                                <span class="proposta-numero">Proposta {{ index + 1 }}</span>
                                <span class="proposta-data">{{ formatarData(proposta.dataCriacao) }}</span>
                                <button class="btn-documento" @click="abrirDocumentoModal(proposta)">
                                    📄 Ver Documento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-close" @click="$emit('close')">Fechar</button>
            </div>
        </div>
    </div>

    <DocumentoModal 
        v-if="showDocumentoModal && propostaSelecionada"
        :proposta="propostaSelecionada"
        @close="showDocumentoModal = false"
    />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import propostaService from "../../services/propostaService";
import DocumentoModal from "../componentes/DocumentoModal.vue";

const props = defineProps({
    cliente: { type: Object, required: true }
});

const emit = defineEmits(["close"]);

const themeStore = useThemeStore();
const authStore = useAuthStore();
const theme = computed(() => themeStore.theme);

const propostas = ref([]);
const loadingPropostas = ref(false);

const showDocumentoModal = ref(false);
const propostaSelecionada = ref(null);

const abrirDocumentoModal = (proposta) => {
    propostaSelecionada.value = proposta;
    showDocumentoModal.value = true;
};

// Carregar propostas do cliente
const carregarPropostas = async () => {
    try {
        loadingPropostas.value = true;

        const empresaId = authStore.empresa?.empresaId;
        const clienteId = props.cliente.id;
        if (!empresaId) {
            console.error("EmpresaId não encontrado");
            return;
        }

        console.log(`Buscando propostas: /propostas/${empresaId}/${clienteId}`);
        const response = await propostaService.listarPorCliente(empresaId, props.cliente.id);
        propostas.value = response.data || [];
        console.log("Propostas carregadas:", propostas.value);
    } catch (err) {
        console.error("Erro ao carregar propostas:", err);
        console.log("Status:", err.response?.status);
        console.log("URL:", err.config?.url);
        console.log("Dados do erro:", err.response?.data);
        propostas.value = [];
    } finally {
        loadingPropostas.value = false;
    }
};

// Funções de formatação
const formatarTelefone = (telefone) => {
    if (!telefone) return '';
    const numeros = telefone.replace(/\D/g, '');

    if (numeros.length === 10) {
        return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
    } else if (numeros.length === 11) {
        return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
    }

    return telefone;
};

const formatarCPF = (cpf) => {
    if (!cpf) return '';
    const numeros = cpf.replace(/\D/g, '');

    if (numeros.length === 11) {
        return `${numeros.substring(0, 3)}.${numeros.substring(3, 6)}.${numeros.substring(6, 9)}-${numeros.substring(9)}`;
    }

    return cpf;
};

const formatarCNPJ = (cnpj) => {
    if (!cnpj) return '';
    const numeros = cnpj.replace(/\D/g, '');

    if (numeros.length === 14) {
        return `${numeros.substring(0, 2)}.${numeros.substring(2, 5)}.${numeros.substring(5, 8)}/${numeros.substring(8, 12)}-${numeros.substring(12)}`;
    }

    return cnpj;
};

const formatarCEP = (cep) => {
    if (!cep) return '';
    const numeros = cep.replace(/\D/g, '');

    if (numeros.length === 8) {
        return `${numeros.substring(0, 5)}-${numeros.substring(5)}`;
    }

    return cep;
};

const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return null;

    try {
        const nascimento = new Date(dataNascimento);
        const hoje = new Date();

        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();

        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }

        return idade;
    } catch (err) {
        console.error("Erro ao calcular idade:", err);
        return null;
    }
};

const formatarData = (dataString) => {
    if (!dataString) return '';

    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (err) {
        console.error("Erro ao formatar data:", err);
        return dataString;
    }
};

// Carregar propostas quando o modal for aberto
onMounted(() => {
    carregarPropostas();
});
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
    transition: all 0.3s ease;
}

.modal-backdrop.light {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.modal-backdrop.dark {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(6px);
}

.modal {
    width: 600px;
    max-width: 95vw;
    max-height: 85vh;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;
}

.modal.light {
    background: #fff;
    color: #333;
}

.modal.dark {
    background: #1e1e1e;
    color: #f0f0f0;
    border: 1px solid #333;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    border-bottom: 1px solid;
}

.modal.light .modal-header {
    border-color: #e5e7eb;
}

.modal.dark .modal-header {
    border-color: #333;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
}

.modal.light .modal-header h3 {
    color: #111827;
}

.modal.dark .modal-header h3 {
    color: #daa520;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.modal.light .close-btn {
    color: #6b7280;
}

.modal.light .close-btn:hover {
    background: #f3f4f6;
    color: #374151;
}

.modal.dark .close-btn {
    color: #daa520;
}

.modal.dark .close-btn:hover {
    background: #333;
    color: #f0f0f0;
}

.modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 32px 24px;
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.modal-content::-webkit-scrollbar {
    width: 8px;
}

.modal-content::-webkit-scrollbar-track {
    background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

.modal.dark .modal-content::-webkit-scrollbar-thumb {
    background: #4b5563;
}

/* Seções */
.cliente-info-section,
.propostas-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.cliente-info-section h4,
.propostas-section h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #111827;
}

.modal.dark .cliente-info-section h4,
.modal.dark .propostas-section h4 {
    color: #daa520;
}

/* Informações do Cliente */
.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-item.full-width {
    grid-column: 1 / -1;
}

.info-row {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.info-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #6b7280;
}

.modal.dark .info-label {
    color: #9ca3af;
}

.info-value {
    font-size: 0.95rem;
    font-weight: 500;
    color: #111827;
    word-break: break-word;
}

.modal.dark .info-value {
    color: #f0f0f0;
}

/* Badge de tipo */
.tipo-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.tipo-badge.PF {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    color: white;
}

.tipo-badge.PJ {
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
    color: white;
}

/* Seção de Propostas */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.propostas-count {
    font-size: 0.85rem;
    font-weight: 500;
    color: #6b7280;
    background: #f3f4f6;
    padding: 4px 10px;
    border-radius: 20px;
}

.modal.dark .propostas-count {
    color: #d1d5db;
    background: #374151;
}

/* Estados de loading e vazio */
.loading-propostas,
.empty-propostas {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    font-style: italic;
    color: #6b7280;
    border-radius: 12px;
    border: 1px dashed #e5e7eb;
    background: #f9fafb;
}

.modal.dark .loading-propostas,
.modal.dark .empty-propostas {
    color: #9ca3af;
    border-color: #4b5563;
    background: #2d2d2d;
}

/* Lista de propostas simplificada */
.propostas-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.proposta-item {
    background: #f9fafb;
    border-radius: 8px;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
}

.modal.dark .proposta-item {
    background: #2d2d2d;
    border-color: #374151;
}

.proposta-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal.dark .proposta-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.proposta-simples {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.proposta-numero {
    font-size: 0.95rem;
    font-weight: 600;
    color: #111827;
}

.modal.dark .proposta-numero {
    color: #daa520;
}

.proposta-data {
    font-size: 0.85rem;
    color: #6b7280;
}

.modal.dark .proposta-data {
    color: #9ca3af;
}

/* Modal Actions */
.modal-actions {
    display: flex;
    justify-content: flex-end;
    padding: 24px 32px;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
}

.modal.dark .modal-actions {
    background: #2d2d2d;
    border-color: #374151;
}

.btn-close {
    padding: 10px 20px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    background: transparent;
    color: #374151;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.modal.light .btn-close {
    border-color: #d1d5db;
    color: #374151;
}

.modal.dark .btn-close {
    border-color: #4b5563;
    color: #daa520;
}

.btn-close:hover {
    background: #e5e7eb;
}

.modal.dark .btn-close:hover {
    background: #374151;
}

.btn-documento {
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
}

.modal.light .btn-documento:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: translateY(-1px);
}

.modal.dark .btn-documento {
    border-color: #60a5fa;
    background: rgba(96, 165, 250, 0.1);
    color: #60a5fa;
}

.modal.dark .btn-documento:hover {
    background: rgba(96, 165, 250, 0.2);
}

/* Ajuste no layout da proposta simplificada */
.proposta-simples {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}


/* Animations */
@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsivo */
@media (max-width: 768px) {
    .modal {
        width: 95vw;
        max-height: 90vh;
        margin: 20px;
    }

    .modal-header {
        padding: 20px;
    }

    .modal-content {
        padding: 0 20px 20px;
        gap: 24px;
    }

    .info-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .info-row {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .proposta-simples {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    .modal-actions {
        padding: 20px;
    }

    .btn-documento {
        align-self: flex-start;
    }
}
</style>