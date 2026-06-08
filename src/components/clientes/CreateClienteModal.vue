<template>
  <BaseModal title="Criar Novo Cliente" variant="fullscreen" @close="$emit('close')">
    <div class="modal-inner" :class="theme">
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
  </BaseModal>
</template>

<script setup>
import { ref, computed } from "vue";
import { useThemeStore } from "@/stores/themeStore";
import BaseModal from "@/components/common/BaseModal.vue";
import clienteService from "@/services/clienteService";
import { notify } from '../../services/notificationService';
import { getApiErrorMessage } from "../../utils/errorUtils";

const themeStore = useThemeStore();
const theme = computed(() => themeStore.theme);

const tab = ref("pf");

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
        notify.error('Data de nascimento inválida. O cliente deve ter pelo menos 18 anos de idade.');
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
      nome: pf.value.nome,
      email: pf.value.email,
      telefone: extractNumbers(pf.value.telefone), 
      cep: extractNumbers(pf.value.cep), 
      numero: pf.value.numero,
      dataNascimento: pf.value.dataNascimento,
      cpf: cpfNumeros
    };

    await clienteService.criarPessoaFisica(dadosPF);
    notify.success('Pessoa Física criada com sucesso');
    
    Object.keys(pf.value).forEach(key => {
      pf.value[key] = "";
    });
    
    emit("created");
  } catch (err) {
    notify.error(getApiErrorMessage(err));
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
      responsavel: pj.value.responsavel,
      email: pj.value.email,
      numero: pj.value.numero,
      cnpj: cnpjNumeros
    };

    await clienteService.criarPessoaJuridica(dadosPJ);
    notify.success('Pessoa Jurídica criada com sucesso');
    
    Object.keys(pj.value).forEach(key => {
      pj.value[key] = "";
    });
    
    emit("created");
  } catch (err) {
    notify.error(getApiErrorMessage(err));
  }
};

const emit = defineEmits(["close", "created"]);
</script>

