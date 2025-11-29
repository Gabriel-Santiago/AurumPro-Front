<template>
  <div class="modal-backdrop" @click.self="$emit('close')" :class="theme">
    <div class="modal" :class="theme">
      <div class="modal-header">
        <h3>Criar Subserviço</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label>Nome do Subserviço *</label>
          <input v-model="form.nome" placeholder="Digite o nome do subserviço" required />
        </div>
        
        <div class="form-group">
          <label>Serviço *</label>
          <select v-model="form.servicoId" required>
            <option value="">Selecione um serviço</option>
            <option v-for="servico in servicos" :key="servico.id" :value="servico.id">
              {{ servico.nome }}
            </option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Valor por Hora (R$)</label>
            <input v-model="form.valorHora" type="number" step="0.01" placeholder="0.00" />
          </div>
          
          <div class="form-group">
            <label>Quantidade de Horas</label>
            <input v-model="form.qtdHora" type="number" step="0.5" placeholder="0.0" />
          </div>
        </div>
        
        <div class="form-group">
          <label>Descrição</label>
          <textarea v-model="form.descricao" placeholder="Descrição do subserviço" rows="3"></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn-submit">Criar Subserviço</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import subservicoService from "../../services/subservicoService";
import servicoService from "../../services/servicoServices";

const emit = defineEmits(["close", "created"]);

const themeStore = useThemeStore();
const authStore = useAuthStore();
const theme = computed(() => themeStore.theme);

const servicos = ref([]);
const form = ref({
  nome: "",
  servicoId: "",
  valorHora: "",
  qtdHora: "",
  descricao: ""
});

const carregarServicos = async () => {
  try {
    const res = await servicoService.listarTodos(authStore.empresa?.empresaId);
    servicos.value = res.data || [];
  } catch (err) {
    console.error("Erro ao carregar serviços:", err);
    servicos.value = [];
  }
};

const handleSubmit = async () => {
  try {
    const dados = {
      id: authStore.empresa?.empresaId,
      servicoId: form.value.servicoId,
      nome: form.value.nome,
      valorHora: form.value.valorHora ? parseFloat(form.value.valorHora) : null,
      qtdHora: form.value.qtdHora ? parseFloat(form.value.qtdHora) : null,
      descricao: form.value.descricao
    };

    await subservicoService.criar(dados);
    window.alert("Subserviço criado com sucesso!");
    emit("created");
    emit("close");
  } catch (err) {
    console.error("Erro ao criar subserviço:", err);
    console.log(form.servicoId)
    console.log(dados)
    window.alert("Erro ao criar subserviço");
  }
};

onMounted(() => {
  carregarServicos();
});
</script>

<style scoped>
/* Mesmo CSS do CriarServicoModal, com adições para textarea e select */

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

select, textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
}

.modal.light select, .modal.light textarea {
  border-color: #e6e6e6;
  background: #fff;
  color: #333;
}

.modal.light select:focus, .modal.light textarea:focus {
  border-color: #daa520;
  outline: none;
  box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.1);
}

.modal.dark select, .modal.dark textarea {
  border-color: #444;
  background: #2a2a2a;
  color: #daa520;
}

.modal.dark select:focus, .modal.dark textarea:focus {
  border-color: #daa520;
  outline: none;
  box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.2);
}

/* Restante do CSS igual ao CriarServicoModal */
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
  width: 500px;
  max-width: 95vw;
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
  padding: 20px 24px 0;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
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

.modal-form {
  padding: 0 24px 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
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

.modal-form input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.modal.light .modal-form input {
  border-color: #e6e6e6;
  background: #fff;
  color: #333;
}

.modal.light .modal-form input:focus {
  border-color: #daa520;
  outline: none;
  box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.1);
}

.modal.dark .modal-form input {
  border-color: #444;
  background: #2a2a2a;
  color: #daa520;
}

.modal.dark .modal-form input:focus {
  border-color: #daa520;
  outline: none;
  box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn-cancel, .btn-submit {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 100px;
}

.btn-cancel {
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

.btn-submit {
  background: #111;
  color: #fff;
}

.modal.light .btn-submit {
  background: #111;
}

.modal.light .btn-submit:hover {
  background: #333;
}

.modal.dark .btn-submit {
  background: #daa520;
  color: #111;
}

.modal.dark .btn-submit:hover {
  background: #e6b800;
  box-shadow: 0 4px 12px rgba(218, 165, 32, 0.3);
}
</style>