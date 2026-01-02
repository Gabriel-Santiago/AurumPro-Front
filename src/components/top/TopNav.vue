<template>
  <header class="top-nav" :class="theme">
    <div class="left">
      <h2 class="empresa">{{ empresaNome }}</h2>
    </div>

    <nav class="right">
      <div class="nav-item">
        <button class="nav-btn" @click="abrirColaboradorModal">Colaborador</button>
        <Tooltip 
          content="Gerencie profissionais que atendem os clientes"
          position="bottom"
          :maxWidth="'180px'"
        />
      </div>

      <div class="nav-item">
        <button class="nav-btn" @click="abrirServicoModal">Serviços</button>
        <Tooltip 
          content="Crie e organize os serviços oferecidos pela empresa"
          position="bottom"
          :maxWidth="'180px'"
        />
      </div>

      <div class="nav-item">
        <button class="nav-btn" @click="abrirSubservicoModal">Sub Serviços</button>
        <Tooltip 
          content="Detalhe serviços em subcategorias específicas"
          position="bottom"
          :maxWidth="'180px'"
        />
      </div>

      <div class="nav-item">
        <button class="nav-btn" @click="abrirConvenioModal">Convênios</button>
        <Tooltip 
          content="Gerencie parcerias e convênios com outras empresas"
          position="bottom"
          :maxWidth="'180px'"
        />
      </div>

      <div class="nav-item">
        <button class="nav-btn" @click="irParaFinancas">Resumo Financeiro</button>
        <Tooltip 
          content="Visualize relatórios financeiros e fluxo de caixa"
          position="bottom"
          :maxWidth="'180px'"
        />
      </div>

      <div class="nav-item">
        <button class="icon-btn theme-toggle" :title="theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'" @click="$emit('toggleTheme')">
          {{ theme === 'dark' ? '☀️' : '🌙' }}
        </button>
        <Tooltip 
          content="Altere para modo claro ou escuro"
          position="bottom"
          :maxWidth="'180px'"
        />
      </div>

      <div class="nav-item">
        <button class="icon-btn logout" title="Logout" @click="$emit('logout')">⎋</button>
      </div>
    </nav>

    <CriarColaboradorModal
      v-if="showColaboradorModal"
      @close="fecharColaboradorModal"
      @created="handleCreated"
    />

    <CriarServicoModal
      v-if="showServicoModal"
      @close="fecharServicoModal"
      @created="handleCreated"
    />

    <CriarSubservicoModal
      v-if="showSubservicoModal"
      @close="fecharSubservicoModal"
      @created="handleCreated"
    />

    <CriarConvenioModal
      v-if="showConvenioModal"
      @close="fecharConvenioModal"
      @created="handleCreated"
    />

  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '../../store/themeStore';
import CriarColaboradorModal from '../componentes/ColaboradorModal.vue';
import CriarServicoModal from '../componentes/ServicoModal.vue';
import CriarSubservicoModal from '../componentes/SubservicoModal.vue';
import CriarConvenioModal from '../componentes/ConvenioModal.vue';
import Tooltip from '../componentes/Tooltip.vue'; // Importe o componente Tooltip

defineProps({
  empresaNome: { type: String, default: "Empresa" }
});

defineEmits(['abrirColaborador', 'abrirServicos', 'abrirSubServicos', 'abrirConvenios', 'goPropostas', 'logout', 'toggleTheme']);

const themeStore = useThemeStore();
const theme = computed(() => themeStore.theme);

const showColaboradorModal = ref(false);
const showServicoModal = ref(false);
const showSubservicoModal = ref(false);
const showConvenioModal = ref(false);

const router = useRouter();

const irParaFinancas = () => {
  router.push('/financas');
};

const abrirColaboradorModal = () => {
  showColaboradorModal.value = true;
};

const abrirServicoModal = () => {
  showServicoModal.value = true;
};

const abrirSubservicoModal = () => {
  showSubservicoModal.value = true;
};

const abrirConvenioModal = () => {
  showConvenioModal.value = true;
};

const fecharColaboradorModal = () => {
  showColaboradorModal.value = false;
};

const fecharServicoModal = () => {
  showServicoModal.value = false;
};

const fecharSubservicoModal = () => {
  showSubservicoModal.value = false;
};

const fecharConvenioModal = () => {
  showConvenioModal.value = false;
};

const handleCreated = () => {
};

</script>

<style scoped>
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  transition: all 0.3s ease;
}

.top-nav.light {
  border-bottom: 1px solid #eee;
  background: #fff;
}

.top-nav.light .empresa {
  color: #111;
}

.top-nav.dark {
  border-bottom: 1px solid #333;
  background: #1a1a1a;
}

.top-nav.dark .empresa {
  color: #daa520;
}

.empresa {
  margin: 0;
  font-size: 1.05rem;
  transition: color 0.3s ease;
}

.right { 
  display:flex; 
  gap: 16px; 
  align-items:center; 
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.nav-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: .95rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.top-nav.light .nav-btn {
  color: #111;
}

.top-nav.light .nav-btn:hover { 
  background: #f3f4f6; 
}

.top-nav.dark .nav-btn {
  color: #daa520;
}

.top-nav.dark .nav-btn:hover { 
  background: #333; 
}

.icon-btn {
  background: #111;
  color: #fff;
  border: none;
  width:36px;
  height:36px;
  border-radius: 8px;
  cursor: pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  transition: all 0.3s ease;
}

.top-nav.light .icon-btn.logout { 
  background: transparent; 
  color: #f33; 
  border: 1px solid #f3f3f3; 
}

.top-nav.dark .icon-btn.logout { 
  background: transparent; 
  color: #ff6b6b; 
  border: 1px solid #333; 
}

.top-nav.dark .icon-btn.logout:hover { 
  background: #333; 
}

.icon-btn.theme-toggle {
  background: transparent;
  border: 1px solid;
  font-size: 1.1rem;
}

.top-nav.light .icon-btn.theme-toggle {
  border-color: #ddd;
  color: #666;
}

.top-nav.dark .icon-btn.theme-toggle {
  border-color: #444;
  color: #daa520;
}

@media (max-width: 1024px) {
  .right {
    gap: 12px;
  }
  
  .nav-btn {
    padding: 6px 10px;
    font-size: 0.9rem;
  }
  
  .nav-item {
    gap: 4px;
  }
}

@media (max-width: 768px) {
  .top-nav {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .right {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  
  .nav-item {
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  
  .nav-btn {
    padding: 6px 8px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .nav-btn {
    font-size: 0.8rem;
    padding: 5px 7px;
  }
  
  .icon-btn {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
}
</style>