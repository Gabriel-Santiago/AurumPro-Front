<template>
  <div class="modal-backdrop" @click.self="$emit('close')" :class="theme">
    <div class="modal" :class="theme">
      <div class="modal-header">
        <h3>Excluir Cliente</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="warning">
          <strong>Atenção!</strong> Esta ação não pode ser desfeita. O cliente será permanentemente excluído.
        </div>
        
        <div class="form-group">
          <label>Confirme sua senha para excluir</label>
          <input v-model="form.senha" type="password" placeholder="Digite sua senha" required />
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn-delete">Excluir</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import clientService from "../../services/clientServices";

const props = defineProps({
  cliente: { type: Object, required: true }
});

const emit = defineEmits(["close", "deleted"]);

const themeStore = useThemeStore();
const authStore = useAuthStore();
const theme = computed(() => themeStore.theme);

const form = ref({
  senha: ""
});

const handleSubmit = async () => {
  try {
    const dados = {
      empresaId: authStore.empresa?.empresaId,
      id: props.cliente.id,
      senha: form.value.senha,
      tipoPessoa: props.cliente.tipoPessoa
    };

    await clientService.deletarCliente(dados);
    window.alert("Cliente excluído com sucesso!");
    emit("deleted");
    emit("close");
  } catch (err) {
    console.error("Erro ao excluir cliente:", err);
    window.alert("Erro ao excluir cliente");
  }
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
  width: 400px;
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

.warning {
  background: #fed7d7;
  color: #742a2a;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.modal.dark .warning {
  background: #742a2a;
  color: #fed7d7;
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

.btn-cancel, .btn-delete {
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

.btn-delete {
  background: #e53e3e;
  color: #fff;
}

.btn-delete:hover {
  background: #c53030;
}
</style>