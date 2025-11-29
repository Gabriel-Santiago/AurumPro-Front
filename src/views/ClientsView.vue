<template>
  <div class="page-container" :class="theme">
    <TopNav
      :empresaNome="empresaNome"
      @logout="handleLogout"
      @goPropostas="goPropostas"
      @toggleTheme="toggleTheme"
    />

    <main class="main-area">
      <FiltersBar
        :ufList="ufs"
        :tipo="filters.tipo"
        :estado="filters.estado"
        @changeTipo="onChangeTipo"
        @changeEstado="onChangeEstado"
        @limpar="limparFiltros"
        @abrirCriar="abrirCriar"
      />

      <section class="clients-area">
        <div class="clients-grid">
          <ClientCard
            v-for="c in filteredClients"
            :key="c.id"
            :cliente="c"
            @criarProposta="() => criarProposta(c)"
            @refresh="fetchClients"
          />
        </div>

        <div v-if="loading" class="empty">Carregando...</div>
        <div v-else-if="!filteredClients.length" class="empty">Nenhum cliente encontrado.</div>
      </section>
    </main>

    <CreateClientModal
      v-if="showModal"
      @close="closeModal"
      @created="onCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import TopNav from "../components/top/TopNav.vue";
import FiltersBar from "../components/clients/FiltersBar.vue";
import ClientCard from "../components/clients/ClientCard.vue";
import CreateClientModal from "../components/clients/CreateClienteModal.vue";
import clientService from "../services/clientServices.js";
import router from "../router/index.js";

const auth = useAuthStore();
const themeStore = useThemeStore();

if (!auth.empresa){
    router.push("/")
}

const empresaId = auth.empresa.empresaId;
const empresaNome = auth.empresa.nome;
const clients = ref([]);
const loading = ref(false);
const showModal = ref(false);

const filters = ref({
  tipo: "ALL", 
  estado: "" 
});

const ufs = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const theme = computed(() => themeStore.theme);

const fetchClients = async () => {
  loading.value = true;
  try {
    const res = await clientService.listarTodos(empresaId);
    clients.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Erro ao buscar clientes", err);
    clients.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchClients);

const filteredClients = computed(() => {
  return clients.value.filter(c => {

    // filtro tipo
    if (filters.value.tipo !== "ALL") {
      if (c.tipoPessoa !== filters.value.tipo) return false;
    }

    // filtro UF
    if (filters.value.estado) {
      if (!c.uf || c.uf.toUpperCase() !== filters.value.estado.toUpperCase()) {
        return false;
      }
    }

    return true;
  });
});


function onChangeTipo(tipo) {
  filters.value.tipo = tipo;
}

function onChangeEstado(estado) {
  filters.value.estado = estado;
}

function limparFiltros() {
  filters.value.tipo = "ALL";
  filters.value.estado = "";
}

function abrirCriar() {
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function onCreated() {
  await fetchClients();
  closeModal();
}

function criarProposta(cliente) {
  console.log("Criar proposta para", cliente);
}

function handleLogout() {
  // Limpa os dados de autenticação
  auth.logout();
  
  // Redireciona para a página de login
  router.push("/");
}

function goPropostas() {
  console.log("Ir para propostas");
}

function toggleTheme() {
  themeStore.toggleTheme();
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  transition: all 0.3s ease;
}

/* Modo Claro (padrão) */
.page-container.light {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  color: #111;
}

/* Modo Escuro */
.page-container.dark {
  background: linear-gradient(180deg, #111 0%, #1a1a1a 100%);
  color: #daa520;
}

.main-area {
  width: 100%;
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 20px;
}

.clients-area {
  margin-top: 18px;
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.empty {
  text-align: center;
  padding: 40px 0;
  transition: color 0.3s ease;
}

/* Modo Claro */
.page-container.light .empty {
  color: #666;
}

/* Modo Escuro */
.page-container.dark .empty {
  color: #daa520;
}
</style>