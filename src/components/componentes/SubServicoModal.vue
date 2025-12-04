<template>
  <div class="modal-backdrop" @click.self="closeModal" :class="theme">
    <div class="modal" :class="theme">
      <div class="modal-header">
        <h3>Gerenciar Sub Serviços</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <div class="modal-content">
        <!-- Lado esquerdo: Adicionar subserviço -->
        <div class="add-section">
          <h4>Adicionar Novo Sub Serviço</h4>
          <form @submit.prevent="handleSubmit" class="add-form">
            <div class="form-group">
              <label>Nome do Sub Serviço *</label>
              <input 
                v-model="form.nome" 
                placeholder="Digite o nome do subserviço" 
                required 
                :disabled="loading"
                ref="nomeInput"
              />
            </div>
            
            <div class="form-group">
              <label>Serviço *</label>
              <select v-model="form.servicoId" required :disabled="loading || servicos.length === 0">
                <option value="">Selecione um serviço</option>
                <option v-for="servico in servicos" :key="servico.id" :value="servico.id">
                  {{ servico.nome }}
                </option>
              </select>
              <small v-if="servicos.length === 0" class="warning">
                Nenhum serviço cadastrado. Crie um serviço primeiro.
              </small>
            </div>
            
            <div class="form-group">
              <label>Descrição</label>
              <textarea 
                v-model="form.descricao" 
                placeholder="Descrição do subserviço" 
                rows="3"
                :disabled="loading"
              ></textarea>
            </div>
            
            <button type="submit" class="btn-submit" :disabled="loading || servicos.length === 0">
              <span v-if="loading">Criando...</span>
              <span v-else>Criar Sub Serviço</span>
            </button>
            
            <div v-if="successMessage" class="success-message">
              ✓ {{ successMessage }}
            </div>
            
            <div v-if="errorMessage" class="error-message">
              ✗ {{ errorMessage }}
            </div>
          </form>
        </div>
        
        <!-- Lado direito: Listar subserviços -->
        <div class="list-section">
          <div class="list-header">
            <h4>Sub Serviços Cadastrados</h4>
            <div class="list-controls">
              <select v-model="filtroServico" @change="filtrarSubservicos" class="filter-select">
                <option value="">Todos os serviços</option>
                <option v-for="servico in servicos" :key="servico.id" :value="servico.id">
                  {{ servico.nome }}
                </option>
              </select>
              <button 
                class="btn-refresh" 
                @click="carregarSubservicos"
                :disabled="loadingList"
                title="Atualizar lista"
              >
                <span v-if="loadingList">⟳</span>
                <span v-else>↻</span>
              </button>
            </div>
          </div>
          
          <div class="subservicos-list" v-if="!loadingList && subservicosFiltrados.length > 0">
            <div 
              v-for="subservico in subservicosFiltrados" 
              :key="subservico.id" 
              class="subservico-item"
            >
              <div class="subservico-nome">{{ subservico.nome }}</div>
              <div v-if="subservico.descricao" class="subservico-descricao">
                {{ subservico.descricao }}
              </div>
              <div class="subservico-servico">
                <small>Serviço: {{ getNomeServico(subservico.servicoId) }}</small>
              </div>
            </div>
          </div>
          
          <div class="empty-state" v-else-if="!loadingList && subservicosFiltrados.length === 0">
            <div v-if="filtroServico">
              Nenhum subserviço para o serviço selecionado.
            </div>
            <div v-else>
              Nenhum subserviço cadastrado ainda.
            </div>
          </div>
          
          <div class="loading-state" v-else>
            Carregando subserviços...
          </div>
          
          <div class="list-info">
            <small>
              Total: {{ subservicosFiltrados.length }} sub serviço(s)
              <span v-if="filtroServico"> (filtrado)</span>
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
import subservicoService from "../../services/subservicoService";
import servicoService from "../../services/servicoServices";

const emit = defineEmits(["close", "created"]);

const themeStore = useThemeStore();
const authStore = useAuthStore();
const theme = computed(() => themeStore.theme);

const servicos = ref([]);
const subservicos = ref([]);
const form = ref({
  nome: "",
  servicoId: "",
  descricao: ""
});

const filtroServico = ref("");
const loading = ref(false);
const loadingList = ref(false);
const loadingServicos = ref(false);
const nomeInput = ref(null);
const successMessage = ref("");
const errorMessage = ref("");

const empresaId = computed(() => authStore.empresa?.empresaId);

// Carregar dados ao abrir o modal
onMounted(() => {
  carregarDados();
});

const carregarDados = async () => {
  await carregarServicos();
  // Depois de carregar serviços, carrega subserviços
  await carregarSubservicos();
};

const carregarServicos = async () => {
  if (!empresaId.value) return;
  
  try {
    loadingServicos.value = true;
    const res = await servicoService.listarTodos(empresaId.value);
    servicos.value = res.data || [];
  } catch (err) {
    console.error("Erro ao carregar serviços:", err);
    errorMessage.value = "Erro ao carregar serviços";
    setTimeout(() => errorMessage.value = "", 3000);
  } finally {
    loadingServicos.value = false;
  }
};

