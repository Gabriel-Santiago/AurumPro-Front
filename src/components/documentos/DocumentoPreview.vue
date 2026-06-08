<template>
  <div class="preview-container">
    <div class="preview-header">
      <h4>Pré-visualização do Documento</h4>
      <div class="preview-actions">
        <button class="btn-refresh" type="button" :disabled="loading" @click="carregarDados">
          🔄 Atualizar
        </button>
        <div class="format-selector">
          <label class="format-option">
            <input v-model="visualizacao" type="radio" value="texto" :disabled="loading" />
            <span>Texto</span>
          </label>
          <label class="format-option">
            <input v-model="visualizacao" type="radio" value="visual" :disabled="loading" />
            <span>Visual</span>
          </label>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <span>Carregando documento...</span>
    </div>

    <div v-else-if="erro" class="error-container">
      <div class="error-icon">❌</div>
      <span>{{ erro }}</span>
      <button class="btn-retry" type="button" @click="carregarDados">Tentar novamente</button>
    </div>

    <div v-else-if="!documento" class="dados-nao-encontrados">
      <div class="aviso-icon">⚠️</div>
      <span>Não foi possível carregar os dados da proposta</span>
      <p class="aviso-descricao">A proposta pode não existir ou estar corrompida.</p>
      <button class="btn-retry" type="button" @click="carregarDados">Tentar novamente</button>
    </div>

    <div v-else class="preview-content" :class="{ 'texto-view': visualizacao === 'texto' }">
      <div v-if="visualizacao === 'texto'" class="texto-preview">
        <pre class="documento-texto">{{ conteudo || 'Conteúdo não disponível' }}</pre>
      </div>

      <div v-else class="visual-preview">
        <div class="documento-visual">
          <h1>TERMO DE PRESTAÇÃO DE SERVIÇOS</h1>

          <h2>1. Dados do Cliente Contratante</h2>
          <div v-if="documento.cliente">
            <div v-if="documento.cliente.tipoPessoa === 'PJ' && documento.cliente.responsavel">
              <p><strong>• Nome do Responsável:</strong> {{ documento.cliente.responsavel }}</p>
            </div>
            <p><strong>• Nome:</strong> {{ documento.cliente.nome }}</p>
            <p><strong>• CNPJ/CPF:</strong> {{ documentoClienteFormatado }}</p>
            <p><strong>• Telefone:</strong> {{ formatarTelefone(documento.cliente.telefone) }}</p>
            <p><strong>• E-mail:</strong> {{ documento.cliente.email }}</p>
          </div>

          <h2>2. Dados da Empresa Contratada</h2>
          <div v-if="documento.empresa">
            <p><strong>Empresa:</strong> {{ documento.empresa.nome }}</p>
            <p><strong>CNPJ:</strong> {{ formatarCNPJ(documento.empresa.cnpj) }}</p>
            <p><strong>Responsável:</strong> {{ documento.empresa.responsavel }}</p>
            <p><strong>Endereço:</strong> {{ enderecoEmpresa }}</p>
            <p><strong>Telefone:</strong> {{ formatarTelefone(documento.empresa.telefone) }}</p>
          </div>

          <h2>3. Serviços e Subserviços Contratados</h2>
          <div
            v-if="!documento.servicoList || documento.servicoList.length === 0"
            class="servicos-placeholder"
          >
            <p>Nenhum serviço contratado</p>
          </div>
          <div v-else class="servicos-info">
            <p>{{ documento.servicoList.length }} serviço(s) contratado(s)</p>
            <p>{{ documento.microServicoList?.length || 0 }} microserviço(s)</p>
          </div>

          <h2>4. Custos adicionais</h2>
          <div
            v-if="!documento.custoList || documento.custoList.length === 0"
            class="custos-placeholder"
          >
            <p>Nenhum custo adicional</p>
          </div>
          <div v-else class="custos-info">
            <p>{{ documento.custoList.length }} custo(s) adicional(is)</p>
          </div>

          <h2>5. Investimento</h2>
          <p><strong>• Valor proposto:</strong> R$ {{ formatarValor(documento.valorTotal) }}</p>
          <p><strong>• Forma de pagamento:</strong> ___________________________</p>
          <p><strong>• PIX para pagamento:</strong></p>

          <h2>6. Condições Gerais</h2>
          <p>O início do atendimento será a partir do dia: _________________________.</p>
          <p>{{ cidadeUfEmpresa }}, {{ dataAtualFormatada }}</p>

          <div class="assinaturas">
            <p><strong>Cliente:</strong> ___________________________________________</p>
            <p><strong>Consultor(a):</strong> {{ consultorNome }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";

const {
  documento,
  conteudo,
  loading,
  erro,
  visualizacao,
  consultorNome,
  documentoClienteFormatado,
  enderecoEmpresa,
  cidadeUfEmpresa,
  dataAtualFormatada,
  formatarValor,
  formatarTelefone,
  formatarCNPJ,
  carregarDados,
} = inject("documentoState");
</script>
