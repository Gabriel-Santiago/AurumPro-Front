<template>
  <BaseModal title="Atualizar Endereço" variant="sheet" @close="$emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-1.5">
        <label for="cep-cliente" class="label-field">CEP</label>
        <input
          id="cep-cliente"
          v-model="form.cep"
          class="input-field"
          placeholder="00000-000"
          autocomplete="postal-code"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="numero-cliente" class="label-field">Número</label>
        <input id="numero-cliente" v-model="form.numero" class="input-field" placeholder="Nº" />
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

const form = ref({ cep: "", numero: "" });

onMounted(() => {
  form.value.cep = props.cliente.cep || "";
  form.value.numero = props.cliente.numero || "";
});

async function handleSubmit() {
  try {
    await clienteService.atualizarEndereco({
      id: props.cliente.id,
      cep: form.value.cep,
      numero: form.value.numero,
      tipoPessoa: props.cliente.tipoPessoa,
    });
    notify.success("Endereço atualizado com sucesso!");
    emit("updated");
    emit("close");
  } catch (err) {
    notify.error(getApiErrorMessage(err));
  }
}
</script>
