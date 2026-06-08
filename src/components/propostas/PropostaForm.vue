<template>
  <div v-if="step === 2" class="page">
    <div class="page-header">
      <h4>Atividades</h4>
      <button type="button" class="btn-add" @click="adicionarAtividade">
        + Adicionar Atividade
      </button>
    </div>

    <p class="page-subtitle">
      Cadastre as atividades que farão parte da execução da proposta.
    </p>

    <div v-if="form.atividades.length === 0" class="info-box">
      <p>Nenhuma atividade adicionada ainda.</p>
    </div>

    <div v-for="(atividade, index) in form.atividades" :key="index" class="item-container">
      <div class="item-header">
        <h5>Atividade {{ index + 1 }}</h5>
        <button type="button" class="btn-remove" @click="removerAtividade(index)">
          Remover
        </button>
      </div>

      <div class="form-group">
        <label>Nome da Atividade *</label>
        <input
          v-model="atividade.nome"
          placeholder="Ex: Reunião inicial, vistoria, execução do serviço"
        />
      </div>
    </div>
  </div>

  <div v-else-if="step === 5" class="page">
    <h4>Atribuir Colaborador</h4>
    <p class="page-subtitle">
      Selecione um colaborador para vincular à proposta (opcional)
    </p>

    <div class="form-group">
      <div class="radio-group">
        <label class="radio-option large">
          <input v-model="form.colaboradorSelecao" type="radio" value="NENHUM" />
          <div class="option-content">
            <span class="option-title">Não atribuir colaborador</span>
            <span class="option-description">
              A proposta será criada sem um colaborador específico
            </span>
          </div>
        </label>
        <label class="radio-option large">
          <input v-model="form.colaboradorSelecao" type="radio" value="SELECIONAR" />
          <div class="option-content">
            <span class="option-title">Selecionar um colaborador existente</span>
            <span class="option-description">
              Escolha entre os colaboradores já cadastrados
            </span>
          </div>
        </label>
      </div>
    </div>

    <div v-if="form.colaboradorSelecao === 'SELECIONAR'" class="colaborador-selection">
      <div class="form-group">
        <label>Selecione o Colaborador</label>
        <select v-model="form.colaboradorId" class="colaborador-select">
          <option value="">Selecione um colaborador</option>
          <option
            v-for="colaborador in colaboradores"
            :key="colaborador.id"
            :value="colaborador.id"
          >
            {{ colaborador.nome }}
            <span v-if="colaborador.funcao"> - {{ colaborador.funcao }}</span>
          </option>
        </select>
      </div>

      <div v-if="form.colaboradorId && colaboradorSelecionado" class="colaborador-info-card">
        <div class="colaborador-info-header">
          <h5>Colaborador Selecionado</h5>
        </div>
        <div class="colaborador-info-content">
          <div class="colaborador-info-row">
            <span class="label">Nome:</span>
            <span class="value">{{ colaboradorSelecionado.nome }}</span>
          </div>
          <div v-if="colaboradorSelecionado.funcao" class="colaborador-info-row">
            <span class="label">Função:</span>
            <span class="value">
              <span class="funcao-badge">{{ colaboradorSelecionado.funcao }}</span>
            </span>
          </div>
          <div v-if="colaboradorSelecionado.telefone" class="colaborador-info-row">
            <span class="label">Telefone:</span>
            <span class="value">{{ formatarTelefone(colaboradorSelecionado.telefone) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="info-box">
      <p>
        <strong>Nota:</strong> O colaborador é responsável pela execução ou acompanhamento da
        proposta. Se não for selecionado agora, a proposta poderá ser atribuída posteriormente.
      </p>
    </div>
  </div>

  <div v-else-if="step === 6" class="page">
    <h4>Origem do Cliente</h4>
    <p class="page-subtitle">
      Selecione como o cliente chegou à empresa (opcional)
    </p>

    <div class="form-group">
      <div class="radio-group">
        <label class="radio-option large">
          <input v-model="form.convenioSelecao" type="radio" value="NENHUM" />
          <div class="option-content">
            <span class="option-title">Não informar origem</span>
            <span class="option-description">
              A proposta será criada sem especificar a origem do cliente
            </span>
          </div>
        </label>
        <label class="radio-option large">
          <input v-model="form.convenioSelecao" type="radio" value="SELECIONAR" />
          <div class="option-content">
            <span class="option-title">Selecionar convênio/origem</span>
            <span class="option-description">
              Escolha um convênio existente para registrar a origem do cliente
            </span>
          </div>
        </label>
      </div>
    </div>

    <div v-if="form.convenioSelecao === 'SELECIONAR'" class="convenio-selection">
      <div class="form-group">
        <label>Selecione o Convênio/Origem</label>
        <select v-model="form.convenioId" class="convenio-select">
          <option value="">Selecione um convênio</option>
          <option v-for="convenio in convenios" :key="convenio.id" :value="convenio.id">
            {{ convenio.nome }}
            <span v-if="convenio.descricao"> - {{ convenio.descricao }}</span>
          </option>
        </select>
      </div>

      <div v-if="form.convenioId && convenioSelecionado" class="convenio-info-card">
        <div class="convenio-info-header">
          <h5>Convênio Selecionado</h5>
        </div>
        <div class="convenio-info-content">
          <div class="convenio-info-row">
            <span class="label">Nome:</span>
            <span class="value">{{ convenioSelecionado.nome }}</span>
          </div>
          <div v-if="convenioSelecionado.descricao" class="convenio-info-row">
            <span class="label">Descrição:</span>
            <span class="value">{{ convenioSelecionado.descricao }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="info-box">
      <p>
        <strong>Nota:</strong> O convênio/origem é apenas para registrar como o cliente chegou à
        empresa (ex: indicação, parceiro, etc.) e não afeta valores da proposta.
      </p>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";

defineProps({
  step: { type: Number, required: true },
});

const {
  form,
  colaboradores,
  convenios,
  colaboradorSelecionado,
  convenioSelecionado,
  adicionarAtividade,
  removerAtividade,
  formatarTelefone,
} = inject("propostaForm");
</script>