const carregarSubservicos = async () => {
  if (!empresaId.value) return;
  
  try {
    loadingList.value = true;
    
    // Verificar qual endpoint está disponível no seu backend
    // Vou tentar duas abordagens:
    
    // Opção 1: Se houver um endpoint para listar todos os subserviços da empresa
    try {
      // Tente primeiro com um endpoint específico para empresa
      const response = await subservicoService.listarPorEmpresa(empresaId.value);
      if (response.data && Array.isArray(response.data)) {
        subservicos.value = response.data;
        console.log("Subserviços carregados via empresa:", subservicos.value);
        return;
      }
    } catch (err1) {
      console.log("Endpoint por empresa não disponível, tentando por serviços...");
    }
    
    // Opção 2: Carregar de cada serviço individualmente (fallback)
    const todosSubservicos = [];
    for (const servico of servicos.value) {
      try {
        const response = await subservicoService.listarTodos(servico.id);
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(sub => {
            todosSubservicos.push({
              ...sub,
              servicoId: servico.id // Garante que temos o ID do serviço
            });
          });
        }
      } catch (err) {
        console.error(`Erro ao carregar subserviços do serviço ${servico.id}:`, err);
      }
    }
    subservicos.value = todosSubservicos;
    console.log("Subserviços carregados via serviços individuais:", subservicos.value);
    
  } catch (err) {
    console.error("Erro geral ao carregar subserviços:", err);
    errorMessage.value = "Erro ao carregar subserviços: " + (err.message || "Verifique o console");
    setTimeout(() => errorMessage.value = "", 3000);
  } finally {
    loadingList.value = false;
  }
};

// Subserviços filtrados
const subservicosFiltrados = computed(() => {
  if (!filtroServico.value) {
    return subservicos.value;
  }
  return subservicos.value.filter(sub => sub.servicoId == filtroServico.value);
});

const filtrarSubservicos = () => {
  // Apenas atualiza a lista filtrada (já é computed)
};

const getNomeServico = (servicoId) => {
  const servico = servicos.value.find(s => s.id == servicoId);
  return servico ? servico.nome : "Serviço não encontrado";
};

const handleSubmit = async () => {
  if (!form.value.nome.trim()) {
    errorMessage.value = "Por favor, informe um nome para o subserviço";
    setTimeout(() => errorMessage.value = "", 3000);
    return;
  }
  
  if (!form.value.servicoId) {
    errorMessage.value = "Por favor, selecione um serviço";
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
    
    // Formatar dados corretamente para o backend
    const dados = {
      empresaId: empresaId.value,  // Envia empresaId
      servicoId: form.value.servicoId,  // Envia servicoId
      nome: form.value.nome.trim(),
      descricao: form.value.descricao.trim()
    };

    console.log("Enviando dados para criar subserviço:", dados);
    const response = await subservicoService.criar(dados);
    console.log("Resposta do servidor:", response);
    
    // Exibir mensagem de sucesso
    successMessage.value = "Subserviço criado com sucesso!";
    
    // Limpar formulário
    form.value.nome = "";
    form.value.descricao = "";
    // Mantém o mesmo serviço selecionado para adicionar outro subserviço
    
    // Focar novamente no campo de entrada
    await nextTick();
    if (nomeInput.value) {
      nomeInput.value.focus();
    }
    
    // Recarregar lista de subserviços
    await carregarSubservicos();
    
    // Emitir evento para o componente pai (se necessário)
    emit("created");
    
    // Limpar mensagem de sucesso após alguns segundos
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
    
  } catch (err) {
    console.error("Erro detalhado ao criar subserviço:", err);
    console.log("Status:", err.response?.status);
    console.log("Dados do erro:", err.response?.data);
    
    let mensagemErro = "Erro ao criar subserviço";
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
/* Mantenha o mesmo CSS da versão anterior */
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

.add-section, .list-section {
  display: flex;
  flex-direction: column;
}

.add-section h4, .list-section h4 {
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

input, select, textarea {
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
.modal.light select,
.modal.light textarea {
  border-color: #e6e6e6;
  background: #fff;
  color: #333;
}

.modal.light input:focus,
.modal.light select:focus,
.modal.light textarea:focus {
  border-color: #daa520;
  outline: none;
  box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.1);
}

.modal.dark input,
.modal.dark select,
.modal.dark textarea {
  border-color: #444;
  background: #2a2a2a;
  color: #daa520;
}

.modal.dark input:focus,
.modal.dark select:focus,
.modal.dark textarea:focus {
  border-color: #daa520;
  outline: none;
  box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.2);
}

textarea {
  resize: vertical;
  min-height: 80px;
}

small.warning {
  color: #e53e3e;
  font-style: italic;
}

.modal.dark small.warning {
  color: #fc8181;
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
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-refresh span {
  display: inline-block;
}

.btn-refresh:disabled span {
  animation: spin 1s linear infinite;
}

.subservicos-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid;
  border-radius: 8px;
  padding: 8px;
  min-height: 250px;
  max-height: 350px;
}

.modal.light .subservicos-list {
  border-color: #e6e6e6;
  background: #fafafa;
}

.modal.dark .subservicos-list {
  border-color: #444;
  background: #2a2a2a;
}

.subservico-item {
  padding: 12px;
  border-bottom: 1px solid;
  transition: all 0.3s ease;
}

.modal.light .subservico-item {
  border-color: #f0f0f0;
}

.modal.dark .subservico-item {
  border-color: #444;
}

.subservico-item:last-child {
  border-bottom: none;
}

.subservico-nome {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.modal.light .subservico-nome {
  color: #333;
}

.modal.dark .subservico-nome {
  color: #daa520;
}

.subservico-descricao {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
  line-height: 1.4;
}

.modal.dark .subservico-descricao {
  color: #888;
}

.subservico-servico small {
  font-size: 0.8rem;
  opacity: 0.7;
}

.modal.light .subservico-item:hover {
  background: #f8f9fa;
}

.modal.dark .subservico-item:hover {
  background: #333;
}

.empty-state, .loading-state {
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
  
  .subservicos-list {
    min-height: 200px;
    max-height: 250px;
  }
  
  .empty-state, .loading-state {
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