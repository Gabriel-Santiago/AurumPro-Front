<template>
  <form class="flex w-full flex-col gap-6" @submit.prevent="submitRegister">
    <div class="flex flex-col gap-2">
      <label class="text-[0.95rem] font-medium text-text-body">CNPJ</label>
      <input
        v-model="cnpj"
        class="input-field px-4 py-3.5"
        placeholder="00.000.000/0000-00"
        maxlength="18"
        required
        @input="formatCNPJ"
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

    <div class="flex flex-col gap-2">
      <label class="text-[0.95rem] font-medium text-text-body">Responsável</label>
      <input
        v-model="responsavel"
        required
        class="input-field px-4 py-3.5"
        placeholder="Nome do responsável"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-[0.95rem] font-medium text-text-body">Email</label>
      <input
        v-model="email"
        required
        class="input-field px-4 py-3.5"
        placeholder="Seu email"
      />
    </div>

    <div class="mt-2.5 flex justify-center">
      <button
        type="submit"
        class="w-full max-w-[280px] cursor-pointer rounded-lg border-0 bg-gradient-to-br from-aurum to-aurum-dark px-12 py-4 text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:from-aurum-light hover:to-[#c9960c] hover:shadow-[0_4px_12px_rgba(218,165,32,0.3)]"
      >
        Cadastrar
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { notify } from "../../services/notificationService";
import { getApiErrorMessage } from "../../utils/errorUtils";

const cnpj = ref("");
const senha = ref("");
const responsavel = ref("");
const email = ref("");
const auth = useAuthStore();

function cleanNumber(value) {
  return value.replace(/\D/g, "");
}

function formatCNPJ(event) {
  let value = cleanNumber(event.target.value);
  value = value.substring(0, 14);

  if (value.length <= 2) {
    // keep as is
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
}

async function submitRegister() {
  try {
    const cnpjNumeros = cleanNumber(cnpj.value);

    if (cnpjNumeros.length !== 14) {
      notify.error("CNPJ inválido. Digite os 14 números do CNPJ.");
      return;
    }

    await auth.register({
      cnpj: cnpjNumeros,
      senha: senha.value,
      responsavel: responsavel.value,
      email: email.value,
    });

    notify.success("Usuário cadastrado com sucesso!");
  } catch (error) {
    notify.error(getApiErrorMessage(error));
  }
}
</script>
