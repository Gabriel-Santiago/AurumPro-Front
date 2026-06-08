<template>
  <form class="flex w-full flex-col gap-6" @submit.prevent="submitLogin">
    <div class="flex flex-col gap-2">
      <label class="text-[0.95rem] font-medium text-text-body">Email</label>
      <input
        v-model="email"
        type="email"
        required
        class="input-field px-4 py-3.5"
        placeholder="seu@email.com"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-[0.95rem] font-medium text-text-body">Senha</label>
      <input
        v-model="senha"
        type="password"
        required
        class="input-field px-4 py-3.5"
        placeholder="Sua senha"
      />
    </div>

    <div class="mt-2.5 flex justify-center">
      <button
        type="submit"
        class="w-full max-w-[280px] cursor-pointer rounded-lg border-0 bg-gradient-to-br from-aurum to-aurum-dark px-12 py-4 text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:from-aurum-light hover:to-[#c9960c] hover:shadow-[0_4px_12px_rgba(218,165,32,0.3)]"
      >
        Entrar
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import router from "../../router";
import { notify } from "../../services/notificationService";
import { getApiErrorMessage } from "../../utils/errorUtils";

const email = ref("");
const senha = ref("");
const auth = useAuthStore();

async function submitLogin() {
  try {
    await auth.login(email.value, senha.value);
    notify.success("Login realizado com sucesso!");
    router.push("/clientes");
  } catch (error) {
    senha.value = "";
    notify.error(getApiErrorMessage(error));
  }
}
</script>
