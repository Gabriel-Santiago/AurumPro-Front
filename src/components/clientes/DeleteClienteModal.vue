<template>
  <BaseModal title="Excluir Cliente" variant="sheet" @close="$emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <div class="rounded-lg bg-danger/10 p-3 text-sm leading-relaxed text-danger-dark">
        <strong>Atenção!</strong> Esta ação não pode ser desfeita. O cliente será permanentemente excluído.
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="senha-excluir" class="label-field">Confirme sua senha para excluir</label>
        <input
          id="senha-excluir"
          v-model="form.senha"
          type="password"
          class="input-field"
          placeholder="Digite sua senha"
          required
          autocomplete="current-password"
        />
      </div>

      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
        <button type="submit" class="btn-danger">Excluir</button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import clienteService from "@/services/clienteService";
import { notify } from "@/services/notificationService";
import { getApiErrorMessage } from "@/utils/errorUtils";

const props = defineProps({
  cliente: { type: Object, required: true },
});

const emit = defineEmits(["close", "deleted"]);

const form = ref({ senha: "" });

async function handleSubmit() {
  try {
    await clienteService.deletarCliente({
      id: props.cliente.id,
      senha: form.value.senha,
      tipoPessoa: props.cliente.tipoPessoa,
    });
    notify.success("Cliente excluído com sucesso!");
    emit("deleted");
    emit("close");
  } catch (err) {
    notify.error(getApiErrorMessage(err));
  }
}
</script>
