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
        <form v-if="tab === 'pf'" @submit.prevent="submitPF" class="client-form">
          <div class="form-grid-pf">
            <div class="form-group full-width">
              <label>Nome Completo *</label>
              <input v-model="pf.nome" placeholder="Digite o nome completo" required />
            </div>

            <div class="form-group full-width">
              <label>Email *</label>
              <input v-model="pf.email" type="email" placeholder="email@exemplo.com" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>CPF *</label>
                <input 
                  v-model="pf.cpf" 
                  @input="formatCPF"
                  placeholder="000.000.000-00" 
                  maxlength="14"
                  required 
                />
              </div>

              <div class="form-group">
                <label>Data de Nascimento *</label>
                <input 
                  v-model="pf.dataNascimento" 
                  type="date" 
                  :max="maxDate" 
                  :min="minDate"
                  required 
                />
                <small class="date-hint">Data permitida: a partir 18 anos atrás</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Telefone *</label>
                <input 
                  v-model="pf.telefone" 
                  @input="formatTelefone"
                  placeholder="(00) 00000-0000" 
                  maxlength="15"
                  required 
                />
              </div>

              <div class="form-group">
                <label>CEP *</label>
                <input 
                  v-model="pf.cep" 
                  @input="formatCEP"
                  placeholder="00000-000" 
                  maxlength="9"
                  required 
                />
              </div>

              <div class="form-group small">
                <label>Número *</label>
                <input 
                  v-model="pf.numero" 
                  @input="filterNumbers"
                  placeholder="Nº" 
                  required
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                />
                <small class="number-hint">Apenas números</small>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
            <button type="submit" class="btn-submit">Criar Pessoa Física</button>
          </div>
        </form>

        <form v-else @submit.prevent="submitPJ" class="client-form">
          <div class="form-grid-pj">
            <div class="form-group full-width">
              <label>Responsável *</label>
              <input v-model="pj.responsavel" placeholder="Digite o responsável" required />
            </div>

            <div class="form-group full-width">
              <label>Email *</label>
              <input v-model="pj.email" type="email" placeholder="empresa@exemplo.com" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>CNPJ *</label>
                <input 
                  v-model="pj.cnpj" 
                  @input="formatCNPJ"
                  placeholder="00.000.000/0000-00" 
                  maxlength="18"
                  required 
                />
              </div>

              <div class="form-group small">
                <label>Número *</label>
                <input 
                  v-model="pj.numero" 
                  @input="filterNumbers"
                  placeholder="Nº" 
                  required
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                />
                <small class="number-hint">Apenas números</small>
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
import { notify } from '../../services/notificationService';

const themeStore = useThemeStore();
const authStore = useAuthStore();
const theme = computed(() => themeStore.theme);

const tab = ref("pf");

const empresaId = authStore.empresa?.empresaId;

const today = new Date();
const tenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

const formatDateForInput = (date) => {
  return date.toISOString().split('T')[0];
};

const maxDate = computed(() => formatDateForInput(tenYearsAgo));
const minDate = computed(() => {
  const hundredTwentyYearsAgo = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  return formatDateForInput(hundredTwentyYearsAgo);
});

const cleanNumber = (value) => {
  return value.replace(/\D/g, '');
};

const filterNumbers = (event) => {
  const value = event.target.value;
  const numbersOnly = value.replace(/\D/g, '');
  
  if (tab.value === 'pf') {
    pf.value.numero = numbersOnly;
  } else {
    pj.value.numero = numbersOnly;
  }
};

const formatCPF = (event) => {
  let value = cleanNumber(event.target.value);
  
  value = value.substring(0, 11);
  
  if (value.length <= 3) {
    value = value;
  } else if (value.length <= 6) {
    value = `${value.substring(0, 3)}.${value.substring(3)}`;
  } else if (value.length <= 9) {
    value = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6)}`;
  } else {
    value = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6, 9)}-${value.substring(9)}`;
  }
  
  pf.value.cpf = value;
};

