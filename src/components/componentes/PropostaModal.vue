<template>
    <div v-if="visible" class="modal-overlay">
        <div class="modal-backdrop" @click.self="handleClose" :class="theme">
            <div class="modal" :class="theme" ref="modalElement">
                <div class="modal-header">
                    <h3>Criar Proposta - Passo {{ currentPage }} de 6</h3>
                    <button class="close-btn" @click="handleClose">×</button>
                </div>

                <div class="progress-bar">
                    <div class="progress" :style="{ width: `${(currentPage / 6) * 100}%` }"></div>
                    <div class="steps">
                        <span :class="{ active: currentPage >= 1 }">1</span>
                        <span :class="{ active: currentPage >= 2 }">2</span>
                        <span :class="{ active: currentPage >= 3 }">3</span>
                        <span :class="{ active: currentPage >= 4 }">4</span>
                        <span :class="{ active: currentPage >= 5 }">5</span>
                        <span :class="{ active: currentPage >= 6 }">6</span>
                    </div>
                </div>

                <div class="modal-content">
                    <!-- PÁGINA 1: Itens da Proposta -->
                    <div v-if="currentPage === 1" class="page">
                        <div class="page-header">
                            <h4>Itens da Proposta</h4>
                            <button type="button" class="btn-add" @click="adicionarItem">
                                + Adicionar Item
                            </button>
                        </div>

                        <div v-for="(item, index) in form.itens" :key="index" class="item-container">
                            <div class="item-header">
                                <h5>Item {{ index + 1 }}</h5>
                                <button v-if="form.itens.length > 1" type="button" class="btn-remove"
                                    @click="removerItem(index)">
                                    Remover
                                </button>
                            </div>

                            <div class="form-group">
                                <label>Serviço *</label>
                                <select v-model="item.servicoId" @change="carregarMicroServicos(item, index)" required>
                                    <option value="">Selecione um serviço</option>
                                    <option v-for="servico in servicos" :key="servico.id" :value="servico.id">
                                        {{ servico.nome }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Sub Serviços *</label>
                                <select v-model="item.microServicoIds" multiple
                                    @change="carregarValoresMicroServico(item, index)" required>
                                    <option v-for="microServico in item.microServicosDisponiveis" :key="microServico.id"
                                        :value="microServico.id" :title="microServico.descricao">
                                        {{ microServico.nome }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Valor por Hora (R$)</label>
                                    <input v-model="item.valorHora" type="number" step="0.01" placeholder="0.00" min="0"
                                        @input="calcularValorTotal(item)" />
                                </div>

                                <div class="form-group">
                                    <label>Quantidade de Horas</label>
                                    <input v-model="item.qtdHora" type="number" step="0.5" placeholder="0.0" min="0"
                                        @input="calcularValorTotal(item)" />
                                </div>
                            </div>

                            <div v-if="item.valorTotal > 0" class="valor-total">
                                <strong>Valor Total: R$ {{ item.valorTotal.toFixed(2) }}</strong>
                            </div>
                        </div>
                    </div>

                    <!-- PÁGINA 2: Custos -->
                    <div v-else-if="currentPage === 2" class="page">
                        <div class="page-header">
                            <h4>Custos Adicionais</h4>
                            <button type="button" class="btn-add" @click="adicionarCusto">
                                + Adicionar Custo
                            </button>
                        </div>

                        <div v-for="(custo, index) in form.custos" :key="index" class="item-container">
                            <div class="item-header">
                                <h5>Custo {{ index + 1 }}</h5>
                                <button v-if="form.custos.length > 1" type="button" class="btn-remove"
                                    @click="removerCusto(index)">
                                    Remover
                                </button>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nome do Custo *</label>
                                    <input v-model="custo.nome" placeholder="Ex: Materiais, Transporte" required />
                                </div>

                                <div class="form-group">
                                    <label>Valor (R$) *</label>
                                    <input v-model="custo.valor" type="number" step="0.01" placeholder="0.00" min="0"
                                        required />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PÁGINA 3: Desconto -->
                    <div v-else-if="currentPage === 3" class="page">
                        <h4>Aplicar Desconto</h4>

                        <div class="form-group">
                            <label>Tipo de Desconto</label>
                            <div class="radio-group">
                                <label class="radio-option">
                                    <input type="radio" v-model="form.tipoDesconto" value="NENHUM" />
                                    <span>Nenhum Desconto</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" v-model="form.tipoDesconto" value="VALOR" />
                                    <span>Desconto em Valor</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" v-model="form.tipoDesconto" value="PORCENTAGEM" />
                                    <span>Desconto em Porcentagem</span>
                                </label>
                            </div>
                        </div>

                        <div v-if="form.tipoDesconto === 'VALOR'" class="form-group">
                            <label>Valor do Desconto (R$)</label>
                            <input v-model="form.valorDesconto" type="number" step="0.01" placeholder="0.00" min="0" />
                        </div>

                        <div v-if="form.tipoDesconto === 'PORCENTAGEM'" class="form-group">
                            <label>Porcentagem de Desconto (%)</label>
                            <input v-model="form.porcentagemDesconto" type="number" step="0.1" min="0" max="100"
                                placeholder="0.0" />
                        </div>

                        <div v-if="form.tipoDesconto !== 'NENHUM'" class="desconto-preview">
                            <p>Desconto aplicado:
                                <span v-if="form.tipoDesconto === 'VALOR'">R$ {{ (form.valorDesconto || 0).toFixed(2)
                                }}</span>
                                <span v-if="form.tipoDesconto === 'PORCENTAGEM'">{{ form.porcentagemDesconto || 0
                                }}%</span>
                            </p>
                        </div>
                    </div>

                    <!-- PÁGINA 4: Selecionar Colaborador/colaborador -->
                    <div v-else-if="currentPage === 4" class="page">
                        <h4>Atribuir Colaborador</h4>
                        <p class="page-subtitle">
                            Selecione um colaborador para vincular à proposta (opcional)
                        </p>

                        <div class="form-group">
                            <div class="radio-group">
                                <label class="radio-option large">
                                    <input type="radio" v-model="form.colaboradorSelecao" value="NENHUM" />
                                    <div class="option-content">
                                        <span class="option-title">Não atribuir colaborador</span>
                                        <span class="option-description">A proposta será criada sem um colaborador
                                            específico</span>
                                    </div>
                                </label>
                                <label class="radio-option large">
                                    <input type="radio" v-model="form.colaboradorSelecao" value="SELECIONAR" />
                                    <div class="option-content">
                                        <span class="option-title">Selecionar um colaborador existente</span>
                                        <span class="option-description">Escolha entre os colaboradores já
                                            cadastrados</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Seleção de colaborador -->
                        <div v-if="form.colaboradorSelecao === 'SELECIONAR'" class="colaborador-selection">
                            <div class="form-group">
                                <label>Selecione o Colaborador</label>
                                <select v-model="form.colaboradorId" class="colaborador-select">
                                    <option value="">Selecione um colaborador</option>
                                    <option v-for="colaborador in colaboradores" :key="colaborador.id"
                                        :value="colaborador.id">
                                        {{ colaborador.nome }}
                                        <span v-if="colaborador.funcao"> - {{ colaborador.funcao }}</span>
                                    </option>
                                </select>
                            </div>

                            <div v-if="form.colaboradorId && colaboradorSelecionado" class="colaborador-info-card">
                                <div class="colaborador-info-header">
                                    <h5>Colaborador Selecionado</h5>
                                </div>
                                <div class="colaborador-info-content">
                                    <div class="colaborador-info-row">
                                        <span class="label">Nome:</span>
                                        <span class="value">{{ colaboradorSelecionado.nome }}</span>
                                    </div>
                                    <div v-if="colaboradorSelecionado.funcao" class="colaborador-info-row">
                                        <span class="label">Função:</span>
                                        <span class="value">
                                            <span class="funcao-badge">{{ colaboradorSelecionado.funcao }}</span>
                                        </span>
                                    </div>
                                    <div v-if="colaboradorSelecionado.telefone" class="colaborador-info-row">
                                        <span class="label">Telefone:</span>
                                        <span class="value">{{ formatarTelefone(colaboradorSelecionado.telefone)
                                        }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Botão para gerenciar colaboradores -->
                            <div class="colaborador-management">
                                <button type="button" class="btn-manage-colaboradores"
                                    @click="abrirGerenciarColaboradores">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <line x1="19" y1="8" x2="19" y2="14"></line>
                                        <line x1="22" y1="11" x2="16" y2="11"></line>
                                    </svg>
                                    Gerenciar Colaboradores
                                </button>
                            </div>
                        </div>

                        <div class="info-box">
                            <p><strong>Nota:</strong> O colaborador é responsável pela execução ou acompanhamento da
                                proposta. Se não for selecionado agora, a proposta poderá ser atribuída posteriormente.
                            </p>
                        </div>
                    </div>

                    <!-- PÁGINA 5: Convênio (Origem do Cliente) -->
                    <div v-else-if="currentPage === 5" class="page">
                        <h4>Origem do Cliente</h4>
                        <p class="page-subtitle">Selecione como o cliente chegou à empresa (opcional) - Apenas um
                            convênio pode ser selecionado</p>

                        <div class="form-group">
                            <label>Convênio / Origem</label>

                            <div class="convenio-options">
                                <!-- Lista de convênios cadastrados -->
                                <div v-for="convenio in convenios" :key="convenio.id" class="convenio-item"
                                    :class="{ selected: form.convenioId === convenio.id }">
                                    <label class="radio-option">
                                        <input type="radio" v-model="form.convenioId" :value="convenio.id"
                                            name="convenio" :checked="form.convenioId === convenio.id" />
                                        <div class="convenio-info">
                                            <span class="convenio-nome">{{ convenio.nome }}</span>
                                            <span v-if="convenio.descricao" class="convenio-descricao">
                                                {{ convenio.descricao }}
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="info-box">
                            <p><strong>Nota:</strong> O convênio/origem é apenas para registrar como o cliente chegou à
                                empresa
                                (ex: indicação, parceiro, etc.) e não afeta valores da proposta. Apenas um convênio pode
                                ser selecionado por proposta.</p>
                        </div>
                    </div>

                    <!-- PÁGINA 6: Confirmação -->
                    <div v-else-if="currentPage === 6" class="page">
                        <h4>Confirmação da Proposta</h4>

                        <div class="resumo">
                            <div class="resumo-section">
                                <h5>Cliente</h5>
                                <p>{{ cliente.nome }} ({{ cliente.tipoPessoa }})</p>
                            </div>

                            <div v-if="colaboradorSelecionado" class="resumo-section">
                                <h5>Colaborador Responsável</h5>
                                <div class="colaborador-resumo">
                                    <p><strong>Nome:</strong> {{ colaboradorSelecionado.nome }}</p>
                                    <p v-if="colaboradorSelecionado.funcao"><strong>Função:</strong> {{
                                        colaboradorSelecionado.funcao }}</p>
                                </div>
                            </div>
                            <div v-else class="resumo-section">
                                <h5>Colaborador Responsável</h5>
                                <p><em>Nenhum colaborador atribuído</em></p>
                            </div>

                            <div class="resumo-section" v-if="form.convenioId && convenioSelecionado">
                                <h5>Origem do Cliente</h5>
                                <p>{{ convenioSelecionado.nome }}</p>
                                <p v-if="convenioSelecionado.descricao" class="convenio-descricao-resumo">
                                    <small>{{ convenioSelecionado.descricao }}</small>
                                </p>
                            </div>

                            <div class="resumo-section">
                                <h5>Itens da Proposta ({{ form.itens.length }})</h5>
                                <div v-for="(item, index) in form.itens" :key="index" class="resumo-item">
                                    <p><strong>Item {{ index + 1 }}:</strong> {{ getNomeServico(item.servicoId) }}</p>
                                    <p v-if="item.microServicoIds.length > 0">
                                        Micro Serviços: {{ item.microServicoIds.length }} selecionados
                                    </p>
                                    <p v-if="item.valorTotal > 0">Valor: R$ {{ item.valorTotal.toFixed(2) }}</p>
                                </div>
                            </div>

                            <div class="resumo-section" v-if="form.custos.length > 0">
                                <h5>Custos Adicionais ({{ form.custos.length }})</h5>
                                <div v-for="(custo, index) in form.custos" :key="index" class="resumo-item">
                                    <p><strong>{{ custo.nome || 'Custo sem nome' }}:</strong> R$ {{
                                        (parseFloat(custo.valor) || 0).toFixed(2) }}</p>
                                </div>
                            </div>

                            <div class="resumo-section" v-if="form.tipoDesconto !== 'NENHUM'">
                                <h5>Desconto Aplicado</h5>
                                <p>
                                    <strong>Tipo:</strong>
                                    {{ form.tipoDesconto === 'VALOR' ? 'Valor Fixo' : 'Porcentagem' }}<br>
                                    <span v-if="form.tipoDesconto === 'VALOR'">
                                        <strong>Valor:</strong> R$ {{ (form.valorDesconto || 0).toFixed(2) }}
                                    </span>
                                    <span v-if="form.tipoDesconto === 'PORCENTAGEM'">
                                        <strong>Porcentagem:</strong> {{ form.porcentagemDesconto || 0 }}%
                                    </span>
                                </p>
                            </div>

                            <div class="resumo-section total">
                                <h5>Valor Total Estimado</h5>
                                <p class="total-valor">R$ {{ calcularValorTotalProposta().toFixed(2) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button v-if="currentPage > 1" type="button" class="btn-secondary" @click="prevPage">
                        Voltar
                    </button>

                    <button v-if="currentPage < 6" type="button" class="btn-primary" @click="nextPage"
                        :disabled="!validarPaginaAtual()">
                        Próximo
                    </button>

                    <button v-if="currentPage === 6" type="button" class="btn-submit" @click="criarProposta"
                        :disabled="loading">
                        <span v-if="loading">Criando...</span>
                        <span v-else>Criar Proposta</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import servicoService from "../../services/servicoServices";
import subservicoService from "../../services/subservicoService";
import convenioService from "../../services/convenioService";
import propostaService from "../../services/propostaService";
import custoService from "../../services/custoService";
import itemPropostaService from "../../services/itemPropostaService";
import colaboradorService from "../../services/colaboradorService";

const props = defineProps({
    cliente: { type: Object, required: true }
});

const emit = defineEmits(["close", "created"]);

const themeStore = useThemeStore();
const authStore = useAuthStore();
const theme = computed(() => themeStore.theme);

// Estado
const currentPage = ref(1);
const servicos = ref([]);
const colaboradores = ref([]);
const convenios = ref([]);
const visible = ref(true);
const modalElement = ref(null);
const loading = ref(false);
const mostrarModalColaboradores = ref(false);

// Formulário principal
const form = ref({
    // Página 1
    itens: [{
        servicoId: "",
        microServicoIds: [],
        microServicosDisponiveis: [],
        valorHora: 0,
        qtdHora: 0,
        valorTotal: 0
    }],

    // Página 2
    custos: [{
        nome: "",
        valor: 0
    }],

    // Página 3
    tipoDesconto: "NENHUM",
    valorDesconto: 0,
    porcentagemDesconto: 0,

    // Página 4 (nova)
    colaboradorSelecao: "NENHUM", // "NENHUM" ou "SELECIONAR"
    colaboradorId: null,

    // Página 5 (antiga 4)
    convenioId: null
});

// Computed
const convenioSelecionado = computed(() => {
    if (!form.value.convenioId) return null;
    return convenios.value.find(c => c.id === form.value.convenioId);
});

const colaboradorSelecionado = computed(() => {
    if (!form.value.colaboradorId) return null;
    return colaboradores.value.find(c => c.id === form.value.colaboradorId);
});

// Carregar dados iniciais
const carregarDados = async () => {
    try {
        const empresaId = authStore.empresa?.empresaId;
        if (!empresaId) {
            console.error("EmpresaId não encontrado");
            return;
        }

        // Carregar serviços
        const resServicos = await servicoService.listarTodos(empresaId);
        servicos.value = resServicos.data || [];

        // Carregar colaboradores
        const resColaboradores = await colaboradorService.listarPorEmpresa(empresaId);
        colaboradores.value = resColaboradores.data || [];

        // Carregar convênios
        const resConvenios = await convenioService.listarPorEmpresa(empresaId);
        convenios.value = resConvenios.data || [];
    } catch (err) {
        console.error("Erro ao carregar dados:", err);
        window.alert("Erro ao carregar dados: " + (err.response?.data?.message || err.message));
    }
};

// Validação de página - ATUALIZADA
const validarPaginaAtual = () => {
    switch (currentPage.value) {
        case 1:
            // Verificar se todos os itens têm serviço e micro serviços selecionados
            const todosItensValidos = form.value.itens.every(item =>
                item.servicoId && item.microServicoIds.length > 0
            );

            // Verificar se todos os itens têm valores de hora e quantidade válidos
            const todosValoresValidos = form.value.itens.every(item => {
                const valorHora = parseFloat(item.valorHora) || 0;
                const qtdHora = parseFloat(item.qtdHora) || 0;
                return valorHora > 0 && qtdHora > 0;
            });

            return todosItensValidos && todosValoresValidos && form.value.itens.length > 0;

        case 2:
            // Verificar se todos os custos têm nome e valor válidos
            if (form.value.custos.length === 0) {
                return true; // Custos são opcionais
            }
            return form.value.custos.every(custo =>
                custo.nome && custo.nome.trim() !== '' &&
                (parseFloat(custo.valor) || 0) >= 0
            );

        case 3:
            // Se selecionou desconto em valor, precisa ter valor maior que 0
            if (form.value.tipoDesconto === 'VALOR') {
                return (parseFloat(form.value.valorDesconto) || 0) > 0;
            }
            // Se selecionou desconto em porcentagem, precisa ter porcentagem entre 0-100
            if (form.value.tipoDesconto === 'PORCENTAGEM') {
                const porcentagem = parseFloat(form.value.porcentagemDesconto) || 0;
                return porcentagem > 0 && porcentagem <= 100;
            }
            // Se selecionou "Nenhum Desconto", é válido
            return true;

        case 4:
            // Se selecionou "SELECIONAR", precisa escolher um colaborador
            if (form.value.colaboradorSelecao === 'SELECIONAR') {
                return form.value.colaboradorId !== null && form.value.colaboradorId !== '';
            }
            // Se selecionou "NENHUM", é válido
            return true;

        case 5:
            // A página 5 sempre é válida (convênio é opcional)
            return true;

        default:
            return true;
    }
};

// Funções para Página 1
const adicionarItem = () => {
    form.value.itens.push({
        servicoId: "",
        microServicoIds: [],
        microServicosDisponiveis: [],
        valorHora: 0,
        qtdHora: 0,
        valorTotal: 0
    });
};

const removerItem = (index) => {
    if (form.value.itens.length > 1) {
        form.value.itens.splice(index, 1);
    }
};

const carregarMicroServicos = async (item) => {
    try {
        if (!item.servicoId) {
            item.microServicosDisponiveis = [];
            item.microServicoIds = [];
            return;
        }

        const res = await subservicoService.listarTodos(item.servicoId);
        item.microServicosDisponiveis = res.data || [];
        item.microServicoIds = [];
        item.valorTotal = 0;
    } catch (err) {
        console.error("Erro ao carregar micro serviços:", err);
        item.microServicosDisponiveis = [];
    }
};

const carregarValoresMicroServico = async (item) => {
    calcularValorTotal(item);
};

const calcularValorTotal = (item) => {
    const valorHora = parseFloat(item.valorHora) || 0;
    const qtdHora = parseFloat(item.qtdHora) || 0;
    item.valorTotal = valorHora * qtdHora;
};

// Funções para Página 2
const adicionarCusto = () => {
    form.value.custos.push({
        nome: "",
        valor: 0
    });
};

const removerCusto = (index) => {
    if (form.value.custos.length > 1) {
        form.value.custos.splice(index, 1);
    }
};

// Funções para Página 4 (Colaboradores)
const abrirGerenciarColaboradores = () => {
    mostrarModalColaboradores.value = true;
};

const fecharModalColaboradores = () => {
    mostrarModalColaboradores.value = false;
};

const recarregarColaboradores = async () => {
    try {
        const empresaId = authStore.empresa?.empresaId;
        if (!empresaId) return;

        const resColaboradores = await colaboradorService.listarPorEmpresa(empresaId);
        colaboradores.value = resColaboradores.data || [];
    } catch (err) {
        console.error("Erro ao recarregar colaboradores:", err);
    }
};

// Formatar telefone para exibição
const formatarTelefone = (telefone) => {
    if (!telefone) return '';
    // Remove caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');

    if (numeros.length === 10) {
        return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
    } else if (numeros.length === 11) {
        return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
    }

    return telefone;
};

// Funções para Página 6
const getNomeServico = (servicoId) => {
    if (!servicoId) return "Serviço não selecionado";
    const servico = servicos.value.find(s => s.id === servicoId);
    return servico ? servico.nome : "Serviço não encontrado";
};

const calcularValorTotalProposta = () => {
    let totalItens = 0;

    // Soma dos itens
    form.value.itens.forEach(item => {
        totalItens += item.valorTotal || 0;
    });

    let totalCustos = 0;
    // Soma dos custos
    form.value.custos.forEach(custo => {
        totalCustos += parseFloat(custo.valor) || 0;
    });

    let totalComDesconto = totalItens + totalCustos;

    // Aplica desconto se houver
    if (form.value.tipoDesconto === 'VALOR') {
        const desconto = parseFloat(form.value.valorDesconto) || 0;
        totalComDesconto -= desconto;
    } else if (form.value.tipoDesconto === 'PORCENTAGEM') {
        const porcentagem = parseFloat(form.value.porcentagemDesconto) || 0;
        const desconto = totalComDesconto * (porcentagem / 100);
        totalComDesconto -= desconto;
    }

    return Math.max(0, totalComDesconto);
};

// Navegação
const nextPage = () => {
    if (currentPage.value < 6 && validarPaginaAtual()) {
        currentPage.value++;
    } else {
        // Mostrar mensagem de erro se a página não for válida
        mostrarErroValidacao();
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

// Mostrar erro de validação - ATUALIZADA
const mostrarErroValidacao = () => {
    let mensagem = "";

    switch (currentPage.value) {
        case 1:
            mensagem = "Por favor, preencha todos os itens da proposta:\n";
            mensagem += "- Selecione um serviço para cada item\n";
            mensagem += "- Selecione pelo menos um micro serviço\n";
            mensagem += "- Informe valor por hora e quantidade de horas válidos (maiores que 0)";
            break;
        case 2:
            mensagem = "Por favor, corrija os custos adicionais:\n";
            mensagem += "- Todos os custos devem ter um nome\n";
            mensagem += "- O valor deve ser um número válido (pode ser 0)";
            break;
        case 3:
            if (form.value.tipoDesconto === 'VALOR') {
                mensagem = "Por favor, informe um valor de desconto válido (maior que 0)";
            } else if (form.value.tipoDesconto === 'PORCENTAGEM') {
                mensagem = "Por favor, informe uma porcentagem de desconto válida (entre 0.1% e 100%)";
            }
            break;
        case 4:
            if (form.value.colaboradorSelecao === 'SELECIONAR') {
                mensagem = "Por favor, selecione um colaborador da lista ou altere a opção para 'Não atribuir colaborador'";
            }
            break;
    }

    if (mensagem) {
        window.alert(mensagem);
    }
};

// Criar proposta - ATUALIZADA
const criarProposta = async () => {
    try {
        loading.value = true;

        const empresaId = authStore.empresa?.empresaId;
        if (!empresaId) {
            throw new Error("Empresa não encontrada");
        }

        console.log("=== INICIANDO CRIAÇÃO DE PROPOSTA ===");
        console.log("Empresa ID:", empresaId);
        console.log("Cliente ID:", props.cliente.id);
        console.log("colaborador ID:", form.value.colaboradorId);
        console.log("Convênio ID:", form.value.convenioId);

        // Validar dados obrigatórios
        const itensValidos = form.value.itens.filter(item =>
            item.servicoId && item.microServicoIds.length > 0
        );

        if (itensValidos.length === 0) {
            window.alert("Adicione pelo menos um item válido à proposta!");
            currentPage.value = 1;
            loading.value = false;
            return;
        }

        // PASSO 1: Criar custos em PARALELO com Promise.all
        const custosIds = [];

        const custosPromises = form.value.custos
            .filter(custo => custo.nome && custo.valor > 0)
            .map(async (custo) => {
                try {
                    const dadosCusto = {
                        empresaId: Number(empresaId),
                        nome: custo.nome.trim(),
                        valor: parseFloat(custo.valor)
                    };

                    console.log(`🔄 Criando custo: ${custo.nome}`, dadosCusto);
                    const response = await custoService.criar(dadosCusto);

                    // Extrair ID da resposta
                    let custoId = null;
                    if (response && response.data && response.data.id) {
                        custoId = Number(response.data.id);
                    } else if (response && response.id) {
                        custoId = Number(response.id);
                    }

                    if (custoId) {
                        console.log(`✅ Custo "${custo.nome}" criado com ID: ${custoId}`);
                        return custoId;
                    } else {
                        console.warn(`⚠️ Custo criado mas ID não encontrado`);
                        return null;
                    }
                } catch (err) {
                    console.error(`❌ Erro ao criar custo "${custo.nome}":`, err);
                    throw new Error(`Falha ao criar custo "${custo.nome}": ${err.message}`);
                }
            });

        // Executar todas as promessas de custo em paralelo
        if (custosPromises.length > 0) {
            try {
                const custosResults = await Promise.all(custosPromises);
                custosIds.push(...custosResults.filter(id => id !== null));
                console.log("📋 IDs dos custos criados:", custosIds);
            } catch (err) {
                window.alert(`Erro ao criar custos: ${err.message}`);
                loading.value = false;
                return;
            }
        }

        // PASSO 2: Criar todos os itens da proposta em PARALELO com Promise.all
        const itemPropostaIds = [];

        // Preparar array de promessas para criar itens
        const itemPropostaPromises = [];

        for (const item of itensValidos) {
            for (const microServicoId of item.microServicoIds) {
                // Criar função assíncrona para cada item
                const criarItemPromise = (async () => {
                    try {
                        const dadosItem = {
                            servicoId: Number(item.servicoId),
                            microServicoId: Number(microServicoId),
                            valorHora: parseFloat(item.valorHora) || 0,
                            quantidadeHoras: parseFloat(item.qtdHora) || 0,
                            valorTotal: parseFloat(item.valorTotal) || 0
                        };

                        console.log("🔄 Criando item da proposta:", dadosItem);
                        const response = await itemPropostaService.criar(dadosItem);

                        // Extrair ID da resposta
                        let itemId = null;
                        if (response && response.data && response.data.id) {
                            itemId = Number(response.data.id);
                        } else if (response && response.id) {
                            itemId = Number(response.id);
                        } else if (response && typeof response === 'object' && response.id) {
                            itemId = Number(response.id);
                        }

                        if (itemId) {
                            console.log(`✅ Item criado com ID: ${itemId}`);
                            return itemId;
                        } else {
                            console.warn("⚠️ Item criado mas ID não encontrado");
                            return null;
                        }
                    } catch (err) {
                        console.error("❌ Erro ao criar item da proposta:", err);
                        throw new Error(`Falha ao criar item: ${err.message}`);
                    }
                })();

                itemPropostaPromises.push(criarItemPromise);
            }
        }

        // Executar todas as promessas de item em paralelo
        if (itemPropostaPromises.length > 0) {
            try {
                const itemResults = await Promise.all(itemPropostaPromises);
                itemPropostaIds.push(...itemResults.filter(id => id !== null));
                console.log("📋 IDs dos itens criados:", itemPropostaIds);
            } catch (err) {
                window.alert(`Erro ao criar itens da proposta: ${err.message}`);
                loading.value = false;
                return;
            }
        }

        // Verificar se temos pelo menos um item
        if (itemPropostaIds.length === 0) {
            window.alert("Nenhum item da proposta foi criado!");
            loading.value = false;
            return;
        }

        // PASSO 3: Preparar dados da proposta COM COLABORADOR
        const dadosProposta = {
            empresaId: Number(empresaId),
            clienteId: Number(props.cliente.id),
            convenioId: form.value.convenioId ? Number(form.value.convenioId) : null,
            colaboradorId: form.value.colaboradorSelecao === 'SELECIONAR' && form.value.colaboradorId
                ? Number(form.value.colaboradorId)
                : null,
            custoList: custosIds,
            itemPropostaList: itemPropostaIds,
            tipoDesconto: form.value.tipoDesconto,
            desconto: form.value.tipoDesconto !== 'NENHUM',
            valorDesconto: form.value.tipoDesconto === 'VALOR' ? parseFloat(form.value.valorDesconto) || 0 : 0,
            porcentagemDesconto: form.value.tipoDesconto === 'PORCENTAGEM' ? parseFloat(form.value.porcentagemDesconto) || 0 : 0
        };

        console.log(form.value.colaboradorId);
        console.log("📤 Dados da proposta para enviar:", dadosProposta);

        // PASSO 4: Criar a proposta
        try {
            console.log("🚀 Enviando proposta para o backend...");
            const responseProposta = await propostaService.criar(dadosProposta);
            console.log("✅ Proposta criada com sucesso!", responseProposta);

            window.alert("Proposta criada com sucesso!");
            emit("created");
            handleClose();
        } catch (err) {
            console.error("❌ Erro ao criar proposta:", err);
            window.alert(`Erro ao criar proposta: ${err.message || 'Erro desconhecido'}`);
        }
    } catch (err) {
        console.error("💥 Erro geral no processo:", err);
    } finally {
        loading.value = false;
    }
};

// Função para fechar o modal
const handleClose = () => {
    visible.value = false;
    // Pequeno delay para permitir a animação
    setTimeout(() => {
        emit("close");
    }, 300);
};

// Fechar com ESC
const handleEscape = (event) => {
    if (event.key === 'Escape') {
        handleClose();
    }
};

// Watch para resetar colaboradorId quando mudar a seleção
watch(() => form.value.colaboradorSelecao, (newVal) => {
    if (newVal === 'NENHUM') {
        form.value.colaboradorId = null;
    }
});

// Adicionar listener para ESC
onMounted(() => {
    document.addEventListener('keydown', handleEscape);

    // Focar no modal para melhor acessibilidade
    nextTick(() => {
        if (modalElement.value) {
            modalElement.value.focus();
        }
    });

    carregarDados();
});

// Remover listener
onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
/* Estilos básicos do modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
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
    width: 750px;
    max-width: 90vw;
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
    padding: 24px 32px 16px;
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

/* Progress bar */
.progress-bar {
    margin: 0 32px 24px;
    position: relative;
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
}

.modal.dark .progress-bar {
    background: #374151;
}

.progress {
    position: absolute;
    height: 100%;
    background: linear-gradient(90deg, #daa520, #e6b800);
    border-radius: 2px;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.steps {
    display: flex;
    justify-content: space-between;
    margin-top: -12px;
}

.steps span {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    transition: all 0.3s ease;
}

.modal.dark .steps span {
    background: #374151;
    color: #9ca3af;
}

.steps span.active {
    background: #daa520;
    color: #fff;
    transform: scale(1.1);
    box-shadow: 0 0 0 3px rgba(218, 165, 32, 0.2);
}

.modal.dark .steps span.active {
    background: #daa520;
    color: #1e1e1e;
}

/* Conteúdo do modal */
.modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 32px 20px;
    scrollbar-width: thin;
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

.page {
    padding-bottom: 24px;
}

.page h4 {
    margin: 0 0 20px 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #111827;
}

.modal.dark .page h4 {
    color: #f0f0f0;
}

/* Page header */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.btn-add,
.btn-remove {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.btn-add {
    background: linear-gradient(135deg, #daa520, #e6b800);
    color: #fff;
    box-shadow: 0 2px 4px rgba(218, 165, 32, 0.3);
}

.btn-add:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(218, 165, 32, 0.4);
}

.btn-remove {
    background: transparent;
    border: 1px solid #ef4444;
    color: #ef4444;
}

.modal.dark .btn-remove {
    border-color: #f87171;
    color: #f87171;
}

.btn-remove:hover {
    background: #fef2f2;
}

.modal.dark .btn-remove:hover {
    background: rgba(239, 68, 68, 0.1);
}

/* Item containers */
.item-container {
    background: #f9fafb;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    border: 1px solid #e5e7eb;
}

.modal.dark .item-container {
    background: #2d2d2d;
    border-color: #374151;
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
}

.modal.dark .item-header {
    border-color: #374151;
}

.item-header h5 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
}

.modal.dark .item-header h5 {
    color: #f0f0f0;
}

/* Form styles */
.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
}

.modal.dark .form-group label {
    color: #d1d5db;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

input,
select,
textarea {
    width: 100%;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    font-size: 0.9rem;
    font-family: inherit;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.modal.light input,
.modal.light select,
.modal.light textarea {
    background: #fff;
    color: #111827;
}

.modal.dark input,
.modal.dark select,
.modal.dark textarea {
    background: #374151;
    border-color: #4b5563;
    color: #f0f0f0;
}

input:focus,
select:focus,
textarea:focus {
    outline: none;
    border-color: #daa520;
    box-shadow: 0 0 0 3px rgba(218, 165, 32, 0.1);
}

.modal.dark input:focus,
.modal.dark select:focus,
.modal.dark textarea:focus {
    box-shadow: 0 0 0 3px rgba(218, 165, 32, 0.2);
}

select[multiple] {
    min-height: 120px;
    resize: vertical;
}

small {
    display: block;
    margin-top: 4px;
    font-size: 0.8rem;
    color: #6b7280;
}

.modal.dark small {
    color: #9ca3af;
}

.valor-total {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    text-align: right;
    font-size: 1rem;
}

.modal.dark .valor-total {
    border-color: #374151;
}

/* Radio groups */
.radio-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
}

.radio-option {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
}

.radio-option:hover {
    background: #f3f4f6;
}

.modal.dark .radio-option:hover {
    background: #374151;
}

.radio-option input[type="radio"] {
    margin: 0;
    accent-color: #daa520;
}

.radio-option span {
    font-size: 0.9rem;
}

/* Estilos adicionais para a nova página de colaborador */
.radio-option.large {
    padding: 16px;
    border-radius: 12px;
    border: 2px solid #e5e7eb;
    transition: all 0.2s ease;
    margin-bottom: 12px;
}

.modal.dark .radio-option.large {
    border-color: #4b5563;
}

.radio-option.large:hover {
    border-color: #daa520;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.radio-option.large input[type="radio"]:checked~.option-content {
    color: #daa520;
}

.option-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
}

.option-title {
    font-weight: 600;
    font-size: 1rem;
    color: #111827;
}

.modal.dark .option-title {
    color: #f0f0f0;
}

.option-description {
    font-size: 0.85rem;
    color: #6b7280;
}

.modal.dark .option-description {
    color: #9ca3af;
}

.page-subtitle {
    color: #6b7280;
    font-size: 0.9rem;
    margin: -8px 0 20px 0;
}

.modal.dark .page-subtitle {
    color: #9ca3af;
}

/* Seleção de colaborador */
.colaborador-selection {
    margin-top: 20px;
    padding: 20px;
    background: #f9fafb;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
}

.modal.dark .colaborador-selection {
    background: #2d2d2d;
    border-color: #374151;
}

.colaborador-select {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 2px solid #d1d5db;
    font-size: 1rem;
    transition: all 0.2s ease;
}

.colaborador-select:focus {
    border-color: #daa520;
    outline: none;
    box-shadow: 0 0 0 3px rgba(218, 165, 32, 0.1);
}

/* Card de informações do colaborador */
.colaborador-info-card {
    margin-top: 20px;
    background: white;
    border-radius: 12px;
    border: 2px solid #10b981;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.modal.dark .colaborador-info-card {
    background: #1a1a1a;
    border-color: #34d399;
}

.colaborador-info-header {
    background: linear-gradient(135deg, #10b981, #34d399);
    padding: 16px;
    color: white;
}

.colaborador-info-header h5 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
}

.colaborador-info-content {
    padding: 20px;
}

.colaborador-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #e5e7eb;
}

.modal.dark .colaborador-info-row {
    border-color: #374151;
}

.colaborador-info-row:last-child {
    border-bottom: none;
}

.colaborador-info-row .label {
    font-weight: 600;
    color: #6b7280;
    font-size: 0.9rem;
}

.modal.dark .colaborador-info-row .label {
    color: #9ca3af;
}

.colaborador-info-row .value {
    font-size: 0.95rem;
    color: #111827;
    text-align: right;
}

.modal.dark .colaborador-info-row .value {
    color: #f0f0f0;
}

/* Badge de função */
.funcao-badge {
    display: inline-block;
    padding: 4px 10px;
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    color: white;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Botão de gerenciar colaboradores */
.colaborador-management {
    margin-top: 20px;
    text-align: center;
}

.btn-manage-colaboradores {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-manage-colaboradores:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-manage-colaboradores svg {
    width: 16px;
    height: 16px;
}

/* Desconto preview */
.desconto-preview {
    background: #f0f9ff;
    padding: 16px;
    border-radius: 8px;
    margin-top: 20px;
    border-left: 4px solid #0ea5e9;
}

.modal.dark .desconto-preview {
    background: #1e3a8a;
    border-color: #3b82f6;
}

/* Convênio styles */
.convenio-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
}

.convenio-item {
    padding: 16px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    transition: all 0.2s ease;
    background: #f9fafb;
}

.modal.dark .convenio-item {
    border-color: #4b5563;
    background: #2d2d2d;
}

.convenio-item:hover {
    border-color: #daa520;
    transform: translateY(-2px);
}

.modal.dark .convenio-item:hover {
    border-color: #daa520;
}

.convenio-item.selected {
    border-color: #10b981;
    background: #f0fdf4;
    border-width: 2px;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

.modal.dark .convenio-item.selected {
    border-color: #34d399;
    background: #064e3b;
    box-shadow: 0 2px 8px rgba(52, 211, 153, 0.3);
}

.convenio-item .radio-option {
    background: transparent !important;
    padding: 0;
}

.convenio-item.selected .radio-option {
    background: transparent !important;
}

.convenio-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
}

.convenio-nome {
    font-weight: 600;
    color: #111827;
    font-size: 1rem;
}

.modal.dark .convenio-nome {
    color: #f0f0f0;
}

.convenio-descricao {
    font-size: 0.85rem;
    color: #6b7280;
    line-height: 1.4;
}

.modal.dark .convenio-descricao {
    color: #9ca3af;
}

.convenio-item.selected .convenio-nome {
    color: #047857;
}

.modal.dark .convenio-item.selected .convenio-nome {
    color: #a7f3d0;
}

.convenio-item.selected .convenio-descricao {
    color: #059669;
}

.modal.dark .convenio-item.selected .convenio-descricao {
    color: #6ee7b7;
}

.info-box {
    margin-top: 24px;
    padding: 16px;
    background: #f0f9ff;
    border-radius: 12px;
    border-left: 4px solid #0ea5e9;
}

.modal.dark .info-box {
    background: #1e3a8a;
    border-color: #3b82f6;
}

.info-box p {
    margin: 0;
    font-size: 0.85rem;
    color: #374151;
    line-height: 1.5;
}

.modal.dark .info-box p {
    color: #d1d5db;
}

/* Resumo styles */
.resumo {
    max-height: 400px;
    overflow-y: auto;
    padding-right: 8px;
}

.resumo-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e5e7eb;
}

.modal.dark .resumo-section {
    border-color: #374151;
}

.resumo-section:last-child {
    border-bottom: none;
}

.resumo-section h5 {
    margin: 0 0 12px 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.modal.dark .resumo-section h5 {
    color: #9ca3af;
}

.resumo-item {
    margin-bottom: 12px;
    padding-left: 16px;
    border-left: 3px solid #e5e7eb;
}

.modal.dark .resumo-item {
    border-color: #4b5563;
}

.resumo-item p {
    margin: 6px 0;
    font-size: 0.9rem;
    line-height: 1.4;
}

/* Resumo do colaborador */
.colaborador-resumo p {
    margin: 8px 0;
    font-size: 0.9rem;
}

.convenio-descricao-resumo {
    margin-top: 8px;
    color: #6b7280;
    font-size: 0.85rem;
}

.modal.dark .convenio-descricao-resumo {
    color: #9ca3af;
}

.resumo-section.total {
    text-align: right;
    padding-top: 20px;
}

.total-valor {
    font-size: 2rem;
    font-weight: 700;
    color: #daa520;
    margin: 8px 0 0 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Modal actions */
.modal-actions {
    display: flex;
    justify-content: space-between;
    padding: 24px 32px;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
}

.modal.dark .modal-actions {
    background: #2d2d2d;
    border-color: #374151;
}

.btn-secondary,
.btn-primary,
.btn-submit {
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    min-width: 100px;
}

.btn-secondary:disabled,
.btn-primary:disabled,
.btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #9ca3af !important;
    color: #6b7280 !important;
    transform: none !important;
    box-shadow: none !important;
}

.modal.dark .btn-secondary:disabled,
.modal.dark .btn-primary:disabled,
.modal.dark .btn-submit:disabled {
    background: #4b5563 !important;
    color: #9ca3af !important;
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
}

.modal.dark .btn-secondary {
    background: #374151;
    color: #d1d5db;
    border-color: #4b5563;
}

.btn-secondary:hover:not(:disabled) {
    background: #e5e7eb;
    transform: translateY(-1px);
}

.modal.dark .btn-secondary:hover:not(:disabled) {
    background: #4b5563;
}

.btn-primary {
    background: linear-gradient(135deg, #111827, #374151);
    color: white;
    margin-left: auto;
}

.modal.dark .btn-primary {
    background: linear-gradient(135deg, #daa520, #e6b800);
    color: #1e1e1e;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-submit {
    background: linear-gradient(135deg, #10b981, #34d399);
    color: white;
    margin-left: auto;
}

.btn-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Animations */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

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
    }

    .form-row {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .radio-option.large {
        padding: 12px;
    }

    .colaborador-selection {
        padding: 16px;
    }

    .convenio-options {
        gap: 8px;
    }

    .convenio-item {
        padding: 12px;
    }

    .modal-actions {
        padding: 20px;
        flex-direction: column;
        gap: 12px;
    }

    .btn-secondary,
    .btn-primary,
    .btn-submit {
        width: 100%;
        margin-left: 0;
    }

    .steps span {
        width: 20px;
        height: 20px;
        font-size: 0.7rem;
    }
}
</style>