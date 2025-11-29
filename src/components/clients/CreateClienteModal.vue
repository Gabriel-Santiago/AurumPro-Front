<template>
  <div class="modal-backdrop" @click.self="$emit('close')" :class="theme">
    <div class="modal" :class="theme">
      <div class="modal-header">
        <h3>Criar Novo Cliente</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="tabs">
        <span :class="{ active: tab === 'pf' }" @click="tab='pf'">Pessoa Física</span>
        <span :class="{ active: tab === 'pj' }" @click="tab='pj'">Pessoa Jurídica</span>
      </div>

      <div class="form-area">
        <!-- FORMULÁRIO PESSOA FÍSICA -->
        <form v-if="tab === 'pf'" @submit.prevent="submitPF" class="client-form">
          <div class="form-grid-pf">
            <!-- Linha 1: Nome -->
            <div class="form-group full-width">
              <label>Nome Completo *</label>
              <input v-model="pf.nome" placeholder="Digite o nome completo" required />
            </div>

            <!-- Linha 2: Email -->
            <div class="form-group full-width">
              <label>Email *</label>
              <input v-model="pf.email" type="email" placeholder="email@exemplo.com" required />
            </div>

            <!-- Linha 3: CPF e Data Nascimento -->
            <div class="form-row">
              <div class="form-group">
                <label>CPF *</label>
                <input v-model="pf.cpf" placeholder="000.000.000-00" required />
              </div>

              <div class="form-group">
                <label>Data de Nascimento *</label>
                <input v-model="pf.dataNascimento" type="date" required />
              </div>
            </div>

            <!-- Linha 4: Telefone, CEP e Número -->
            <div class="form-row">
              <div class="form-group">
                <label>Telefone *</label>
                <input v-model="pf.telefone" placeholder="(00) 00000-0000" required />
              </div>

              <div class="form-group">
                <label>CEP *</label>
                <input v-model="pf.cep" placeholder="00000-000" required />
              </div>

              <div class="form-group small">
                <label>Número *</label>
                <input v-model="pf.numero" placeholder="Nº" required/>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
            <button type="submit" class="btn-submit">Criar Pessoa Física</button>
          </div>
        </form>

        <!-- FORMULÁRIO PESSOA JURÍDICA -->
        <form v-else @submit.prevent="submitPJ" class="client-form">
          <div class="form-grid-pj">
            <!-- Linha 1: Razão Social -->
            <div class="form-group full-width">
              <label>Razão Social *</label>
              <input v-model="pj.nome" placeholder="Digite a razão social" required />
            </div>

            <!-- Linha 2: Email -->
            <div class="form-group full-width">
              <label>Email *</label>
              <input v-model="pj.email" type="email" placeholder="empresa@exemplo.com" required />
            </div>

            <!-- Linha 3: CNPJ e Número -->
            <div class="form-row">
              <div class="form-group">
                <label>CNPJ *</label>
                <input v-model="pj.cnpj" placeholder="00.000.000/0000-00" required />
              </div>

              <div class="form-group small">
                <label>Número *</label>
                <input v-model="pj.numero" placeholder="Nº" required/>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
            <button type="submit" class="btn-submit">Criar Pessoa Jurídica</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import clientService from "../../services/clientServices";

const themeStore = useThemeStore();
const authStore = useAuthStore();
const theme = computed(() => themeStore.theme);

const tab = ref("pf");

// Obter empresaId da store de autenticação
const empresaId = authStore.empresa?.empresaId;

const pf = ref({
  nome: "",
  email: "",
  telefone: "",
  cep: "",
  numero: "",
  dataNascimento: "",
  cpf: ""
});

const pj = ref({
  nome: "",
  email: "",
  numero: "",
  cnpj: ""
});

