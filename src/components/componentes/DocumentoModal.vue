<template>
    <div class="modal-backdrop" @click.self="$emit('close')" :class="theme">
        <div class="modal documento-modal" :class="theme">
            <div class="modal-header">
                <div class="header-content">
                    <h3>📄 Documento da Proposta</h3>
                    <div class="proposta-info">
                        <span class="proposta-numero">ID: {{ proposta.id }}</span>
                        <span class="proposta-data">{{ formatarData(proposta.dataCriacao) }}</span>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('close')" :disabled="loading">×</button>
            </div>

            <div class="modal-content">
                <!-- Informações Rápidas -->
                <div class="info-rapida" v-if="documento && !loading">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Cliente:</span>
                            <span class="info-value">{{ documento.cliente?.nome || 'Não informado' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Empresa:</span>
                            <span class="info-value">{{ documento.empresa?.nome || 'Não informado' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Valor Total:</span>
                            <span class="info-value valor-total">R$ {{ formatarValor(documento.valorTotal) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Consultor:</span>
                            <span class="info-value">{{ consultorNome }}</span>
                        </div>
                    </div>
                    
                    <!-- Aviso se não tem colaborador -->
                    <div v-if="!documento.colaborador" class="aviso-sem-colaborador">
                        <span class="aviso-icon">ℹ️</span>
                        <span>Usando responsável da empresa como consultor</span>
                    </div>
                </div>

                <!-- Pré-visualização -->
                <div class="preview-container">
                    <div class="preview-header">
                        <h4>Pré-visualização do Documento</h4>
                        <div class="preview-actions">
                            <button class="btn-refresh" @click="carregarDados" :disabled="loading">
                                🔄 Atualizar
                            </button>
                            <div class="format-selector">
                                <label class="format-option">
                                    <input type="radio" v-model="visualizacao" value="texto" :disabled="loading">
                                    <span>Texto</span>
                                </label>
                                <label class="format-option">
                                    <input type="radio" v-model="visualizacao" value="visual" :disabled="loading">
                                    <span>Visual</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div v-if="loading" class="loading-container">
                        <div class="spinner"></div>
                        <span>Carregando documento...</span>
                    </div>

                    <div v-else-if="erro" class="error-container">
                        <div class="error-icon">❌</div>
                        <span>{{ erro }}</span>
                        <button class="btn-retry" @click="carregarDados">Tentar novamente</button>
                    </div>

                    <div v-else-if="!documento" class="dados-nao-encontrados">
                        <div class="aviso-icon">⚠️</div>
                        <span>Não foi possível carregar os dados da proposta</span>
                        <p class="aviso-descricao">A proposta pode não existir ou estar corrompida.</p>
                        <button class="btn-retry" @click="carregarDados">Tentar novamente</button>
                    </div>

                    <div v-else class="preview-content" :class="{ 'texto-view': visualizacao === 'texto' }">
                        <div v-if="visualizacao === 'texto'" class="texto-preview">
                            <pre class="documento-texto">{{ conteudo || 'Conteúdo não disponível' }}</pre>
                        </div>
                        
                        <div v-else class="visual-preview">
                            <div class="documento-visual">
                                <!-- Cabeçalho -->
                                <h1>TERMO DE PRESTAÇÃO DE SERVIÇOS</h1>
                                
                                <!-- Dados do Cliente -->
                                <h2>1. Dados do Cliente Contratante</h2>
                                <div v-if="documento.cliente">
                                    <div v-if="documento.cliente.tipoPessoa === 'PJ' && documento.cliente.responsavel">
                                        <p><strong>• Nome do Responsável:</strong> {{ documento.cliente.responsavel }}</p>
                                    </div>
                                    <p><strong>• Nome:</strong> {{ documento.cliente.nome }}</p>
                                    <p><strong>• CNPJ/CPF:</strong> {{ documentoClienteFormatado }}</p>
                                    <p><strong>• Telefone:</strong> {{ formatarTelefone(documento.cliente.telefone) }}</p>
                                    <p><strong>• E-mail:</strong> {{ documento.cliente.email }}</p>
                                </div>
                                
                                <!-- Dados da Empresa -->
                                <h2>2. Dados da Empresa Contratada</h2>
                                <div v-if="documento.empresa">
                                    <p><strong>Empresa:</strong> {{ documento.empresa.nome }}</p>
                                    <p><strong>CNPJ:</strong> {{ formatarCNPJ(documento.empresa.cnpj) }}</p>
                                    <p><strong>Responsável:</strong> {{ documento.empresa.responsavel }}</p>
                                    <p><strong>Endereço:</strong> {{ enderecoEmpresa }}</p>
                                    <p><strong>Telefone:</strong> {{ formatarTelefone(documento.empresa.telefone) }}</p>
                                </div>
                                
                                <!-- Serviços -->
                                <h2>3. Serviços e Subserviços Contratados</h2>
                                <div class="servicos-placeholder" v-if="!documento.servicoList || documento.servicoList.length === 0">
                                    <p>Nenhum serviço contratado</p>
                                </div>
                                <div v-else class="servicos-info">
                                    <p>{{ documento.servicoList.length }} serviço(s) contratado(s)</p>
                                    <p>{{ documento.microServicoList?.length || 0 }} microserviço(s)</p>
                                </div>
                                
                                <!-- Custos -->
                                <h2>4. Custos adicionais</h2>
                                <div class="custos-placeholder" v-if="!documento.custoList || documento.custoList.length === 0">
                                    <p>Nenhum custo adicional</p>
                                </div>
                                <div v-else class="custos-info">
                                    <p>{{ documento.custoList.length }} custo(s) adicional(is)</p>
                                </div>
                                
                                <!-- Investimento -->
                                <h2>5. Investimento</h2>
                                <p><strong>• Valor proposto:</strong> R$ {{ formatarValor(documento.valorTotal) }}</p>
                                <p><strong>• Forma de pagamento:</strong> ___________________________</p>
                                <p><strong>• PIX para pagamento:</strong></p>
                                
                                <!-- Condições -->
                                <h2>6. Condições Gerais</h2>
                                <p>O início do atendimento será a partir do dia: _________________________.</p>
                                <p>{{ cidadeUfEmpresa }}, {{ dataAtualFormatada }}</p>
                                
                                <!-- Assinaturas -->
                                <div class="assinaturas">
                                    <p><strong>Cliente:</strong> ___________________________________________</p>
                                    <p><strong>Consultor(a):</strong> {{ consultorNome }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ações -->
            <div class="modal-actions">
                <div class="actions-container">
                    <div class="download-section">
                        <span class="download-label">Baixar documento:</span>
                        <button class="btn-download" @click="baixarDocumento" :disabled="loading || !documento">
                            <span class="download-icon">📥</span>
                            <span>Baixar DOCX</span>
                        </button>
                        <div v-if="!documento" class="aviso-download">
                            <span class="aviso-text">⚠️ Dados insuficientes para download</span>
                        </div>
                    </div>
                    <button class="btn-close" @click="$emit('close')" :disabled="loading">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useThemeStore } from '../../store/themeStore';
import documentoService from '../../services/documentoService';

const props = defineProps({
    proposta: { type: Object, required: true }
});

const emit = defineEmits(['close']);

const themeStore = useThemeStore();
const theme = computed(() => themeStore.theme);

// Estados
const documento = ref(null);
const conteudo = ref('');
const loading = ref(false);
const erro = ref(null);
const visualizacao = ref('visual');

// Computed properties
const consultorNome = computed(() => {
    if (!documento.value) return 'Não informado';
    if (documento.value.colaborador?.nome) {
        return documento.value.colaborador.nome;
    }
    if (documento.value.empresa?.responsavel) {
        return `${documento.value.empresa.responsavel} (Responsável da Empresa)`;
    }
    return 'Não informado';
});

const documentoClienteFormatado = computed(() => {
    if (!documento.value?.cliente) return '';
    if (documento.value.cliente.tipoPessoa === 'PF') {
        return formatarCPF(documento.value.cliente.cpf);
    } else {
        return formatarCNPJ(documento.value.cliente.cnpj);
    }
});

const enderecoEmpresa = computed(() => {
    if (!documento.value?.empresa) return 'Não informado';
    const partes = [
        documento.value.empresa.rua,
        documento.value.empresa.bairro,
        documento.value.empresa.numero,
        documento.value.empresa.cidade,
        documento.value.empresa.estado
    ].filter(Boolean);
    return partes.join(', ');
});

const cidadeUfEmpresa = computed(() => {
    if (!documento.value?.empresa) return '';
    return `${documento.value.empresa.cidade || ''}/${documento.value.empresa.estado || ''}`.trim();
});

const dataAtualFormatada = computed(() => {
    const hoje = new Date();
    return hoje.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
});

// Carregar dados
const carregarDados = async () => {
    try {
        loading.value = true;
        erro.value = null;
        
        // Carrega dados estruturados
        const dados = await documentoService.buscarDados(props.proposta.id);
        documento.value = dados;
        
        // Se encontrou dados, carrega conteúdo
        if (dados) {
            await carregarConteudo();
        } else {
            erro.value = 'Proposta não encontrada';
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        erro.value = 'Erro ao carregar dados da proposta';
        documento.value = null;
    } finally {
        loading.value = false;
    }
};

// Carregar conteúdo texto
const carregarConteudo = async () => {
    try {
        const conteudoText = await documentoService.visualizarDados(props.proposta.id);
        conteudo.value = conteudoText;
    } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        // Gera conteúdo básico se não conseguir do backend
        conteudo.value = gerarConteudoBasico();
    }
};

// Gerar conteúdo básico localmente
const gerarConteudoBasico = () => {
    if (!documento.value) return 'Dados não disponíveis';
    
    let conteudo = 'TERMO DE PRESTAÇÃO DE SERVIÇOS\n\n';
    
    // 1. Dados do Cliente
    conteudo += '1. Dados do Cliente Contratante\n';
    if (documento.value.cliente) {
        conteudo += `• Nome: ${documento.value.cliente.nome}\n`;
        conteudo += `• Telefone: ${documento.value.cliente.telefone}\n`;
        conteudo += `• E-mail: ${documento.value.cliente.email}\n`;
    }
    conteudo += '\n';
    
    // 2. Dados da Empresa
    conteudo += '2. Dados da Empresa Contratada\n';
    if (documento.value.empresa) {
        conteudo += `Empresa: ${documento.value.empresa.nome}\n`;
        conteudo += `Responsável: ${documento.value.empresa.responsavel}\n`;
    }
    conteudo += '\n';
    
    // 3. Serviços
    conteudo += '3. Serviços e Subserviços Contratados\n';
    if (documento.value.servicoList?.length > 0) {
        conteudo += `${documento.value.servicoList.length} serviço(s)\n`;
    } else {
        conteudo += 'Nenhum serviço contratado\n';
    }
    conteudo += '\n';
    
    // 5. Investimento
    conteudo += '5. Investimento\n';
    conteudo += `• Valor proposto: R$ ${formatarValor(documento.value.valorTotal)}\n`;
    conteudo += '• Forma de pagamento: ___________________________\n\n';
    
    // 6. Condições
    conteudo += '6. Condições Gerais\n';
    conteudo += 'O início do atendimento será a partir do dia: _________________________.\n';
    conteudo += `${cidadeUfEmpresa.value}, ${dataAtualFormatada.value}\n\n`;
    
    // Assinaturas
    conteudo += 'Cliente: ___________________________________________\n';
    conteudo += `Consultor(a): ${consultorNome.value}\n`;
    
    return conteudo;
};

// Baixar documento
const baixarDocumento = async () => {
    if (!documento.value) {
        erro.value = 'Não há dados suficientes para gerar o documento';
        return;
    }
    
    try {
        loading.value = true;
        await documentoService.downloadDados(props.proposta.id);
    } catch (error) {
        console.error('Erro ao baixar documento:', error);
        
        // Verifica se é erro de colaborador null
        if (error.message.includes('colaborador') || error.response?.status === 500) {
            erro.value = 'Erro ao gerar documento. Verifique se o colaborador está atribuído à proposta.';
        } else {
            erro.value = 'Erro ao baixar o documento. Tente novamente.';
        }
    } finally {
        loading.value = false;
    }
};

// Funções de formatação
const formatarValor = (valor) => {
    if (!valor) return '0,00';
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
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

const formatarCNPJ = (cnpj) => {
    if (!cnpj) return '';
    const numeros = cnpj.replace(/\D/g, '');
    
    if (numeros.length === 14) {
        return `${numeros.substring(0, 2)}.${numeros.substring(2, 5)}.${numeros.substring(5, 8)}/${numeros.substring(8, 12)}-${numeros.substring(12)}`;
    }
    return cnpj;
};

const formatarCPF = (cpf) => {
    if (!cpf) return '';
    const numeros = cpf.replace(/\D/g, '');
    
    if (numeros.length === 11) {
        return `${numeros.substring(0, 3)}.${numeros.substring(3, 6)}.${numeros.substring(6, 9)}-${numeros.substring(9)}`;
    }
    return cpf;
};

// Inicialização
onMounted(() => {
    carregarDados();
});
</script>

<style scoped>
/* Modal principal */
.documento-modal {
    width: 900px;
    max-width: 95vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Header */
.header-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.proposta-info {
    display: flex;
    gap: 16px;
    font-size: 0.85rem;
    color: #6b7280;
}

.modal.dark .proposta-info {
    color: #9ca3af;
}

/* Conteúdo do modal com scroll */
.modal-content {
    flex: 1;
    overflow-y: auto; /* SCROLL VERTICAL */
    padding: 0 32px 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* Estilização da scrollbar */
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

/* Informações Rápidas */
.info-rapida {
    background: var(--bg-secondary);
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    border: 1px solid var(--border-color);
}

.modal.light .info-rapida {
    --bg-secondary: #f9fafb;
    --border-color: #e5e7eb;
}

.modal.dark .info-rapida {
    --bg-secondary: #2d2d2d;
    --border-color: #374151;
}

.info-rapida .info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

@media (max-width: 768px) {
    .info-rapida .info-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.info-rapida .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-rapida .info-label {
    font-size: 0.8rem;
    color: #6b7280;
    font-weight: 500;
}

.modal.dark .info-rapida .info-label {
    color: #9ca3af;
}

.info-rapida .info-value {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
}

.modal.light .info-rapida .info-value {
    --text-primary: #111827;
}

.modal.dark .info-rapida .info-value {
    --text-primary: #f0f0f0;
}

.valor-total {
    color: #10b981;
    font-weight: 700;
}

/* Preview Container */
.preview-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    overflow: hidden;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
}

.modal.light .preview-header {
    --bg-tertiary: #f3f4f6;
}

.modal.dark .preview-header {
    --bg-tertiary: #374151;
}

.preview-header h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
}

.preview-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.btn-refresh {
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #3b82f6;
    background: transparent;
    color: #3b82f6;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-refresh:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.1);
}

.btn-refresh:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.format-selector {
    display: flex;
    gap: 8px;
    background: var(--bg-quaternary);
    padding: 4px;
    border-radius: 6px;
}

.modal.light .format-selector {
    --bg-quaternary: #e5e7eb;
}

.modal.dark .format-selector {
    --bg-quaternary: #4b5563;
}

.format-option {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.format-option input[type="radio"] {
    margin: 0;
}

.format-option span {
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.modal.light .format-option span {
    --text-secondary: #6b7280;
}

.modal.dark .format-option span {
    --text-secondary: #9ca3af;
}

.format-option:hover {
    background: rgba(255, 255, 255, 0.1);
}

.format-option input:checked + span {
    color: #3b82f6;
    font-weight: 500;
}

/* Loading e Erro */
.loading-container,
.error-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid transparent;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.error-icon {
    font-size: 3rem;
    margin-bottom: 16px;
    color: #ef4444;
}

.btn-retry {
    margin-top: 16px;
    padding: 8px 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-retry:hover {
    background: #2563eb;
}

/* Conteúdo do Preview */
.preview-content {
    flex: 1;
    overflow-y: auto;
}

.preview-content.texto-view {
    background: white;
}

.modal.dark .preview-content.texto-view {
    background: #1a1a1a;
}

.texto-preview {
    padding: 24px;
}

.documento-texto {
    margin: 0;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: var(--text-primary);
}

.modal.light .documento-texto {
    --text-primary: #374151;
}

.modal.dark .documento-texto {
    --text-primary: #e5e7eb;
}

.visual-preview {
    padding: 24px; /* Reduzido para melhor scroll */
    background: white;
}

.modal.dark .visual-preview {
    background: #1a1a1a;
}

.documento-visual {
    max-width: 800px;
    margin: 0 auto;
    font-family: 'Times New Roman', serif;
    line-height: 1.6;
    color: var(--text-primary);
}

.modal.light .documento-visual {
    --text-primary: #333;
}

.modal.dark .documento-visual {
    --text-primary: #e5e7eb;
}

.documento-visual h1 {
    text-align: center;
    font-size: 1.6rem; /* Reduzido para caber melhor */
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid #ccc;
}

.modal.dark .documento-visual h1 {
    border-color: #555;
}

.documento-visual h2 {
    font-size: 1.1rem; /* Reduzido para caber melhor */
    margin: 20px 0 10px;
    color: #111827;
}

.modal.dark .documento-visual h2 {
    color: #daa520;
}

.documento-visual p {
    margin: 6px 0; /* Reduzido para caber melhor */
}

.documento-visual strong {
    font-weight: 600;
}

.servicos-placeholder,
.custos-placeholder {
    padding-left: 20px;
    font-style: italic;
    color: #6b7280;
}

.modal.dark .servicos-placeholder,
.modal.dark .custos-placeholder {
    color: #9ca3af;
}

.servicos-info,
.custos-info {
    padding-left: 20px;
}

.assinaturas {
    margin-top: 40px; /* Reduzido para caber melhor */
    padding-top: 16px;
    border-top: 1px solid #ccc;
    text-align: center;
}

.modal.dark .assinaturas {
    border-color: #555;
}

/* Ações */
.modal-actions {
    padding: 20px;
    border-top: 1px solid var(--border-color);
    background: var(--bg-tertiary);
}

.actions-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.download-section {
    display: flex;
    align-items: center;
    gap: 12px;
}

.download-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.modal.light .download-label {
    --text-secondary: #6b7280;
}

.modal.dark .download-label {
    --text-secondary: #9ca3af;
}

.btn-download {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-download:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-download:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.download-icon {
    font-size: 1.1rem;
}

.btn-close {
    padding: 10px 20px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: transparent;
    color: var(--text-primary);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.modal.light .btn-close {
    --border-color: #d1d5db;
    --text-primary: #374151;
}

.modal.dark .btn-close {
    --border-color: #4b5563;
    --text-primary: #daa520;
}

.btn-close:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
}

.modal.dark .btn-close:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
}

.btn-close:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Avisos */
.aviso-sem-colaborador {
    margin-top: 12px;
    padding: 8px 12px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #92400e;
}

.modal.dark .aviso-sem-colaborador {
    background: rgba(245, 158, 11, 0.2);
    border-color: rgba(245, 158, 11, 0.4);
    color: #fbbf24;
}

.aviso-icon {
    font-size: 1.1rem;
}

.dados-nao-encontrados {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
    color: #6b7280;
}

.modal.dark .dados-nao-encontrados {
    color: #9ca3af;
}

.aviso-descricao {
    margin-top: 8px;
    font-size: 0.9rem;
    opacity: 0.8;
}

.aviso-download {
    margin-top: 8px;
}

.aviso-text {
    font-size: 0.85rem;
    color: #dc2626;
}

.modal.dark .aviso-text {
    color: #f87171;
}

/* Responsivo */
@media (max-width: 768px) {
    .documento-modal {
        width: 95vw;
        max-height: 95vh;
        margin: 10px;
    }
    
    .modal-content {
        padding: 0 16px 16px;
        gap: 16px;
    }
    
    .preview-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }
    
    .preview-actions {
        justify-content: space-between;
    }
    
    .actions-container {
        flex-direction: column;
        gap: 12px;
    }
    
    .download-section {
        width: 100%;
        justify-content: space-between;
    }
    
    .btn-download,
    .btn-close {
        width: 100%;
    }
    
    .visual-preview {
        padding: 16px;
    }
    
    .texto-preview {
        padding: 16px;
    }
    
    .documento-visual h1 {
        font-size: 1.4rem;
        margin-bottom: 20px;
    }
    
    .documento-visual h2 {
        font-size: 1rem;
        margin: 16px 0 8px;
    }
    
    .assinaturas {
        margin-top: 30px;
    }
}
</style>