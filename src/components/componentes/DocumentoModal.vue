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

            <div class="modal-content-wrapper">
                <div class="modal-content-container">
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
                        
                        <div v-if="!documento.colaborador" class="aviso-sem-colaborador">
                            <span class="aviso-icon">ℹ️</span>
                            <span>Usando responsável da empresa como consultor</span>
                        </div>
                    </div>

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
                                    <h1>TERMO DE PRESTAÇÃO DE SERVIÇOS</h1>
                                    
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
                                    
                                    <h2>2. Dados da Empresa Contratada</h2>
                                    <div v-if="documento.empresa">
                                        <p><strong>Empresa:</strong> {{ documento.empresa.nome }}</p>
                                        <p><strong>CNPJ:</strong> {{ formatarCNPJ(documento.empresa.cnpj) }}</p>
                                        <p><strong>Responsável:</strong> {{ documento.empresa.responsavel }}</p>
                                        <p><strong>Endereço:</strong> {{ enderecoEmpresa }}</p>
                                        <p><strong>Telefone:</strong> {{ formatarTelefone(documento.empresa.telefone) }}</p>
                                    </div>
                                    
                                    <h2>3. Serviços e Subserviços Contratados</h2>
                                    <div class="servicos-placeholder" v-if="!documento.servicoList || documento.servicoList.length === 0">
                                        <p>Nenhum serviço contratado</p>
                                    </div>
                                    <div v-else class="servicos-info">
                                        <p>{{ documento.servicoList.length }} serviço(s) contratado(s)</p>
                                        <p>{{ documento.microServicoList?.length || 0 }} microserviço(s)</p>
                                    </div>
                                    
                                    <h2>4. Custos adicionais</h2>
                                    <div class="custos-placeholder" v-if="!documento.custoList || documento.custoList.length === 0">
                                        <p>Nenhum custo adicional</p>
                                    </div>
                                    <div v-else class="custos-info">
                                        <p>{{ documento.custoList.length }} custo(s) adicional(is)</p>
                                    </div>
                                    
                                    <h2>5. Investimento</h2>
                                    <p><strong>• Valor proposto:</strong> R$ {{ formatarValor(documento.valorTotal) }}</p>
                                    <p><strong>• Forma de pagamento:</strong> ___________________________</p>
                                    <p><strong>• PIX para pagamento:</strong></p>
                                    
                                    <h2>6. Condições Gerais</h2>
                                    <p>O início do atendimento será a partir do dia: _________________________.</p>
                                    <p>{{ cidadeUfEmpresa }}, {{ dataAtualFormatada }}</p>
                                    
                                    <div class="assinaturas">
                                        <p><strong>Cliente:</strong> ___________________________________________</p>
                                        <p><strong>Consultor(a):</strong> {{ consultorNome }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
import { notify } from '../../services/notificationService';

const props = defineProps({
    proposta: { type: Object, required: true }
});

const emit = defineEmits(['close']);

const themeStore = useThemeStore();
const theme = computed(() => themeStore.theme);

const documento = ref(null);
const conteudo = ref('');
const loading = ref(false);
const erro = ref(null);
const visualizacao = ref('visual');

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

const carregarDados = async () => {
    try {        
        const dados = await documentoService.buscarDados(props.proposta.id);
        documento.value = dados;
        
        if (dados) {
            await carregarConteudo();
        } else {
            notify.error('Proposta não encontrada');
        }
        
    } catch (error) {
        notify.error('Erro ao carregar dados da proposta');
        documento.value = null;
    } finally {
        loading.value = false;
    }
};

const carregarConteudo = async () => {
    try {
        const conteudoText = await documentoService.visualizarDados(props.proposta.id);
        conteudo.value = conteudoText;
    } catch (error) {
        notify.error('Erro ao carregar conteúdo');
        conteudo.value = gerarConteudoBasico();
    }
};

const gerarConteudoBasico = () => {
    if (!documento.value) return 'Dados não disponíveis';
    
    let conteudo = 'TERMO DE PRESTAÇÃO DE SERVIÇOS\n\n';
    
    conteudo += '1. Dados do Cliente Contratante\n';
    if (documento.value.cliente) {
        conteudo += `• Nome: ${documento.value.cliente.nome}\n`;
        conteudo += `• Telefone: ${documento.value.cliente.telefone}\n`;
        conteudo += `• E-mail: ${documento.value.cliente.email}\n`;
    }
    conteudo += '\n';
    
    conteudo += '2. Dados da Empresa Contratada\n';
    if (documento.value.empresa) {
        conteudo += `Empresa: ${documento.value.empresa.nome}\n`;
        conteudo += `Responsável: ${documento.value.empresa.responsavel}\n`;
    }
    conteudo += '\n';
    
    conteudo += '3. Serviços e Subserviços Contratados\n';
    if (documento.value.servicoList?.length > 0) {
        conteudo += `${documento.value.servicoList.length} serviço(s)\n`;
    } else {
        conteudo += 'Nenhum serviço contratado\n';
    }
    conteudo += '\n';
    
    conteudo += '5. Investimento\n';
    conteudo += `• Valor proposto: R$ ${formatarValor(documento.value.valorTotal)}\n`;
    conteudo += '• Forma de pagamento: ___________________________\n\n';
    
    conteudo += '6. Condições Gerais\n';
    conteudo += 'O início do atendimento será a partir do dia: _________________________.\n';
    conteudo += `${cidadeUfEmpresa.value}, ${dataAtualFormatada.value}\n\n`;
    
    conteudo += 'Cliente: ___________________________________________\n';
    conteudo += `Consultor(a): ${consultorNome.value}\n`;
    
    return conteudo;
};

const baixarDocumento = async () => {
    if (!documento.value) {
        erro.value = 'Não há dados suficientes para gerar o documento';
        return;
    }
    
    try {
        loading.value = true;
        await documentoService.downloadDados(props.proposta.id);
    } catch (error) {
        notify.error('Erro ao baixar documento');
        
        if (error.message.includes('colaborador') || error.response?.status === 500) {
            erro.value = 'Erro ao gerar documento. Verifique se o colaborador está atribuído à proposta.';
        } else {
            erro.value = 'Erro ao baixar o documento. Tente novamente.';
        }
    } finally {
        loading.value = false;
    }
};

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

onMounted(() => {
    carregarDados();
});
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 10px;
}