const submitPF = async () => {
  try {
    // Preparar dados para enviar - incluir empresaId como 'id'
    const dadosPF = {
      id: empresaId, // empresaId será enviado como 'id' no DTO
      nome: pf.value.nome,
      email: pf.value.email,
      telefone: pf.value.telefone,
      cep: pf.value.cep,
      numero: pf.value.numero,
      dataNascimento: pf.value.dataNascimento,
      cpf: pf.value.cpf
    };

    await clientService.criarPessoaFisica(dadosPF);
    window.alert("Pessoa Física criada com sucesso");
    
    // Limpar formulário
    Object.keys(pf.value).forEach(key => {
      pf.value[key] = "";
    });
    
    emit("created");
  } catch (err) {
    console.error("Erro ao criar Pessoa Física:", err);
    window.alert("Erro ao criar Pessoa Física");
  }
};

const submitPJ = async () => {
  try {
    // Preparar dados para enviar - incluir empresaId como 'id'
    const dadosPJ = {
      id: empresaId, // empresaId será enviado como 'id' no DTO
      nome: pj.value.nome,
      email: pj.value.email,
      numero: pj.value.numero,
      cnpj: pj.value.cnpj
    };

    await clientService.criarPessoaJuridica(dadosPJ);
    window.alert("Pessoa Jurídica criada com sucesso");
    
    // Limpar formulário
    Object.keys(pj.value).forEach(key => {
      pj.value[key] = "";
    });
    
    emit("created");
  } catch (err) {
    console.error("Erro ao criar Pessoa Jurídica:", err);
    window.alert("Erro ao criar Pessoa Jurídica");
  }
};

const emit = defineEmits(["close", "created"]);
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

/* Modo Claro */
.modal-backdrop.light {
  background: rgba(0, 0, 0, 0.35);
}

/* Modo Escuro */
.modal-backdrop.dark {
  background: rgba(0, 0, 0, 0.6);
}

.modal {
  width: 520px;
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

/* Modo Claro */
.modal.light {
  background: #fff;
}

/* Modo Escuro */
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

.tabs {
  display: flex;
  gap: 0;
  margin: 0 24px 20px;
  border-bottom: 1px solid;
  transition: border-color 0.3s ease;
}

.modal.light .tabs {
  border-color: #e6e6e6;
}

.modal.dark .tabs {
  border-color: #333;
}

.tabs span {
  cursor: pointer;
  padding: 12px 20px;
  position: relative;
  font-weight: 500;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.modal.light .tabs span {
  color: #666;
}

.modal.dark .tabs span {
  color: #888;
}

.tabs .active {
  font-weight: 600;
}

.modal.light .tabs .active {
  color: #111;
  border-bottom-color: #111;
}

.modal.dark .tabs .active {
  color: #daa520;
  border-bottom-color: #daa520;
}

.form-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
}

.client-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Layout para ambos os formulários */
.form-grid-pf,
.form-grid-pj {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  gap: 12px;
}

/* PF: Linha 3 - CPF e Data Nascimento (2 colunas) */
.form-grid-pf .form-row:nth-of-type(1) {
  grid-template-columns: 1fr 1fr;
}

/* PF: Linha 4 - Telefone, CEP e Número (3 colunas) */
.form-grid-pf .form-row:nth-of-type(2) {
  grid-template-columns: 1fr 1fr 0.8fr;
}

/* PJ: Linha 3 - CNPJ e Número (2 colunas) */
.form-grid-pj .form-row {
  grid-template-columns: 1fr 0.8fr;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  width: 100%;
}

label {
  font-size: 0.85rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.modal.light label {
  color: #333;
}

.modal.dark label {
  color: #daa520;
}

input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  width: 100%;
  min-height: 42px;
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

.modal.dark input::placeholder {
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px solid;
  transition: border-color 0.3s ease;
}

.modal.light .form-actions {
  border-color: #f0f0f0;
}

.modal.dark .form-actions {
  border-color: #333;
}

.btn-cancel, .btn-submit {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 120px;
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

/* Responsivo */
@media (max-width: 640px) {
  .modal {
    width: 95vw;
    max-height: 90vh;
  }
  
  .form-row {
    grid-template-columns: 1fr !important;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-cancel, .btn-submit {
    min-width: auto;
    width: 100%;
  }
}
</style>