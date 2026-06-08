<template>
  <BaseModal
    title="Gerenciar Serviços"
    variant="fullscreen"
    size="lg"
    modal-class="modal"
    @close="closeModal"
  >
    <div class="modal-content">
      <div class="add-section">
        <h4>Adicionar Novo Serviço</h4>
        <form class="add-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Nome do Serviço *</label>
            <input
              ref="nomeInput"
              v-model="form.nome"
              placeholder="Digite o nome do serviço"
              required
              :disabled="loading"
            />
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading">Criando...</span>
            <span v-else>Criar Serviço</span>
          </button>

          <div v-if="successMessage" class="success-message">
            ✓ {{ successMessage }}
          </div>
        </form>
      </div>

      <div class="list-section">
        <div class="list-header">
          <h4>Serviços Cadastrados</h4>
          <button
            class="btn-refresh"
            type="button"
            :disabled="loadingList"
            title="Atualizar lista"
            @click="carregarServicos"
          >
            <span v-if="loadingList">⟳</span>
            <span v-else>↻</span>
          </button>
        </div>

        <div v-if="!loadingList && servicos.length > 0" class="servicos-list">
          <div v-for="servico in servicos" :key="servico.id" class="servico-item">
            {{ servico.nome }}
          </div>
        </div>

        <div v-else-if="!loadingList && servicos.length === 0" class="empty-state">
          Nenhum serviço cadastrado ainda.
        </div>

        <div v-else class="loading-state">Carregando serviços...</div>

        <div class="list-info">
          <small>Total: {{ servicos.length }} serviço(s)</small>
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
import servicoService from "../../services/servicoService";
import { notify } from "../../services/notificationService";

const emit = defineEmits(["close", "created"]);

const form = ref({ nome: "" });
const servicos = ref([]);
const loading = ref(false);
const loadingList = ref(false);
const nomeInput = ref(null);
const successMessage = ref("");

onMounted(() => {
  carregarServicos();
});

async function carregarServicos() {
  try {
    loadingList.value = true;
    const response = await servicoService.listarTodos();
    servicos.value = response.data || [];
  } catch {
    notify.error("Erro ao carregar serviços");
  } finally {
    loadingList.value = false;
  }
}

async function handleSubmit() {
  if (!form.value.nome.trim()) {
    successMessage.value = "Por favor, informe um nome para o serviço";
    setTimeout(() => (successMessage.value = ""), 3000);
    return;
  }

  try {
    loading.value = true;
    successMessage.value = "";

    await servicoService.criarServico({ nome: form.value.nome.trim() });

    form.value.nome = "";

    await nextTick();
    nomeInput.value?.focus();

    await carregarServicos();
    notify.success("Serviço criado com sucesso!");
    emit("created");
  } catch {
    notify.error("Erro ao criar serviço");
  } finally {
    loading.value = false;
  }
}

function closeModal() {
  emit("close");
}
</script>