.modal.documento-modal {
    width: 1300px;
    max-width: 98vw;
    height: 95vh;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    border-radius: 12px;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.25);
    overflow: hidden;
}

.modal.light {
    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-tertiary: #f1f5f9;
    --border-color: #e2e8f0;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --text-tertiary: #475569;
}

.modal.dark {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --bg-tertiary: #3d3d3d;
    --border-color: #4a4a4a;
    --text-primary: #f0f0f0;
    --text-secondary: #b0b0b0;
    --text-tertiary: #909090;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
    min-height: 70px;
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
}

.proposta-info {
    display: flex;
    gap: 16px;
    font-size: 0.85rem;
}

.proposta-numero {
    color: var(--text-secondary);
    font-weight: 500;
}

.proposta-data {
    color: var(--text-tertiary);
    font-style: italic;
}

.close-btn {
    background: transparent;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: var(--text-tertiary);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.close-btn:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-primary);
}

.modal.dark .close-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
}

.close-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.modal-content-wrapper {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-content-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.modal-content-container::-webkit-scrollbar {
    width: 12px;
}

.modal-content-container::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 6px;
}

.modal-content-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 6px;
    border: 3px solid var(--bg-secondary);
}

.modal-content-container::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.modal.dark .modal-content-container::-webkit-scrollbar-thumb {
    background: #4b5563;
}

.modal.dark .modal-content-container::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
}

.info-rapida {
    background: var(--bg-secondary);
    padding: 16px 20px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    flex-shrink: 0;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 12px;
}

@media (max-width: 1024px) {
    .info-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .info-grid {
        grid-template-columns: 1fr;
    }
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
}

.valor-total {
    color: #10b981;
    font-size: 1rem;
}

.aviso-sem-colaborador {
    padding: 10px 14px;
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #92400e;
}

.modal.dark .aviso-sem-colaborador {
    background: rgba(245, 158, 11, 0.25);
    border-color: rgba(245, 158, 11, 0.4);
    color: #fbbf24;
}

.aviso-icon {
    font-size: 1.1rem;
}

.preview-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    border-radius: 10px;
    border: 1px solid var(--border-color);
    overflow: hidden;
    max-height: calc(95vh - 180px);
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
    min-height: 50px;
}

