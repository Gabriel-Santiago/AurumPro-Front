<template>
  <form @submit.prevent="submitLogin" class="auth-form">
    <div class="form-group">
      <label class="form-label">Email</label>
      <input v-model="email" type="email" required class="form-input" placeholder="seu@email.com" />
    </div>

    <div class="form-group">
      <label class="form-label">Senha</label>
      <input v-model="senha" type="password" required class="form-input" placeholder="Sua senha" />
    </div>

    <div class="button-container">
      <button type="submit" class="submit-btn">Entrar</button>
    </div>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../../store/authStore";

const email = ref("");
const senha = ref("");

const auth = useAuthStore();

async function submitLogin() {
  await auth.login(email.value, senha.value);
  alert("Login realizado!");
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