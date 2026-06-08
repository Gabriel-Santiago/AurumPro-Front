<template>
    <BaseModal
        title="Detalhes do Cliente"
        variant="fullscreen"
        size="lg"
        modal-class="modal cliente-modal"
        @close="$emit('close')"
    >
        <div class="modal cliente-modal" :class="theme">
            <div class="modal-content">
                <div class="cliente-info-section">
                    <h4>Informações do Cliente</h4>

                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Nome:</span>
                            <span class="info-value">{{ cliente.nome || cliente.responsavel || 'Não informado' }}</span>
                        </div>

                        <div v-if="cliente.tipoPessoa === 'PJ'" class="info-item">
                            <span class="info-label">Responsável:</span>
                            <span class="info-value">{{ cliente.responsavel || 'Não informado' }}</span>
                        </div>

                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value">{{ cliente.email || 'Não informado' }}</span>
                        </div>

                        <div class="info-item">
                            <span class="info-label">Telefone:</span>
                            <span class="info-value">{{ formatarTelefone(cliente.telefone) || 'Não informado' }}</span>
                        </div>

                        <div v-if="cliente.tipoPessoa === 'PJ'" class="info-item">
                            <span class="info-label">CNPJ:</span>
                            <span class="info-value">{{ formatarCNPJ(cliente.cnpj) || 'Não informado' }}</span>
                        </div>

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

                        <div class="info-item full-width">
                            <span class="info-label">Endereço:</span>
                            <span class="info-value">
                                {{ [cliente.logradouro, cliente.numero].filter(Boolean).join(', ') || 'Logradouro não informado' }}<br>
                                {{ cliente.bairro || 'Bairro não informado' }}<br>
                                {{ [cliente.localidade, cliente.uf].filter(Boolean).join('/') || 'Cidade/UF não informados' }}
                            </span>
                        </div>

                        <div class="info-item">
                            <span class="info-label">CEP:</span>
                            <span class="info-value">{{ formatarCEP(cliente.cep) || 'Não informado' }}</span>
                        </div>

                        <div class="info-item">
                            <span class="info-label">Tipo:</span>
                            <span class="info-value tipo-badge" :class="cliente.tipoPessoa">
                                {{ cliente.tipoPessoa === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica' }}
                            </span>
                        </div>
                    </div>
                </div>

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
        </div>

        <template #footer>
            <div class="modal-actions">
                <button type="button" class="btn-close" @click="$emit('close')">Fechar</button>
            </div>
        </template>
    </BaseModal>

    <DocumentoModal 
        v-if="showDocumentoModal && propostaSelecionada"
        :proposta="propostaSelecionada"
        @close="showDocumentoModal = false"
    />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useThemeStore } from "@/stores/themeStore";
import BaseModal from "@/components/common/BaseModal.vue";
import propostaService from "../../services/propostaService";
import DocumentoModal from "../documentos/DocumentoModal.vue";
import { notify } from '../../services/notificationService';

const props = defineProps({
    cliente: { type: Object, required: true }
});

defineEmits(["close"]);

const themeStore = useThemeStore();
const theme = computed(() => themeStore.theme);

const propostas = ref([]);
const loadingPropostas = ref(false);

const showDocumentoModal = ref(false);
const propostaSelecionada = ref(null);

const abrirDocumentoModal = (proposta) => {
    propostaSelecionada.value = proposta;
    showDocumentoModal.value = true;
};

const carregarPropostas = async () => {
    try {
        loadingPropostas.value = true;
        const clienteId = props.cliente.id;

        const response = await propostaService.listarPorCliente(clienteId);
        propostas.value = response.data || [];
    } catch {
        notify.error('Erro ao carregar propostas');
        propostas.value = [];
    } finally {
        loadingPropostas.value = false;
    }
};

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
    } catch {
        notify.error('Erro ao calcular idade');
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
    } catch {
        notify.error('Erro ao formatar data');
        return dataString;
    }
};

onMounted(() => {
    carregarPropostas();
});
</script>