.preview-header h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
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
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
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
    gap: 6px;
    background: rgba(0, 0, 0, 0.05);
    padding: 4px;
    border-radius: 6px;
}

.modal.dark .format-selector {
    background: rgba(255, 255, 255, 0.05);
}

.format-option {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.format-option input[type="radio"] {
    margin: 0;
    accent-color: #3b82f6;
}

.format-option span {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.format-option:hover {
    background: rgba(59, 130, 246, 0.1);
}

.format-option input:checked + span {
    color: #3b82f6;
}

.loading-container,
.error-container,
.dados-nao-encontrados {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 30px;
    text-align: center;
    min-height: 300px;
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
    font-size: 2.5rem;
    margin-bottom: 16px;
    color: #ef4444;
}

.btn-retry {
    margin-top: 16px;
    padding: 8px 20px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-retry:hover {
    background: #2563eb;
}

.aviso-descricao {
    margin-top: 10px;
    font-size: 0.9rem;
    color: var(--text-tertiary);
    max-width: 400px;
    line-height: 1.4;
}

.preview-content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    max-height: calc(95vh - 280px);
}

.texto-preview {
    flex: 1;
    min-height: 0;
    display: flex;
}

.documento-texto {
    flex: 1;
    margin: 0;
    font-family: 'Courier New', monospace;
    font-size: 16px;
    line-height: 1.8;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: var(--text-primary);
    padding: 30px 40px;
    overflow-y: auto;
    background: var(--bg-primary);
    font-weight: 500;
}

.visual-preview {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 20px;
    background: var(--bg-primary);
}

.documento-visual {
    max-width: 1100px;
    margin: 0 auto;
    font-family: 'Times New Roman', serif;
    line-height: 1.9;
    color: var(--text-primary);
    padding: 30px 40px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    min-height: fit-content;
}

.modal.dark .documento-visual {
    background: #2d2d2d;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.documento-visual h1 {
    text-align: center;
    font-size: 2.4rem !important;
    margin: 0 0 50px 0 !important;
    padding-bottom: 25px;
    border-bottom: 4px solid #3b82f6;
    color: #1e40af;
    font-weight: 700;
    letter-spacing: 1px;
}

.modal.dark .documento-visual h1 {
    border-color: #60a5fa;
    color: #60a5fa;
}

.documento-visual h2 {
    font-size: 1.6rem !important;
    margin: 40px 0 20px 0 !important;
    color: #1e293b;
    padding-left: 15px;
    border-left: 6px solid #3b82f6;
    font-weight: 600;
}

.modal.dark .documento-visual h2 {
    color: #cbd5e1;
    border-left-color: #60a5fa;
}

.documento-visual p {
    margin: 18px 0 !important;
    padding: 0 25px;
    font-size: 18px !important;
    line-height: 1.9;
    color: #333;
}

.modal.dark .documento-visual p {
    color: #e5e7eb;
}

.documento-visual strong {
    font-weight: 700;
    color: #1e293b;
    font-size: 18px;
}

.modal.dark .documento-visual strong {
    color: #f0f0f0;
}

.servicos-placeholder,
.custos-placeholder {
    padding: 20px 25px;
    font-style: italic;
    color: var(--text-tertiary);
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    margin: 15px 25px;
    font-size: 17px;
}

.modal.dark .servicos-placeholder,
.modal.dark .custos-placeholder {
    background: rgba(255, 255, 255, 0.03);
}

.servicos-info,
.custos-info {
    padding: 20px 25px;
    background: rgba(59, 130, 246, 0.08);
    border-radius: 8px;
    margin: 15px 25px;
    border-left: 6px solid #3b82f6;
    font-size: 17px;
}

.modal.dark .servicos-info,
.modal.dark .custos-info {
    background: rgba(96, 165, 250, 0.12);
}

.assinaturas {
    margin-top: 80px !important;
    padding-top: 40px;
    border-top: 3px solid #ccc;
    text-align: center;
}

.modal.dark .assinaturas {
    border-color: #555;
}

.assinaturas p {
    font-size: 19px !important;
    margin: 25px 0 !important;
    padding: 0;
    font-weight: 600;
}

.modal-actions {
    padding: 16px 24px;
    border-top: 1px solid var(--border-color);
    background: var(--bg-tertiary);
    flex-shrink: 0;
    min-height: 70px;
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
    flex-wrap: wrap;
}

.download-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.btn-download {
    padding: 10px 24px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-download:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.btn-download:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.download-icon {
    font-size: 1.1rem;
}

.aviso-download {
    margin-top: 6px;
    width: 100%;
}

.aviso-text {
    font-size: 0.85rem;
    color: #dc2626;
    display: flex;
    align-items: center;
    gap: 4px;
}

.modal.dark .aviso-text {
    color: #f87171;
}

.btn-close {
    padding: 10px 24px;
    border-radius: 8px;
    border: 2px solid var(--border-color);
    background: transparent;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-close:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
    border-color: var(--text-secondary);
}

.modal.dark .btn-close:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
}

.btn-close:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@media (max-width: 1400px) {
    .modal.documento-modal {
        width: 95vw;
        height: 90vh;
    }
    
    .documento-visual {
        max-width: 900px;
        padding: 25px 30px;
    }
    
    .documento-visual h1 {
        font-size: 2.2rem !important;
    }
    
    .documento-visual h2 {
        font-size: 1.5rem !important;
    }
    
    .documento-visual p {
        font-size: 17px !important;
    }
}

@media (max-width: 768px) {
    .modal.documento-modal {
        height: 95vh;
        margin: 0;
        border-radius: 0;
        max-width: 100vw;
        max-height: 100vh;
    }
    
    .modal-header {
        padding: 12px 16px;
        min-height: 60px;
    }
    
    .modal-content-container {
        padding: 12px 16px;
        gap: 12px;
    }
    
    .preview-container {
        max-height: calc(95vh - 160px);
    }
    
    .preview-header {
        flex-direction: column;
        gap: 10px;
        align-items: stretch;
        padding: 10px 14px;
        min-height: 45px;
    }
    
    .preview-actions {
        justify-content: space-between;
    }
    
    .preview-content {
        max-height: calc(95vh - 220px);
    }
    
    .actions-container {
        flex-direction: column;
        gap: 12px;
    }
    
    .download-section {
        width: 100%;
        justify-content: space-between;
        flex-wrap: nowrap;
    }
    
    .btn-download,
    .btn-close {
        width: 100%;
        justify-content: center;
    }
    
    .visual-preview {
        padding: 15px;
    }
    
    .texto-preview {
        padding: 15px;
    }
    
    .documento-texto {
        font-size: 15px;
        padding: 20px;
    }
    
    .documento-visual {
        padding: 20px;
    }
    
    .documento-visual h1 {
        font-size: 1.8rem !important;
        margin-bottom: 30px !important;
    }
    
    .documento-visual h2 {
        font-size: 1.3rem !important;
        margin: 25px 0 15px 0 !important;
    }
    
    .documento-visual p {
        font-size: 16px !important;
        padding: 0 15px;
    }
    
    .assinaturas {
        margin-top: 50px !important;
        padding-top: 25px;
    }
    
    .assinaturas p {
        font-size: 17px !important;
    }
    
    .modal-actions {
        padding: 12px 16px;
        min-height: 65px;
    }
}

@media (max-width: 480px) {
    .info-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    
    .proposta-info {
        flex-direction: column;
        gap: 2px;
    }
    
    .format-selector {
        width: 100%;
        justify-content: space-between;
    }
    
    .format-option {
        flex: 1;
        justify-content: center;
    }
    
    .btn-download,
    .btn-close {
        padding: 10px 20px;
        font-size: 0.9rem;
    }
    
    .documento-visual {
        padding: 15px;
    }
    
    .documento-visual h1 {
        font-size: 1.6rem !important;
    }
    
    .documento-visual h2 {
        font-size: 1.2rem !important;
    }
    
    .documento-visual p {
        font-size: 15px !important;
        padding: 0 10px;
    }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.info-rapida,
.preview-container,
.modal-actions {
    animation: fadeIn 0.3s ease-out;
}

.loading-container {
    animation: fadeIn 0.2s ease-out;
}

.documento-visual {
    transform: scale(1);
    transition: transform 0.3s ease;
}

.documento-visual:hover {
    transform: scale(1.005);
}

.documento-visual p {
    position: relative;
}

.documento-visual p::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 2px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.documento-visual p:hover::before {
    opacity: 1;
}
</style>