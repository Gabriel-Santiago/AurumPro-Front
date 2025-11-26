<template>
  <div class="auth-container">

    <!-- LADO ESQUERDO -->
    <div class="auth-left">
      <img src="../assets/images/AurumPro - logo.png" class="logo" />
      <p class="slogan">Porque sua proposta vale ouro</p>
    </div>

    <!-- LADO DIREITO -->
    <div class="auth-right">
      <div class="tabs">
        <span 
          :class="{ active: tab === 'login' }"
          @click="tab = 'login'"
        >Login</span>

        <span 
          :class="{ active: tab === 'register' }"
          @click="tab = 'register'"
        >Cadastro</span>
      </div>

      <div class="form-area">
        <LoginForm v-if="tab === 'login'" />
        <RegisterForm v-else />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";
import LoginForm from "../components/auth/LoginForm.vue";
import RegisterForm from "../components/auth/RegisterForm.vue";

const tab = ref("login");
</script>

<style scoped>
.auth-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background: linear-gradient(
    90deg,
    #111 0%,
    #f8f9fa 100%
  );
}

/* ESQUERDA - Área Escura */
.auth-left {
  width: 50%;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.logo {
  width: 280px;
  height: auto;
  margin: 0 auto;
  filter: drop-shadow(0 0 10px rgba(218, 165, 32, 0.3));
}

.slogan {
  margin-top: 25px;
  font-size: 1.8rem;
  color: gold;
  font-weight: 300;
  text-shadow: 0 0 10px rgba(218, 165, 32, 0.5);
}

/* DIREITA - Área Clara */
.auth-right {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  font-size: 1.4rem;
  cursor: pointer;
  justify-content: center;
  width: 100%;
  max-width: 400px;
}

.tabs span {
  padding: 12px 0;
  color: #666;
  transition: all 0.3s ease;
  position: relative;
  font-weight: 500;
}

.tabs .active {
  color: #daa520;
  font-weight: 600;
}

.tabs .active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: #daa520;
  border-radius: 2px;
}

.tabs span:hover {
  color: #333;
}

.form-area {
  max-width: 400px;
  width: 100%;
}

/* Responsivo */
@media (max-width: 900px) {
  .auth-container {
    flex-direction: column;
    background: linear-gradient(
      180deg,
      #111 0%,
      #1a1a1a 40%,
      #2a2a2a 50%,
      #e8e8e8 60%,
      #f8f9fa 100%
    );
  }
  
  .auth-left, .auth-right {
    width: 100%;
    height: auto;
    padding: 40px 20px;
  }
  
  .auth-left {
    padding-top: 60px;
    padding-bottom: 40px;
  }
  
  .logo {
    width: 220px;
  }
  
  .slogan {
    font-size: 1.5rem;
  }
  
  .tabs {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .auth-right {
    padding: 30px 20px;
  }
  
  .form-area {
    max-width: 100%;
  }
  
  .tabs {
    gap: 20px;
  }
}
</style>