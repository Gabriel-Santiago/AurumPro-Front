<template>
  <BaseModal title="Atualizar Email & Telefone" variant="sheet" @close="$emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-1.5">
        <label for="email-cliente" class="label-field">Email</label>
        <input
          id="email-cliente"
          v-model="form.email"
          type="email"
          class="input-field"
          placeholder="novo@email.com"
          autocomplete="email"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="telefone-cliente" class="label-field">Telefone</label>
        <input
          id="telefone-cliente"
          v-model="form.telefone"
          type="tel"
          class="input-field"
          placeholder="(00) 00000-0000"
          autocomplete="tel"
        />
      </div>

      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
        <button type="submit" class="btn-submit">Atualizar</button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import clienteService from "@/services/clienteService";
import { notify } from "@/services/notificationService";
import { getApiErrorMessage } from "@/utils/errorUtils";

const props = defineProps({
  cliente: { type: Object, required: true },
});

const emit = defineEmits(["close", "updated"]);

const form = ref({ email: "", telefone: "" });

onMounted(() => {
  form.value.email = props.cliente.email || "";
  form.value.telefone = props.cliente.telefone || "";
});

async function handleSubmit() {
  try {
    await clienteService.atualizarContato({
      id: props.cliente.id,
      tipoPessoa: props.cliente.tipoPessoa,
      email: form.value.email,
      telefone: form.value.telefone,
    });
    notify.success("Contato atualizado com sucesso!");
    emit("updated");
    emit("close");
  } catch (err) {
    notify.error(getApiErrorMessage(err));
  }
}
</script>
