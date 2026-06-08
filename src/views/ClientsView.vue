<template>
  <div class="flex min-h-screen flex-col transition-colors" :class="isDark ? 'page-dark' : 'page-light'">
    <TopNav :empresa-nome="empresaNome" />

    <main class="page-shell mt-0 max-md:px-3 max-md:py-4 max-[480px]:px-2.5">
      <FiltersBar
        :ufList="ufs"
        :tipo="filters.tipo"
        :estado="filters.estado"
        @changeTipo="onChangeTipo"
        @changeEstado="onChangeEstado"
        @limpar="limparFiltros"
        @abrirCriar="abrirCriar"
      />

      <section class="mt-4" aria-label="Lista de clientes">
        <LoadingState v-if="loading" message="Carregando clientes..." />

        <ErrorState
          v-else-if="error"
          :message="error"
          @retry="carregarClientes"
        />

        <template v-else-if="filteredClients.length">
          <div
            class="grid grid-cols-1 gap-3.5 max-lg:grid-cols-2 max-md:gap-3 lg:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] xl:gap-4"
          >
            <ClientCard
              v-for="c in paginatedClients"
              :key="c.id"
              :cliente="c"
              @refresh="carregarClientes"
            />
          </div>

          <PaginationBar
            :page="page"
            :total-pages="totalPages"
            :range-start="rangeStart"
            :range-end="rangeEnd"
            :total-items="totalItems"
            @prev="prevPage"
            @next="nextPage"
          />
        </template>

        <EmptyState
          v-else
          icon="👥"
          title="Nenhum cliente encontrado"
          description="Ajuste os filtros ou crie um novo cliente para começar."
        />
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
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { useClientes } from "@/composables/useClientes";
import { usePagination } from "@/composables/usePagination";
import TopNav from "@/components/layout/TopNav.vue";
import FiltersBar from "@/components/clientes/FiltersBar.vue";
import ClientCard from "@/components/clientes/ClientCard.vue";
import CreateClientModal from "@/components/clientes/CreateClienteModal.vue";
import LoadingState from "@/components/common/LoadingState.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import ErrorState from "@/components/common/ErrorState.vue";
import PaginationBar from "@/components/common/PaginationBar.vue";

const auth = useAuthStore();
const themeStore = useThemeStore();
const { clientes, loading, error, carregarClientes } = useClientes();

const empresaNome = computed(() => auth.empresa?.nome ?? "Empresa");
const isDark = computed(() => themeStore.isDark);
const showModal = ref(false);

const filters = ref({
  tipo: "ALL",
  estado: "",
});

const ufs = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT",
  "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

const filteredClients = computed(() => {
  return clientes.value.filter((c) => {
    if (filters.value.tipo !== "ALL" && c.tipoPessoa !== filters.value.tipo) {
      return false;
    }

    if (
      filters.value.estado &&
      (!c.uf || c.uf.toUpperCase() !== filters.value.estado.toUpperCase())
    ) {
      return false;
    }

    return true;
  });
});

const {
  page,
  totalPages,
  paginatedItems: paginatedClients,
  totalItems,
  rangeStart,
  rangeEnd,
  nextPage,
  prevPage,
  resetPage,
} = usePagination(filteredClients, 12);

watch(filters, resetPage, { deep: true });

onMounted(() => {
  if (!auth.empresa) {
    auth.carregarEmpresa();
  }
  carregarClientes();
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
  await carregarClientes();
  closeModal();
}
</script>
