<template>
  <div class="flex min-h-screen w-full flex-col bg-gradient-to-b from-surface-dark from-0% via-[#2a2a2a] via-[50%] to-surface-light-muted to-100% md:flex-row md:bg-gradient-to-r md:from-surface-dark md:from-0% md:to-surface-light-muted md:to-100%">
    <div class="flex w-full flex-col items-center justify-center px-5 py-10 text-center text-white md:h-auto md:w-1/2 md:py-16">
      <img
        src="../assets/images/AurumPro - logo.png"
        class="mx-auto h-auto w-[220px] drop-shadow-[0_0_10px_rgba(218,165,32,0.3)] md:w-[280px]"
        alt="AurumPro"
      />
      <p class="mt-6 text-2xl font-light text-aurum drop-shadow-[0_0_10px_rgba(218,165,32,0.5)] md:mt-[25px] md:text-[1.8rem]">
        Porque sua proposta vale ouro
      </p>
    </div>

    <div class="flex w-full flex-col items-center justify-center px-5 py-8 md:w-1/2 md:py-16">
      <div class="mb-10 flex w-full max-w-[400px] cursor-pointer justify-center gap-5 text-xl font-medium md:mb-10 md:gap-[30px] md:text-[1.4rem]">
        <span
          class="relative px-0 py-3 transition-all duration-300"
          :class="tab === 'login' ? 'font-semibold text-aurum after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-sm after:bg-aurum' : 'text-text-muted hover:text-text-body'"
          @click="tab = 'login'"
        >
          Login
        </span>
        <span
          class="relative px-0 py-3 transition-all duration-300"
          :class="tab === 'register' ? 'font-semibold text-aurum after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-sm after:bg-aurum' : 'text-text-muted hover:text-text-body'"
          @click="tab = 'register'"
        >
          Cadastro
        </span>
      </div>

      <div class="w-full max-w-[400px]">
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
