<template>
  <div class="card" :class="theme">
    <div class="avatar" :class="cliente.tipoPessoa">
      {{ initials }}
    </div>

    <div class="info">
      <div class="top">
        <div class="name">{{ cliente.nome }}</div>
        
        <div class="menu-wrapper">
          <button class="menu-btn" @click="toggleMenu">
            ⋮
          </button>

          <div v-if="showMenu" class="dropdown" :class="theme">
            <div @click="openEmailTelefone">Atualizar Email & Telefone</div>
            <div @click="openEndereco">Atualizar Endereço</div>
            <div class="delete" @click="openDelete">Excluir Cliente</div>
          </div>
        </div>
      </div>

      <div class="meta">
        <span class="tipo-estado">{{ tipoPessoaText }} - {{ cliente.uf || 'N/A' }}</span>
      </div>

      <div class="actions">
        <button class="proposal" @click="abrirPropostaModal">Criar proposta</button>
      </div>
    </div>
  </div>

  <!-- Modais -->
    <UpdateEmailTelefoneModal
      v-if="showEmailTelefoneModal"
      :cliente="cliente"
      @close="closeEmailTelefoneModal"
      @updated="handleClienteUpdated"
    />

    <UpdateEnderecoModal
      v-if="showEnderecoModal"
      :cliente="cliente"
      @close="closeEnderecoModal"
      @updated="handleClienteUpdated"
    />

    <DeleteClienteModal
      v-if="showDeleteModal"
      :cliente="cliente"
      @close="closeDeleteModal"
      @deleted="handleClienteDeleted"
    />

    <CriarPropostaModal
      v-if="showPropostaModal"
      :cliente="cliente"
      @close="fecharPropostaModal"
      @created="handlePropostaCriada"
    />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useThemeStore } from "../../store/themeStore";
import UpdateEmailTelefoneModal from "./UpdateEmailTelefoneModal.vue";
import UpdateEnderecoModal from "./UpdateEnderecoModal.vue";
import DeleteClienteModal from "./DeleteClienteModal.vue";
import CriarPropostaModal from "../componentes/PropostaModal.vue"

const props = defineProps({
  cliente: { type: Object, required: true }
});

// Adicione o evento 'refresh' para forçar recarregamento
const emit = defineEmits(["criarProposta", "clienteAtualizado", "clienteExcluido", "refresh"]);

const themeStore = useThemeStore();
const theme = computed(() => themeStore.theme);

// Menu
const showMenu = ref(false);

// Modais
const showEmailTelefoneModal = ref(false);
const showEnderecoModal = ref(false);
const showDeleteModal = ref(false);
const showPropostaModal = ref(false);

// Iniciais do nome para o avatar
const initials = computed(() => {
  if (!props.cliente.nome) return "#";
  return props.cliente.nome
    .split(" ")
    .map(s => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
});

// Texto para mostrar "PF - Estado" ou "PJ - Estado"
const tipoPessoaText = computed(() => {
  return props.cliente.tipoPessoa || "#";
});

// Menu functions
const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const closeMenu = () => {
  showMenu.value = false;
};

const openEmailTelefone = () => {
  showEmailTelefoneModal.value = true;
  closeMenu();
};

const openEndereco = () => {
  showEnderecoModal.value = true;
  closeMenu();
};

const openDelete = () => {
  showDeleteModal.value = true;
  closeMenu();
};

const abrirPropostaModal = () => {
  showPropostaModal.value = true;
};

// Modal close functions
const closeEmailTelefoneModal = () => {
  showEmailTelefoneModal.value = false;
};

const closeEnderecoModal = () => {
  showEnderecoModal.value = false;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

const fecharPropostaModal = () => {
  showPropostaModal.value = false;
};

// Handle modal events - AGORA EMITE 'refresh'
const handleClienteUpdated = () => {
  emit("clienteAtualizado");
  emit("refresh"); // Força recarregamento
};

const handleClienteDeleted = () => {
  emit("clienteExcluido");
  emit("refresh"); // Força recarregamento
};

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.menu-wrapper')) {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handlePropostaCriada = () => {
  console.log("Proposta criada com sucesso!");
  fecharPropostaModal();
  emit("propostaCriada");
  emit("refresh"); // Adicione se precisar atualizar a lista
}

</script>

<style scoped>
.card {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid;
  transition: all 0.3s ease;
  position: relative;
}

/* Modo Claro */
.card.light {
  background: #fff;
  border-color: #f0f0f0;
}

/* Modo Escuro */
.card.dark {
  background: #1a1a1a;
  border-color: #333;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.card.light .avatar {
  background: #daa520;
  color: #fff;
}

.card.dark .avatar {
  background: #daa520;
  color: #111;
}

.avatar.PF { 
  background: linear-gradient(135deg, #f6d365, #fda085) !important; 
}
.avatar.PJ { 
  background: linear-gradient(135deg, #f6d365, #fda085) !important; 
}

.info { 
  flex: 1; 
  min-width: 0;
}

.top { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start;
  gap: 8px;
}

.name { 
  font-weight: 600;
  transition: color 0.3s ease;
  flex: 1;
}

.card.light .name {
  color: #111;
}

.card.dark .name {
  color: #daa520;
}

.meta { 
  font-size: .85rem; 
  margin-top: 6px;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.card.light .meta {
  color: #111;
}

.card.dark .meta {
  color: #daa520;
}

.tipo-estado {
  font-weight: 500;
}

.actions { 
  margin-top: 10px; 
}

.proposal {
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.card.light .proposal {
  background: #daa520;
  color: #fff;
}

.card.light .proposal:hover {
  background: #e6b800;
  transform: translateY(-1px);
}

.card.dark .proposal {
  background: #daa520;
  color: #111;
}

.card.dark .proposal:hover {
  background: #e6b800;
  box-shadow: 0 2px 8px rgba(218, 165, 32, 0.3);
}

/* Menu Styles */
.menu-wrapper {
  position: relative;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.card.light .menu-btn {
  color: #666;
}

.card.light .menu-btn:hover {
  background: #f5f5f5;
}

.card.dark .menu-btn {
  color: #888;
}

.card.dark .menu-btn:hover {
  background: #333;
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 180px;
  overflow: hidden;
}

.card.dark .dropdown {
  background: #2a2a2a;
  border-color: #444;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dropdown div {
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
}

.card.dark .dropdown div {
  border-bottom-color: #444;
  color: #daa520;
}

.card.light .dropdown div {
  color: #333;
}

.dropdown div:hover {
  background: #f8f9fa;
}

.card.dark .dropdown div:hover {
  background: #333;
}

.dropdown div:last-child {
  border-bottom: none;
}

.dropdown .delete {
  color: #e53e3e;
}

.card.dark .dropdown .delete {
  color: #fc8181;
}

.dropdown .delete:hover {
  background: #fed7d7;
}

.card.dark .dropdown .delete:hover {
  background: #742a2a;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card.dark:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-color: #444;
}
</style>