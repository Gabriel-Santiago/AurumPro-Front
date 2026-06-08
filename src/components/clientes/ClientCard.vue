<template>
  <div
    class="relative flex items-center gap-3 rounded-[10px] border p-3 transition-all duration-300 hover:-translate-y-0.5 max-md:p-3.5 max-[480px]:p-3"
    :class="isDark
      ? 'border-border-dark-soft bg-surface-card-dark hover:border-border-dark hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
      : 'border-border-faint bg-surface-light hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]'"
  >
    <div
      class="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-avatar-gradient-from to-avatar-gradient-to text-sm font-bold max-[480px]:h-11 max-[480px]:w-11"
      :class="isDark ? 'text-surface-dark' : 'text-white'"
    >
      {{ initials }}
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-2 max-[640px]:items-center">
        <div
          class="flex-1 font-semibold transition-colors max-[640px]:text-[0.95rem]"
          :class="isDark ? 'text-aurum' : 'text-text-primary'"
        >
          {{ displayName }}
        </div>

        <div class="menu-wrapper relative">
          <button
            ref="menuButtonRef"
            type="button"
            class="cursor-pointer rounded px-2 py-1 text-xl transition-colors"
            :class="isDark
              ? 'text-text-subtle hover:bg-border-dark-soft'
              : 'text-text-muted hover:bg-[#f5f5f5]'"
            aria-label="Opções do cliente"
            aria-haspopup="menu"
            :aria-expanded="showMenu"
            @click="toggleMenu"
            @keydown="onMenuButtonKeydown"
          >
            ⋮
          </button>

          <div
            v-if="showMenu"
            ref="dropdownRef"
            class="absolute right-0 top-full z-[1000] min-w-[180px] overflow-hidden rounded-lg border shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            :class="isDark
              ? 'border-border-dark bg-surface-elevated-dark shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
              : 'border-border-light bg-surface-light'"
            role="menu"
            aria-label="Ações do cliente"
            @keydown="onDropdownKeydown"
          >
            <button
              type="button"
              role="menuitem"
              class="block w-full border-b px-3 py-2.5 text-left text-sm transition-colors"
              :class="isDark
                ? 'border-border-dark text-aurum hover:bg-border-dark-soft'
                : 'border-border-faint text-text-body hover:bg-surface-hover-light'"
              @click="openEmailTelefone"
            >
              Atualizar Email & Telefone
            </button>
            <button
              type="button"
              role="menuitem"
              class="block w-full border-b px-3 py-2.5 text-left text-sm transition-colors"
              :class="isDark
                ? 'border-border-dark text-aurum hover:bg-border-dark-soft'
                : 'border-border-faint text-text-body hover:bg-surface-hover-light'"
              @click="openEndereco"
            >
              Atualizar Endereço
            </button>
            <button
              type="button"
              role="menuitem"
              class="block w-full px-3 py-2.5 text-left text-sm transition-colors"
              :class="isDark
                ? 'text-danger-soft hover:bg-danger-bg-dark'
                : 'text-danger hover:bg-danger-bg'"
              @click="openDelete"
            >
              Excluir Cliente
            </button>
          </div>
        </div>
      </div>

      <div
        class="mt-1.5 flex flex-wrap items-center gap-1 text-[0.85rem] font-medium transition-colors"
        :class="isDark ? 'text-aurum' : 'text-text-primary'"
      >
        <span>{{ tipoPessoaText }} - {{ cliente.uf || 'N/A' }}</span>
      </div>

      <div class="mt-2.5 flex gap-2 max-[640px]:flex-col max-[640px]:gap-2">
        <button
          type="button"
          class="flex-1 rounded-md border px-2.5 py-1.5 text-[0.85rem] font-medium transition-all max-[640px]:w-full max-[640px]:py-3"
          :class="isDark
            ? 'border-[#4b5563] bg-[#374151] text-[#d1d5db] hover:bg-[#4b5563]'
            : 'border-[#d1d5db] bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb]'"
          @click="abrirDetalhesModal"
        >
          Detalhes
        </button>
        <button
          type="button"
          class="btn-aurum flex-1 !rounded-md !px-2.5 !py-1.5 !text-[0.85rem] max-[640px]:w-full max-[640px]:!py-3"
          @click="abrirPropostaModal"
        >
          Criar proposta
        </button>
      </div>
    </div>
  </div>

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

  <ClienteModal
    v-if="showDetalhesModal"
    :cliente="cliente"
    @close="fecharDetalhesModal"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useThemeStore } from "@/stores/themeStore";
