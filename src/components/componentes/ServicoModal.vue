<template>
  <div class="modal-backdrop" @click.self="closeModal" :class="theme">
    <div class="modal" :class="theme">
      <div class="modal-header">
        <h3>Gerenciar Serviços</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <div class="modal-content">
        <div class="add-section">
          <h4>Adicionar Novo Serviço</h4>
          <form @submit.prevent="handleSubmit" class="add-form">
            <div class="form-group">
              <label>Nome do Serviço *</label>
              <input 
                v-model="form.nome" 
                placeholder="Digite o nome do serviço" 
                required 
                :disabled="loading"
                ref="nomeInput"
              />
            </div>
            
            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading">Criando...</span>
              <span v-else>Criar Serviço</span>
            </button>
            
            <div v-if="successMessage" class="success-message">
              ✓ {{ successMessage }}
            </div>
          </form>
        </div>
        
        <div class="list-section">
          <div class="list-header">
            <h4>Serviços Cadastrados</h4>
            <button 
              class="btn-refresh" 
              @click="carregarServicos"
              :disabled="loadingList"
              title="Atualizar lista"
            >
              <span v-if="loadingList">⟳</span>
              <span v-else>↻</span>
            </button>
          </div>
          
          <div class="servicos-list" v-if="!loadingList && servicos.length > 0">
            <div 
              v-for="servico in servicos" 
              :key="servico.id" 
              class="servico-item"
            >
              {{ servico.nome }}
            </div>
          </div>
          
          <div class="empty-state" v-else-if="!loadingList && servicos.length === 0">
            Nenhum serviço cadastrado ainda.
          </div>
          
          <div class="loading-state" v-else>
            Carregando serviços...
          </div>
          
          <div class="list-info">
            <small>Total: {{ servicos.length }} serviço(s)</small>
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
import servicoService from "../../services/servicoServices";
import { notify } from '../../services/notificationService';

const emit = defineEmits(["close", "created"]);

const themeStore = useThemeStore();
const authStore = useAuthStore();
const theme = computed(() => themeStore.theme);

const form = ref({
  nome: ""
});

const servicos = ref([]);
const loading = ref(false);
const loadingList = ref(false);
const nomeInput = ref(null);
const successMessage = ref("");

const empresaId = computed(() => authStore.empresa?.empresaId);

onMounted(() => {
  carregarServicos();
});

const carregarServicos = async () => {
  if (!empresaId.value) return;
  
  try {
    loadingList.value = true;
    const response = await servicoService.listarTodos(empresaId.value);
    servicos.value = response.data || [];
  } catch (err) {
    notify.error('Erro ao carregar serviços');
  } finally {
    loadingList.value = false;
  }
};

const handleSubmit = async () => {
  if (!form.value.nome.trim()) {
    successMessage.value = "Por favor, informe um nome para o serviço";
    setTimeout(() => successMessage.value = "", 3000);
    return;
  }
  
  if (!empresaId.value) {
    successMessage.value = "Empresa não identificada";
    setTimeout(() => successMessage.value = "", 3000);
    return;
  }
  
  try {
    loading.value = true;
    successMessage.value = "";
    
    const dados = {
      id: empresaId.value,
      nome: form.value.nome.trim()
    };

    await servicoService.criarServico(dados);
    
    form.value.nome = "";
    
    await nextTick();
    if (nomeInput.value) {
      nomeInput.value.focus();
    }
    
    await carregarServicos();

    notify.success('Serviço criado com sucesso!');
    
    emit("created");    
  } catch (err) {
    notify.error('Erro ao criar serviço');
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
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
  width: 800px;
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

input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.modal.light input {
  border-color: #e6e6e6;
  background: #fff;
  color: #333;
}

.modal.light input:focus {
  border-color: #daa520;
  outline: none;
  box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.1);
}

.modal.dark input {
  border-color: #444;
  background: #2a2a2a;
  color: #daa520;
}

.modal.dark input:focus {
  border-color: #daa520;
  outline: none;
  box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.2);
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

.modal.dark .success-message {
  background: #059669;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

.servicos-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid;
  border-radius: 8px;
  padding: 8px;
  min-height: 200px;
  max-height: 300px;
}

.modal.light .servicos-list {
  border-color: #e6e6e6;
  background: #fafafa;
}

.modal.dark .servicos-list {
  border-color: #444;
  background: #2a2a2a;
}

.servico-item {
  padding: 10px 12px;
  border-bottom: 1px solid;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.modal.light .servico-item {
  border-color: #f0f0f0;
  color: #333;
}

.modal.dark .servico-item {
  border-color: #444;
  color: #daa520;
}

.servico-item:last-child {
  border-bottom: none;
}

.modal.light .servico-item:hover {
  background: #f8f9fa;
}

.modal.dark .servico-item:hover {
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
  min-height: 200px;
  max-height: 300px;
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
  
  .servicos-list {
    min-height: 150px;
    max-height: 200px;
  }
  
  .empty-state, .loading-state {
    min-height: 150px;
  }
}
</style>