const formatCNPJ = (event) => {
  let value = cleanNumber(event.target.value);
  
  value = value.substring(0, 14);
  
  if (value.length <= 2) {
    value = value;
  } else if (value.length <= 5) {
    value = `${value.substring(0, 2)}.${value.substring(2)}`;
  } else if (value.length <= 8) {
    value = `${value.substring(0, 2)}.${value.substring(2, 5)}.${value.substring(5)}`;
  } else if (value.length <= 12) {
    value = `${value.substring(0, 2)}.${value.substring(2, 5)}.${value.substring(5, 8)}/${value.substring(8)}`;
  } else {
    value = `${value.substring(0, 2)}.${value.substring(2, 5)}.${value.substring(5, 8)}/${value.substring(8, 12)}-${value.substring(12)}`;
  }
  
  pj.value.cnpj = value;
};

const formatTelefone = (event) => {
  let value = cleanNumber(event.target.value);
  
  value = value.substring(0, 11);
  
  if (value.length <= 2) {
    value = value;
  } else if (value.length <= 7) {
    value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
  } else {
    value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
  }
  
  pf.value.telefone = value;
};

const formatCEP = (event) => {
  let value = cleanNumber(event.target.value);
  
  value = value.substring(0, 8);
  
  if (value.length <= 5) {
    value = value;
  } else {
    value = `${value.substring(0, 5)}-${value.substring(5)}`;
  }
  
  pf.value.cep = value;
};

const extractNumbers = (value) => {
  return cleanNumber(value);
};

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
  responsavel: "",
  email: "",
  numero: "",
  cnpj: ""
});

const submitPF = async () => {
  try {
    if (pf.value.dataNascimento) {
      const birthDate = new Date(pf.value.dataNascimento);
      const today = new Date();
      const minValidDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
      
      if (birthDate > minValidDate) {
        notify.error('Data de nascimento inválida. O cliente deve ter pelo menos 10 anos de idade.');
        return;
      }
      
      const maxValidDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
      if (birthDate < maxValidDate) {
        notify.error('Data de nascimento inválida. A data não pode ser anterior a 120 anos atrás.');
        return;
      }
    }

    const cpfNumeros = extractNumbers(pf.value.cpf);
    if (cpfNumeros.length !== 11) {
      notify.error('CPF inválido. Digite os 11 números do CPF.');
      return;
    }

    if (!pf.value.numero || pf.value.numero.trim() === '') {
      notify.error('Por favor, informe o número.');
      return;
    }

    const dadosPF = {
      id: empresaId, 
      nome: pf.value.nome,
      email: pf.value.email,
      telefone: extractNumbers(pf.value.telefone), 
      cep: extractNumbers(pf.value.cep), 
      numero: pf.value.numero,
      dataNascimento: pf.value.dataNascimento,
      cpf: cpfNumeros
    };

    await clientService.criarPessoaFisica(dadosPF);
    notify.success('Pessoa Física criada com sucesso');
    
    Object.keys(pf.value).forEach(key => {
      pf.value[key] = "";
    });
    
    emit("created");
  } catch (err) {
    notify.error('Erro ao criar Pessoa Física: ', err);
  }
};

const submitPJ = async () => {
  try {
    const cnpjNumeros = extractNumbers(pj.value.cnpj);
    if (cnpjNumeros.length !== 14) {
      notify.error('CNPJ inválido. Digite os 14 números do CNPJ.');
      return;
    }

    if (!pj.value.numero || pj.value.numero.trim() === '') {
      notify.error('Por favor, informe o número.');
      return;
    }

    const dadosPJ = {
      id: empresaId,
      responsavel: pj.value.responsavel,
      email: pj.value.email,
      numero: pj.value.numero,
      cnpj: cnpjNumeros
    };

    await clientService.criarPessoaJuridica(dadosPJ);
    notify.success('Pessoa Jurídica criada com sucesso');
    
    Object.keys(pj.value).forEach(key => {
      pj.value[key] = "";
    });
    
    emit("created");
  } catch (err) {
    notify.error('Erro ao criar Pessoa Jurídica: ', err);
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

.modal-backdrop.light {
  background: rgba(0, 0, 0, 0.35);
}

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

.form-grid-pf .form-row:nth-of-type(1) {
  grid-template-columns: 1fr 1fr;
}

.form-grid-pf .form-row:nth-of-type(2) {
  grid-template-columns: 1fr 1fr 0.8fr;
}

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

.date-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 4px;
  font-style: italic;
}

.modal.dark .date-hint {
  color: #9ca3af;
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

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.modal.dark input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
}

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
  
  .date-hint {
    font-size: 0.7rem;
  }
}
</style>