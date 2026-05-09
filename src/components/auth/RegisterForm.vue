<template>
  <form @submit.prevent="submitRegister" class="auth-form">
    <div class="form-group">
      <label class="form-label">CNPJ</label>
      <input v-model="cnpj" @input="formatCNPJ" class="form-input" placeholder="00.000.000/0000-00" maxlength="18" required/>
    </div>

    <div class="form-group">
      <label class="form-label">Senha</label>
      <input v-model="senha" type="password" required class="form-input" placeholder="Sua senha" />
    </div>

    <div class="form-group">
      <label class="form-label">Responsável</label>
      <input v-model="responsavel" required class="form-input" placeholder="Nome do responsável" />
    </div>

    <div class="form-group">
      <label class="form-label">Email</label>
      <input v-model="email" required class="form-input" placeholder="Seu email" />
    </div>

    <div class="button-container">
      <button type="submit" class="submit-btn">Cadastrar</button>
    </div>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../../store/authStore";
import { notify } from '../../services/notificationService';
import { getApiErrorMessage } from '../../utils/errorUtils'

const cnpj = ref("");
const senha = ref("");
const responsavel = ref("");
const email = ref("");

const auth = useAuthStore();

const cleanNumber = (value) => {
  return value.replace(/\D/g, '');
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

  cnpj.value = value;
};


async function submitRegister() {
  try {
    const cnpjNumeros = cleanNumber(cnpj.value);

    if (cnpjNumeros.length !== 14) {
      notify.error('CNPJ inválido. Digite os 14 números do CNPJ.');
      return;
    }

    await auth.register({
      cnpj: cnpjNumeros,
      senha: senha.value,
      responsavel: responsavel.value,
      email: email.value
    });

    notify.success('Usuário cadastrado com sucesso!');
  } catch (error) {
    notify.error(getApiErrorMessage(error));
  }
}

</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.form-input {
  padding: 14px 16px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fff;
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: #daa520;
  box-shadow: 0 0 0 3px rgba(218, 165, 32, 0.1);
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.submit-btn {
  padding: 16px 48px;
  background: linear-gradient(135deg, #daa520 0%, #b8860b 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #e6b028 0%, #c9960c 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(218, 165, 32, 0.3);
}
</style>