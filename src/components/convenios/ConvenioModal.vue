<template>
  <BaseModal
    title="Gerenciar Convênios"
    variant="fullscreen"
    size="lg"
    modal-class="modal"
    @close="closeModal"
  >
    <div class="modal-content">
      <div class="add-section">
        <h4>Adicionar Novo Convênio</h4>
        <form class="add-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Nome do Convênio *</label>
            <input
              ref="nomeInput"
              v-model="form.nome"
              placeholder="Digite o nome do convênio"
              required
              :disabled="loading"
            />
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading">Criando...</span>
            <span v-else>Criar Convênio</span>
          </button>
        </form>
      </div>

      <div class="list-section">
        <div class="list-header">
          <h4>Convênios Cadastrados</h4>
          <button
            class="btn-refresh"
            type="button"
            :disabled="loadingList"
            title="Atualizar lista"
            @click="carregarConvenios"
          >
            <span v-if="loadingList">⟳</span>
            <span v-else>↻</span>
          </button>
        </div>

        <div v-if="!loadingList && convenios.length > 0" class="convenios-list">
          <div v-for="convenio in convenios" :key="convenio.id" class="convenio-item">
            <div class="convenio-nome">{{ convenio.nome }}</div>
          </div>
        </div>

        <div v-else-if="!loadingList && convenios.length === 0" class="empty-state">
          Nenhum convênio cadastrado ainda.
        </div>

        <div v-else class="loading-state">Carregando convênios...</div>

        <div class="list-info">
          <small>Total: {{ convenios.length }} convênio(s)</small>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-actions">
        <button type="button" class="btn-cancel" @click="closeModal">Fechar</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import convenioService from "../../services/convenioService";
import { notify } from "../../services/notificationService";
import { getApiErrorMessage } from "../../utils/errorUtils";

const emit = defineEmits(["close", "created"]);

const convenios = ref([]);
const form = ref({ nome: "" });
const loading = ref(false);
const loadingList = ref(false);
const nomeInput = ref(null);

onMounted(carregarConvenios);

async function carregarConvenios() {
  try {
    loadingList.value = true;
    const response = await convenioService.listarPorEmpresa();
    convenios.value = response.data || [];
  } catch {
    notify.error("Erro ao carregar convênios");
  } finally {
    loadingList.value = false;
  }
}

async function handleSubmit() {
  if (!form.value.nome.trim()) {
    notify.error("Por favor, informe um nome para o convênio");
    return;
  }

  try {
    loading.value = true;
    await convenioService.criar({ nome: form.value.nome.trim() });
    notify.success("Convênio criado com sucesso!");
    form.value.nome = "";
    await nextTick();
    nomeInput.value?.focus();
    await carregarConvenios();
    emit("created");
  } catch (err) {
    notify.error(getApiErrorMessage(err));
  } finally {
    loading.value = false;
  }
}

function closeModal() {
  emit("close");
}
</script>