import UpdateEmailTelefoneModal from "./UpdateEmailTelefoneModal.vue";
import UpdateEnderecoModal from "./UpdateEnderecoModal.vue";
import DeleteClienteModal from "./DeleteClienteModal.vue";
import CriarPropostaModal from "../propostas/PropostaModal.vue";
import ClienteModal from "./ClienteModal.vue";
import { notify } from "@/services/notificationService";

const props = defineProps({
  cliente: { type: Object, required: true },
});

const emit = defineEmits(["clienteAtualizado", "clienteExcluido", "refresh"]);

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);

const showMenu = ref(false);
const menuButtonRef = ref(null);
const dropdownRef = ref(null);

const showEmailTelefoneModal = ref(false);
const showEnderecoModal = ref(false);
const showDeleteModal = ref(false);
const showPropostaModal = ref(false);
const showDetalhesModal = ref(false);

const initials = computed(() => {
  const name = props.cliente.tipoPessoa === "PJ" ? props.cliente.responsavel : props.cliente.nome;
  if (!name) return "#";
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
});

const displayName = computed(() => {
  if (props.cliente.tipoPessoa === "PJ") {
    return props.cliente.responsavel || "Responsável não informado";
  }
  return props.cliente.nome || "Nome não informado";
});

const tipoPessoaText = computed(() => props.cliente.tipoPessoa || "#");

async function toggleMenu() {
  showMenu.value = !showMenu.value;

  if (showMenu.value) {
    await nextTick();
    const firstItem = dropdownRef.value?.querySelector('[role="menuitem"]');
    firstItem?.focus();
  }
}

function closeMenu() {
  showMenu.value = false;
  menuButtonRef.value?.focus();
}

function onMenuButtonKeydown(event) {
  if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (!showMenu.value) toggleMenu();
  }
  if (event.key === "Escape") closeMenu();
}

function onDropdownKeydown(event) {
  const items = [...(dropdownRef.value?.querySelectorAll('[role="menuitem"]') ?? [])];
  const currentIndex = items.indexOf(document.activeElement);

  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu();
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    items[(currentIndex + 1) % items.length]?.focus();
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    items[(currentIndex - 1 + items.length) % items.length]?.focus();
  }

  if (event.key === "Tab") closeMenu();
}

function openEmailTelefone() {
  showEmailTelefoneModal.value = true;
  closeMenu();
}

function openEndereco() {
  showEnderecoModal.value = true;
  closeMenu();
}

function openDelete() {
  showDeleteModal.value = true;
  closeMenu();
}

function abrirPropostaModal() {
  showPropostaModal.value = true;
}

function abrirDetalhesModal() {
  showDetalhesModal.value = true;
}

function closeEmailTelefoneModal() {
  showEmailTelefoneModal.value = false;
}

function closeEnderecoModal() {
  showEnderecoModal.value = false;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
}

function fecharPropostaModal() {
  showPropostaModal.value = false;
}

function fecharDetalhesModal() {
  showDetalhesModal.value = false;
}

function handleClienteUpdated() {
  emit("clienteAtualizado");
  emit("refresh");
}

function handleClienteDeleted() {
  emit("clienteExcluido");
  emit("refresh");
}

function handleClickOutside(event) {
  if (!event.target.closest(".menu-wrapper")) {
    closeMenu();
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

function handlePropostaCriada() {
  notify.success("Proposta criada com sucesso!");
  fecharPropostaModal();
  emit("propostaCriada");
  emit("refresh");
}
</script>
